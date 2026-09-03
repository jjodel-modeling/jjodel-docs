---
title: Jjodel Object Model (JjOM)
description: The runtime framework that represents all modeling artifacts in Jjodel.
sidebar:
  order: 1
---

The Jjodel Object Model (JjOM) is the reflective runtime representation of all modeling artifacts within Jjodel. It is a formal and runtime representation of the elements that make up a model, including their types, relationships, and values. The JjOM is structured according to the metamodel defined by the user, is JSON-serializable, and can be inspected and edited at runtime.

The JjOM serves as the semantic backbone of any model and is the unifying substrate across all viewpoints. Jjodel interprets it for rendering views, applying validation rules, and driving simulation logic.

## Three Submodels: Data, Node, View

The JjOM organizes data across three interconnected submodels:

| Submodel | Purpose | Examples |
|----------|---------|----------|
| **Data** | Represents core modeling artifacts (classes, attributes, references, instances) | DClass, DObject, DAttribute, DReference |
| **Node** | Manages layout and positional data | Coordinates, geometry, visual state |
| **View** | Defines visual syntax and rendering | JSX-based view templates |

**Data** encodes the abstract syntax of a model: the elements, their attribute values, and their references. This is the semantic content of your model. When you create an Entity with attributes in an ER diagram, the data submodel stores those elements and their properties.

**Node** encodes all layout information: position, dimensions, edge routing, and visual state. This is the presentation layer. When you drag an element on the canvas, only the node submodel changes; the data remains untouched.

**View** defines how model elements are rendered visually. It contains the JSX-based templates, predicates, and styling rules that map abstract syntax to concrete syntax. Each viewpoint produces a view submodel that determines what the user sees on the canvas.

The separation of data, node, and view is architecturally significant. It enables layout-sensitive notations where the spatial position of elements contributes to meaning (e.g., railway track plans, PCB layouts), while keeping the semantic content independent of any specific visual arrangement. In Jjodel, layout is not decoration; it is a first-class dimension of meaning that can carry semantic weight.

## Architectural Context

The JjOM sits at the center of Jjodel's architecture, connecting the front-end and back-end:

- **Front-end**: React 18 and TypeScript, with Redux as the object store and Vite as the bundler
- **Back-end**: a .NET service that persists projects and serves them back
- **Object store**: the single store every editor reads and writes, which is what keeps the canvas, the tree, and the tables on the same data

The JjOM provides a unified API to query, edit, and synchronize models, their layout, and their visual representation. An analogy from the web domain: the JjOM plays a role similar to the Document Object Model (DOM), but for modeling artifacts instead of HTML documents.


## Notation Architecture

The JjOM connects metamodels to their visual representation through a Notation structure. A Notation is a named entity associated with exactly one metamodel through a `definedBy` relationship. The notation holds the complete specification of how model elements are rendered, validated, and behave.

### Notation, Viewpoints, and Views

The notation architecture follows a three-level hierarchy:

A **Notation** (e.g., "State Machine Notation") is owned by a metamodel. It contains zero or more viewpoints.

A **Viewpoint** groups a family of related views. Its type decides how it composes: a **Syntax** viewpoint is exclusive, so only one is active at a time, while **Decoration**, **Validation**, **Semantics**, and **Editor behavior** viewpoints are overlays that layer on top of it. See [Viewpoints](../../user-guide/viewpoints).

A **View** targets instances of a specific metaclass. Each view has up to four components:

| Component | Purpose | How it is written |
|-----------|---------|-------------------|
| Predicate | Selects which instances the view applies to | `oclCondition` in OCL, or `jsCondition` in JavaScript |
| Structure | Says what the element draws | A declarative record since 3.0, a JSX template before it |
| Style | Controls appearance | Fields of the record, or an SCSS block for a JSX template |
| Events | Reacts to changes and drives behavior | ECA rules in JavaScript |

Views written as JSX templates keep working; the [View Designer](../../user-guide/view-designer) authors the declarative form.

### How Views Connect to Models

A View's predicate **selects** model instances: the predicate evaluates against each instance and returns true for those the view should render. The selected instances become **Nodes** in the concrete syntax layer. Each Node carries its own layout and state information.

The predicate is the mechanism that defines the syntactic mapping (σ) from the formal language definition. Given a model (abstract syntax) and a set of views with predicates, σ determines which instances get which visual representations.

### Queries in Templates

Templates can contain **queries** that navigate the model. Jjodel uses JavaScript expressions (not OCL) for in-template queries. A Query is `basedOn` a Metaclass and is `contained` in a Template. In practice, this means JSX expressions inside a template that access `data` properties to navigate references and filter instances.

