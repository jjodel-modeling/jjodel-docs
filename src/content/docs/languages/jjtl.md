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

## Helper functions

Helpers are named, reusable JjEL expressions:

```jjtl
helper formatLabel(name: String, prefix: String) -> String {
    prefix + "_" + name.snakeCase()
}
```

Helpers are registered in the evaluation context and callable from any expression within the transformation.

## Trace model

JjTL automatically records a trace model during execution, linking each source element to its target element(s):

- **Rule-level trace**: which class mapping produced which target instance
- **Binding-level trace**: for each attribute mapping, the source value, target value, expression used, and whether the mapping is invertible

### Invertibility

JjTL automatically classifies each attribute mapping:

- Direct mappings (`b := a`): always invertible
- Value mappings (`true=1, false=0`): invertible if the mapping is injective
- Expression mappings: invertible only for simple property references; function calls are marked non-invertible

The Trace View in the Transformation Editor displays this information for each mapping.

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

## Execution model

The JjTL executor follows a pipeline for each class mapping:

1. **Match**: find all source instances of the matching type
2. **Guard**: filter through the `where` condition
3. **Create**: instantiate target elements
4. **Bind**: evaluate attribute mappings and assign values
5. **Trace**: record the trace link with invertibility information

Each rule is processed atomically (match, create, bind). There is no two-phase execution like ATL.

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

```
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
