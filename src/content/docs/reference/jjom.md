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

- **Front-end**: React/TypeScript + Redux (object store)
- **Back-end**: ASP.NET + PostgreSQL
- **Reflective Bus and Object Store**: the communication backbone that synchronizes changes across all clients

The JjOM provides a unified API to query, edit, and synchronize models, their layout, and their visual representation. An analogy from the web domain: the JjOM plays a role similar to the Document Object Model (DOM), but for modeling artifacts instead of HTML documents.


## Notation Architecture

The JjOM connects metamodels to their visual representation through a Notation structure. A Notation is a named entity associated with exactly one metamodel through a `definedBy` relationship. The notation holds the complete specification of how model elements are rendered, validated, and behave.

### Notation, Viewpoints, and Views

The notation architecture follows a three-level hierarchy:

A **Notation** (e.g., "State Machine Notation") is owned by a metamodel. It contains zero or more viewpoints.

A **Viewpoint** groups a family of related views. Viewpoints can be exclusive (only one active at a time) or overlay (layered on top of the active exclusive viewpoint). See [Viewpoints](../user-guide/viewpoints) for the full explanation of exclusive vs overlay.

A **View** targets instances of a specific metaclass. Each view has up to four components:

| Component | Purpose | Technology |
|-----------|---------|------------|
| Predicate | Selects which instances the view applies to | OCL or JavaScript |
| Template | Defines the visual structure | JSX |
| Style | Controls appearance | SCSS |
| Events | Defines reactive behavior | ECA rules (JavaScript) |

### How Views Connect to Models

A View's predicate **selects** model instances: the predicate evaluates against each instance and returns true for those the view should render. The selected instances become **Nodes** in the concrete syntax layer. Each Node carries its own layout and state information.

The predicate is the mechanism that defines the syntactic mapping (σ) from the formal language definition. Given a model (abstract syntax) and a set of views with predicates, σ determines which instances get which visual representations.

### Queries in Templates

Templates can contain **queries** that navigate the model. Jjodel uses JavaScript expressions (not OCL) for in-template queries. A Query is `basedOn` a Metaclass and is `contained` in a Template. In practice, this means JSX expressions inside a template that access `data` properties to navigate references and filter instances.

```jsx
{/* Query: navigate ownedTransitions reference, filter by className */}
{data.$ownedTransitions
    .filter(t => t.$className === 'Transition')
    .map(t => <text>{t.$name}</text>)}
```

This replaced OCL for model querying within templates, providing a more accessible syntax for web developers while maintaining the same expressive power for model navigation.


## Core Modeling Constructs

These are the meta-elements in the Jjodel meta-metamodel.

### DModel

The top-level container holding packages or classes. DModel acts as the root of a model specification. Every project has at least one DModel.

### DPackage

A logical grouping or namespace for related classes.

**Key properties:**
- `name: String`
- `packages: Array<DPackage>` (nested sub-packages)
- `objects: Array<DObject>` (contained elements)

### DClass

Represents a class in the metamodel. It can extend from another class and declares attributes, references, and operations.

**Key properties:**
- `name: String` (unique within its package)
- `isAbstract: Boolean` (if `true`, cannot be directly instantiated)
- `isInterface: Boolean` (marks the class as an interface)
- `isRootable: Boolean` (if `true`, instances can be root elements)
- `isSingleton: Boolean` (restricts to a single instance per model)
- `isFinal: Boolean` (prevents subclassing)
- `isPrimitive: Boolean` (marks as a primitive type)
- `isMetamodel: Boolean` (indicates metamodel-level membership)
- `extends: Array<DClass>` (parent classes)
- `extendedBy: Array<DClass>` (known subclasses)
- `attributes: Array<DAttribute>` (owned attributes)
- `references: Array<DReference>` (owned references)
- `operations: Array<DOperation>` (owned operations)
- `features: Array<Feature>` (all structural features combined)
- `instances: Array<DObject>` (direct instances)
- `allInstances: Array<DObject>` (all instances including subclass instances)

### DAttribute

Represents a field or characteristic that holds an intrinsic value. The type can be a primitive (integer, string, boolean, etc.) or a user-defined enumeration.

**Key properties:**
- `name: String`
- `type` (one of the primitive data types below, or a user-defined enumeration)

### DEnumeration

