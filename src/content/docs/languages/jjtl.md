---
title: JjTL Reference
description: Complete reference for the Jjodel Transformation Language.
sidebar:
  order: 3
---

JjTL is a declarative, rule-based Model-to-Model transformation language. It uses JjEL as its expression sub-language and produces automatic traceability for every transformation.

## Transformation structure

A JjTL transformation declares its name, source metamodel, target metamodel, and a set of class mappings:

```jjtl title="JjTL"
transformation StateMachine2PetriNet

from StateMachineMM
to   PetriNetMM

State -> Place {
    tokens := if isInitial then 1 else 0
}

Transition -> Transition {
    name := name
}
```

The `from` and `to` headers reference metamodels loaded in the current project. The executor matches source instances by class name and creates target instances according to the mappings.

## Class mappings

A class mapping specifies a correspondence between source and target classes:

```jjtl
SourceClass -> TargetClass [multiplicity] where { guard } {
    attributeMappings...
}
```

The `->` arrow connects source to target at the class level. Everything inside the braces defines how attributes are mapped.

### Guard conditions

The `where` clause filters which source instances are transformed. The guard is a JjEL expression evaluated with the source instance as implicit context:

```jjtl
Class -> Table where { not isAbstract and attributes.isNotEmpty } {
    ...
}
```

Property access is unqualified: `isAbstract` refers to the source element's `isAbstract` property directly.

### Multiplicity

Multiplicity controls how many target instances are created per source instance:

- No multiplicity: one-to-one (default)
- `[*]`: unbounded
- `[n]`: exactly n per source
- `[m..n]`: between m and n

### Multi-source mappings

Multiple source classes can be combined with aliases:

```jjtl
ClassA a, ClassB b -> MergedClass where { a.name == b.name } {
    name := a.name
    description := b.description
}
```

## Attribute mappings

### Direct mapping

The `:=` operator copies or computes a value for a target attribute:

```jjtl
tableName := name
```

### Expression mapping

Arbitrary JjEL expressions compute the target value:

```jjtl
tableName := name.snakeCase()
columnDefs := forall a in attributes: a.name + " " + a.type.toUpper()
```

### Value mapping (enum conversion)

Discrete value conversions use the `:` separator with comma-separated pairs:

```jjtl
tokens := isInitial : true=1, false=0
code := status : "active"=1, "inactive"=0, "deleted"=-1
```

Unmapped values pass through unchanged.

### Arrow syntax (alternative)

As an alternative to `:=`, JjTL also supports the `->` arrow for attribute bindings:

```jjtl
name -> tableName
name -> tableName : name.snakeCase()
isInitial -> tokens : true=1, false=0
```

The `->` syntax reads as "source maps to target". Both syntaxes are interchangeable. `:=` is preferred for its brevity.

### Object creation

Nested target objects are created inline with `->`:

```jjtl
-> inputArcs {
    -> Arc {
        source := place
        weight := 1
    }
}
```

### forall in mappings

The `forall` construct iterates over collections to create multiple target objects:

```jjtl
-> fields {
    forall a in attributes such that not a.isDerived
    -> Field {
        name := a.name.camelCase()
        type := a.type
    }
}
```

## Execution model

JjTL uses a two-pass execution strategy. This design eliminates dependency on rule declaration order: you can write rules in any order and cross-type references will resolve correctly.

### Pass 1: create and trace

The executor processes each class mapping rule in sequence:

1. Find all source model instances that match the rule's source type
2. Evaluate the `where` guard (if present) using only source element features
3. For each matching instance, create an empty target element of the specified target type
4. Record a trace entry: `(rule, sourceElement) → targetElement`

After Pass 1 completes, all target elements exist and the trace model is fully populated. No attribute values have been set yet.

### Pass 2: bind

The executor iterates through the trace model:

1. For each `(rule, source, target)` triple, evaluate all attribute bindings (`:=`)
2. Each binding's right-hand side is evaluated in the context of the source element
3. If the RHS value is a source element, cross-type resolution kicks in (see below)
4. The resolved value is assigned to the target element's feature

Because all target elements already exist when Pass 2 runs, cross-type references always resolve. A `State -> Place` rule and a `Transition -> Transition` rule work regardless of which is declared first.

### Guard evaluation

Guards are evaluated during Pass 1. This means they can only access features of the source element, not values computed by bindings. This is a deliberate constraint: guards filter source elements before any target element exists.

```jjtl
State -> Place where isInitial {
    tokens := 1
}

State -> Place where not isInitial {
    tokens := 0
}
```

You can write the same logic more concisely with a conditional expression in the binding:

```jjtl
State -> Place {
    tokens := if isInitial then 1 else 0
}
```

## Cross-type resolution

When a binding's RHS evaluates to a source element (not a primitive value), the executor automatically resolves it to the corresponding target element via the trace model. This is called cross-type resolution.

### Implicit resolution

If the source type has exactly one class mapping rule, resolution is automatic:

```jjtl
State -> Place {
    tokens := if isInitial then 1 else 0
}

Transition -> Transition {
    outputPlace := nextState
}
```

Here `nextState` is a reference to a `State` instance. Since there is exactly one rule mapping `State` to `Place`, the executor resolves `nextState` to the corresponding `Place` instance automatically.

The resolution works element-wise on collections too. If `nextState` were a collection of States, each would be resolved to its corresponding Place.

### Ambiguity error

If the source type has multiple rules (for example, two rules mapping `State` to different target types), implicit resolution fails with a clear error message. In this case, use explicit resolution.