```jsx title="Query in Template"
{/* navigate the ownedTransitions reference, keep the Transition instances */}
{data.$ownedTransitions.values
    .filter(t => t.instanceof.name === 'Transition')
    .map(t => <text>{t.$name.value}</text>)}
```

This replaced OCL for model querying within templates, providing a more accessible syntax for web developers while maintaining the same expressive power for model navigation.


## Core Modeling Constructs

These are the meta-elements of the Jjodel meta-metamodel. Each one exists twice: as a **D** record, the serializable data kept in the store, and as an **L** wrapper, which is what templates and expressions read. The properties named here are the ones the L wrapper exposes; the [JjOM API](../jjom-api) lists them in full.

### DModel

The container of a metamodel or of a model. `isMetamodel` tells the two apart, `packages` holds the classifiers of a metamodel, `objects` the roots of a model, and `instanceof` points from a model to the metamodel it conforms to.

### DPackage

A namespace inside a metamodel. It holds `classes`, `enumerators`, `datatypes`, and `subpackages`.

### DClass

A classifier of the metamodel. It declares `attributes`, `references`, and `operations`, which `features` returns together. Inheritance runs through `extends` and `extendedBy`, interfaces through `implements` and `implementedBy`, and `referencedBy` gives the references that point at the class.

Four flags constrain instantiation: `abstract` forbids direct instances, `interface` marks the class as an interface, `isSingleton` allows one instance, `isFinal` forbids subclassing. `isRootable` says instances may sit at the root of a model, `partial` lets instances carry features the class does not declare, and `isPrimitive` marks the built-in datatypes.

The instances themselves are `instances` for the direct ones and `allInstances` when subclasses count too.

### DAttribute

A slot that holds data. `type` is the primitive classifier or the enumeration, `lowerBound` and `upperBound` its multiplicity, `ordered` and `unique` the semantics of a multi-valued attribute, `defaultValue` what an instance starts with.

### DEnumerator

A closed set of values, useful when an attribute may take only a handful of them. `literals` holds the `DEnumLiteral` elements, each with a `name` and a `value`.

### DReference

A link between two classifiers. `type` is the class at the other end, and `opposite` the reference that closes the pair when one exists. Multiplicity works as it does for attributes.

Three flags say who owns what. `containment` puts the target inside the source in the containment tree. `composition` means the source owns the target and deletes it with itself. `aggregation` means the target is shared and outlives the source. A contained element belongs to one parent only, which is why new instances of a contained type are created from the context menu of their parent.

### DOperation

A behavioral feature of a class.

### DObject

An instance of a class. `instanceof` gives the class, `features` the slots, `father` and `parent` its place in the containment tree, and `allSubObjects` everything below it. `name` is its display name, taken from the identity slot when the class declares one.

`className` is not the metaclass: it names the kind of JjOM element you hold, `"DObject"` here and `"DClass"` for a classifier. The metaclass is `instanceof.name`.

An ERD makes this concrete: the Entity metaclass is a DClass, the entity "User" is a DObject, and its `id` attribute is a DAttribute whose slot on "User" is a DValue.

### DValue

One slot of an object. `value` is the single value, `values` the whole list, and `instanceof` the attribute or reference the slot fills. For a reference, the values are the objects it points to; for an attribute, they are primitives or enumeration literals.

## Primitive Data Types

Jjodel provides the following primitive types, inherited from the Ecore type system:

| Type | Description | Example |
|------|-------------|---------|
| `EString` | A sequence of characters | `"Cardiology"` |
| `EInt` | 32-bit integer | `42` |
| `EBoolean` | True or false | `true` |
| `EDouble` | 64-bit floating point | `3.14159` |
| `EFloat` | 32-bit floating point | `2.71` |
| `ELong` | 64-bit integer | `123456789L` |
| `EShort` | 16-bit integer | `32767` |
| `EByte` | 8-bit integer | `127` |
| `EChar` | A single character | `'A'` |
| `EDate` | Date and time | `2025-06-20T10:00` |

In practice, `EString`, `EInt`, `EBoolean`, and `EDouble` cover the vast majority of use cases. The full set is available for interoperability with Ecore-based metamodels and for domains that require precise numeric types.

## The $ Prefix Convention

Built-in JjOM properties are read directly. The features your metamodel declares are read with a `$` prefix, which keeps them apart from the built-ins whatever you decide to call them.

Take a metamodel where `Entity` declares an attribute `name`, an attribute `description`, and a containment reference `ownedAttributes`:

```javascript title="Built-in properties and declared features"
// built-in
data.className              // "DObject" for an instance, "DClass" for a classifier
data.instanceof.name        // "Entity", the metaclass
data.id                     // the element id

// declared attribute
data.$name                  // the slot, a DValue
data.$name.value            // "User", the string in the slot
data.$description.value     // the description text

// declared reference
data.$ownedAttributes        // the slot
data.$ownedAttributes.values // the objects it points to

// is the reference set?
data.$left && data.$left.value
```

### The Special `name` Attribute

An attribute called `name` becomes the display name of the instance: `data.name` returns the same string as `data.$name.value`. That is why renaming an element on the canvas writes into the attribute rather than into some separate label.

An enumeration slot holds a literal. Read it as any other value:

```javascript title="Reading an enumeration"
data.$cardinality.value       // the literal
data.$cardinality.value.name  // "OneToMany"
```

## Navigating the JjOM in Templates

Templates and handlers work with three variables, one per submodel: `data` for the model element, `node` for its layout and state, `view` for the view itself. Most of what you write touches `data`.

```jsx title="Reading a model from a template"
// the name of the current element
<span>{data.$name.value}</span>

// every attribute of an Entity, with its type
{data.$ownedAttributes.values.map(attr =>
  <div>{attr.$name.value}: {attr.$type.value.name}</div>
)}

// the names of its text attributes
{data.$ownedAttributes.values
  .filter(a => a.$type.value.name === 'EString')
  .map(a => a.$name.value)}
```

What you can navigate depends on your metamodel. A reference `left` from `Relation` to `Entity` gives `data.$left`; the JjOM mirrors the metamodel at runtime, so the vocabulary of your language is the vocabulary of these expressions.

## Layout-Sensitive Notation

Most visual notations in software engineering are **topological**: meaning is encoded in connectivity (which elements are connected by edges). In these notations, layout is irrelevant; you can move, resize, and rearrange elements without changing the model's meaning. ER diagrams and UML class diagrams are topological.

Some engineering domains use **layout-sensitive** notations: railway track plans, power cabinet schematics, PCB layouts, algebraic formulas. In these notations, the spatial order of elements changes their meaning. The expression `5 - 3` and `3 - 5` have the same topology (a subtraction with two operands) but opposite semantics determined by the left-right position of the operands.

Mainstream modeling tools (GMF, Sirius) treat layout as decoration, storing it in diagram files that are ignored semantically. This creates semantic ambiguity: two visually different diagrams may share the same abstract syntax even when their layout encodes different meanings.

Jjodel solves this by making layout a first-class semantic submodel. The node submodel captures positional information that viewpoint rules can read and react to, ensuring that each distinct layout maps to a unique abstract model. No layout data pollutes the metamodel; the node submodel handles it transparently.

| Tool | Layout treated as | Semantic Impact | Live Co-evolution |
|------|-------------------|-----------------|-------------------|
| GMF | rendering | ignored | no |
| Sirius | decorative | partial | limited |
| Jjodel | semantic submodel | preserved | yes |

## State Attributes

In Jjodel, every JjOM node (data, node, view) can carry a set of **computed states** that depend on the structure of the model and on other states. This mechanism is analogous to synthesized and inherited attributes in classical attribute grammars: synthesized attributes flow upward from children to parents, and inherited attributes flow downward from parents to children.

State attributes serve two purposes. On the abstract syntax side, they capture semantic or derived information: computed values, validity flags, types, derived names. On the concrete syntax side, they describe how the model should appear or behave in the editor: layout values, visibility, styling, or interactive state.

The Jjodel runtime evaluates state dependencies incrementally. When the model changes, all affected states update automatically, keeping views consistent without manual intervention.

## The D level and the L level

Every JjOM element exists twice. The **D** record is plain serializable data: fields and pointers, the form the store keeps and the server persists. The **L** wrapper is a proxy over that record, and it is what you get in templates, in expressions, and in the Console. The wrapper resolves a pointer into the object it names, computes derived properties such as `allInstances` or `extendedBy`, and validates a write before it reaches the store.

The practical consequence: read `instanceof` on an L object and you get the class, read it on the D record and you get its id. Write through the L wrapper and the change lands in the undo history and reaches every view; write into the D record and nothing notices.

`LModel` is the wrapper for a model. It finds elements by name and writes attribute values through the `$attr.value` pattern, which is the same convention templates use.

:::note
The JjOM is the single source of truth for all modeling data in Jjodel. Every editor, viewpoint, and validation rule operates on the same JjOM instance, ensuring consistency across all perspectives.
:::