A named set of symbolic values. Enumerations define closed value sets for attributes where only specific options are valid (e.g., `Status = {ON, OFF, STANDBY}`, `Cardinality = {OneToOne, OneToMany, ManyToMany}`).

**Key properties:**
- `name: String`
- `literals: Array<DEnumerationLiteral>` (the set of valid values)

Each literal has a `name` and an optional `value`. In templates and Console expressions, read an enumeration attribute with `data.$myEnum.value`.

### DReference

A relationship between two classes. DReferences may include multiplicity constraints (one-to-one, one-to-many) and can be containment or non-containment relationships.

**Key properties:**
- `name: String`
- `target: DClass` (the referenced class)
- `containment: Boolean` (if `true`, this is a composition; contained elements belong exclusively to the parent)
- `multiplicity` (lower and upper bounds; `-1` means unbounded)

When containment is `true`, the reference creates a parent-child relationship. An element contained by one parent cannot belong to another. In the editor, new instances of the contained type can only be created through the context menu of the parent element.

### DOperation

A behavioral feature belonging to a class.

### DObject

An instance of a DClass. DObjects store runtime values for each DAttribute and links pointing to other objects.

**Key properties:**
- `id: Pointer` (unique identifier; IDs from `DObject.new()` are temporary)
- `className: String` (name of the instantiated class)
- `instanceOf: DClass` (the metaclass)
- `parent: *` (containing element, if any)

A concrete example: an ERD Entity metaclass becomes a DClass; a specific entity "User" is a DObject; its "id" attribute is a DAttribute with a DValue.

### DValue

The concrete value assigned to an attribute or data field. Each DObject's DAttribute has one or more DValues, which can be a scalar (string, integer, boolean) or an enumeration literal.

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

In JSX templates and Console expressions, user-defined features (attributes and references from your metamodel) are accessed with the `$` prefix. This distinguishes them from built-in JjOM properties.

Given a metamodel where `Entity` has an attribute `name`, a containment reference `ownedAttributes`, and an attribute `description`:

```javascript
// Built-in JjOM property (no prefix)
data.className             // returns "DClass" or "DObject"
data.instanceOf.name       // returns "Entity"
data.id                    // returns the element ID

// User-defined attribute ($ prefix)
data.$name                 // returns the DValue object for the "name" attribute
data.$name.value           // returns the string value, e.g., "User"
data.$description.value    // returns the description text

// User-defined reference ($ prefix)
data.$ownedAttributes      // returns the reference to contained Attribute instances
data.$ownedAttributes.values  // returns the array of actual instances

// Check if a reference is set
data.$left !== undefined   // true if the "left" reference points to something
```

### The Special `name` Attribute

A user-defined attribute called `name` has special status in Jjodel: its value overrides the display name of the instance. This means `data.name` returns the same string as `data.$name.value`. The built-in `data.name` property is effectively aliased to the user-defined `$name` attribute when one exists.

For enumeration values, the stored value is a symbolic identifier. To display it, access the value property:

```javascript
data.$cardinality.value    // returns e.g., "OneToMany"
```

## Navigating the JjOM in Templates

JSX templates operate on three variables corresponding to the three submodels: `data` (the abstract syntax subgraph for the current element), `node` (the layout subgraph), and `view` (the rendering configuration). Most template logic uses `data`.

```jsx
// Display the name of the current element
<span>{data.$name}</span>

// List all attributes of an Entity
{data.$ownedAttributes.map(attr =>
  <div>{attr.$name}: {attr.$type.value}</div>
)}

// List names of all String attributes
{data.$ownedAttributes.values
  .filter(s => s.$type.value.name === 'String')
  .map(a => a.name)
}
```

The navigational structure of these expressions depends entirely on your metamodel. If your metamodel defines a reference `left` from `Relation` to `Entity`, then `data.$left` navigates that reference. The JjOM mirrors the metamodel structure at runtime.

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

## JjOM and the LModel Proxy

In Jjodel's internal architecture, the `LModel` proxy provides a convenience API for accessing and manipulating the JjOM. LModel finds elements **by name** and writes attribute values using the `$attr.value` pattern. This is relevant for internal development and advanced customization; most users interact with the JjOM through templates and the Console.

:::note
The JjOM is the single source of truth for all modeling data in Jjodel. Every editor, viewpoint, and validation rule operates on the same JjOM instance, ensuring consistency across all perspectives.
:::