### Explicit resolution with `resolve`

The `resolve` keyword disambiguates when multiple rules map the same source type:

```jjtl
State -> Place { ... }
State -> Node  { ... }

Transition -> Edge {
    source := resolve(fromState, Place)
    target := resolve(toState, Node)
}
```

`resolve(expr, TargetType)` looks up the trace for a rule that maps the source element to the specified target type. If no such rule exists, it raises a runtime error.

Without the second argument, `resolve(expr)` behaves like implicit resolution (fails on ambiguity).

## The `parent` keyword

`parent` accesses the containing element (eContainer) of a source instance. In metamodeling terms, if element B is contained inside element A via a composition reference, then `B.parent` returns `A`.

```jjtl
Transition -> Transition {
    inputPlace := parent
}
```

In a state machine metamodel where Transitions are contained inside their source State, `parent` returns that State. Because cross-type resolution applies to `parent` like any other value, the State is automatically resolved to the corresponding Place (if a `State -> Place` rule exists).

`parent` returns `null` for root elements (elements not contained in any other element). You can chain `parent` navigation: `parent.parent` returns the grandparent.

`parent` is available both in JjTL bindings and in JjEL expressions (`data.parent`, `data.parent.name`).

:::caution
`parent` requires a stored `_containerId` field on each element. Existing projects created before this feature may need to be re-saved to populate containment information.
:::

## Trace model

The trace model is a map from `(ruleName, sourceElementId)` to `targetElement`. It is populated during Pass 1 and read during Pass 2.

The trace model enables:
- Cross-type resolution (looking up which target element corresponds to a source element)
- Debugging (inspecting which source element produced which target element)
- Future: bidirectional transformations and incremental updates

The trace model is currently not persisted. It exists only during transformation execution.

### Invertibility

JjTL automatically classifies each attribute mapping:

- Direct mappings (`b := a`): always invertible
- Value mappings (`true=1, false=0`): invertible if the mapping is injective
- Expression mappings: invertible only for simple property references; function calls are marked non-invertible

The Trace View in the Transformation Editor displays this information for each mapping.

## Known limitations

The following limitations apply to the current implementation. They are tracked as bugs or planned features.

**Reference materialization**: references between target instances (for example, `outputPlace` pointing from a Transition to a Place) are created in the executor but may not always be correctly materialized in the target model's persistence layer. This is being fixed.

**Duplicate reference values**: in some cases, a reference binding produces duplicate copies of the target element instead of a single reference. The root cause is in the `extractAttributeValues` function reading the same value at multiple nesting levels. This is being fixed.

**`name := name` binding**: assigning the source element's `name` to the target element's `name` feature currently does not update the target element's display name (the `DObject.name` property). The user-defined feature `name` and the internal `DObject.name` may be separate concepts. Under investigation.

**No `resolve` for collections**: `resolve(collection, Type)` is not yet supported as a single call. Use `forall` to resolve each element individually.

## Helper functions

Helpers are named, reusable JjEL expressions:

```jjtl
helper formatLabel(name: String, prefix: String) -> String {
    prefix + "_" + name.snakeCase()
}
```

Helpers are registered in the evaluation context and callable from any expression within the transformation.

## Interactive features

JjTL supports user interaction during execution via JjModal commands:

```jjtl
Class -> Table where { not isAbstract } {
    name := prompt('Table prefix', EString, "tbl_") + name.snakeCase()
}
```

Two commands are available:

| Command | Returns | Use |
|---------|---------|-----|
| `prompt(label, type, default?)` | typed value or null | Ask the user for a value |
| `confirm(label)` | boolean | Ask for a yes/no decision |

These enable semi-automated transformations where certain decisions require human input.

### Let bindings

The `let` construct binds the result of a prompt (or any expression) to a variable, avoiding repeated dialogs:

```jjtl
Class -> Table where { not isAbstract } {
    let $prefix = prompt('Column prefix', EString, 'col_') in {
        name  := $prefix + name.snakeCase()
        label := $prefix + name.toUpper()
    }
}
```

Variables use the `$` prefix to distinguish them from metamodel properties. Multiple bindings are comma-separated and evaluated left-to-right:

```jjtl
let $prefix = prompt('Prefix', EString, 'tbl_'),
    $suffix = prompt('Suffix', EString, '') in {
    name := $prefix + name.snakeCase() + $suffix
}
```

## Complete example

State Machine to Petri Net:

```jjtl title="JjTL"
transformation StateMachine2PetriNet

from StateMachineMM
to   PetriNetMM

State -> Place {
    tokens := if isInitial then 1 else 0
}

Transition -> Transition {
    name := label

    -> inputArcs {
        -> Arc {
            source := source
            weight := 1
        }
    }

    -> outputArcs {
        -> Arc {
            target := target
            weight := 1
        }
    }
}
```

## Grammar summary

```text title="EBNF"
transformation = 'transformation' IDENT
                 'from' IDENT
                 'to'   IDENT
                 (classMapping | helper)*

classMapping   = sourcePatterns '->' IDENT
                 ('[' multiplicity ']')?
                 ('where' '{' jjelExpression '}')?
                 '{' mappingBody '}'

attributeMapping = IDENT ':=' jjelExpression
                 | IDENT '->' IDENT (':' jjelExpression)?

objectCreation = '->' IDENT? '{' mappingBody '}'

helper         = 'helper' IDENT '(' paramList ')' '->' IDENT
                 '{' jjelExpression '}'
```
