---
title: Jjodel Object Model (JjOM)
description: The runtime framework that represents all modeling artifacts in Jjodel.
sidebar:
  order: 1
---

The Jjodel Object Model (JjOM) is the structured runtime framework at the heart of Jjodel. It represents all modeling components in a unified, reflective structure that can be inspected and manipulated at runtime.

## Two Submodels: Data and Node

The JjOM is split into two complementary submodels:

**Data** encodes the abstract syntax of a model: the elements, their attribute values, and their references. This is the semantic content of your model. When you create an Entity with attributes in an ER diagram, the data submodel stores those elements and their properties.

**Node** encodes all layout information: position, dimensions, edge routing, and visual state. This is the presentation layer. When you drag an element on the canvas, only the node submodel changes; the data remains untouched.

This separation is architecturally significant. It enables positional notations where the layout contributes to the meaning of the model (e.g., elements placed inside a container imply containment), while keeping the semantic content independent of any specific visual arrangement.

## Core Modeling Constructs

### DPackage

A logical container for grouping related classes. Packages can be nested to create hierarchical namespaces.

**Key properties:**
- `name: String`
- `packages: Array<DPackage>` (nested sub-packages)
- `objects: Array<DObject>` (contained elements)

### DClass

The fundamental building block of metamodels. A DClass defines an element type with its properties and relationships.

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

A typed property belonging to a class.

**Key properties:**
- `name: String`
- `type` (String, Integer, Boolean, Float, or a user-defined enumeration)

### DReference

A relationship between two classes.

**Key properties:**
- `name: String`
- `target: DClass` (the referenced class)
- `containment: Boolean` (if `true`, this is a composition; contained elements belong exclusively to the parent)
- `multiplicity` (lower and upper bounds; `-1` means unbounded)

When containment is `true`, the reference creates a parent-child relationship. An element contained by one parent cannot belong to another. In the editor, new instances of the contained type can only be created through the context menu of the parent element.

### DOperation

A behavioral feature belonging to a class.

### DObject

A runtime instance of a DClass. DObjects hold actual attribute values and reference targets.

**Key properties:**
- `id: Pointer` (unique identifier; IDs from `DObject.new()` are temporary)
- `className: String` (name of the instantiated class)
- `instanceOf: DClass` (the metaclass)
- `parent: *` (containing element, if any)

## The $ Prefix Convention

In JSX templates and Console expressions, user-defined features (attributes and references from your metamodel) are accessed with the `$` prefix. This distinguishes them from built-in JjOM properties.

Given a metamodel where `Entity` has an attribute `name` and a containment reference `ownedAttributes`:

```javascript
// Built-in JjOM property (no prefix)
data.instanceof.name       // returns "Entity"
data.id                    // returns the element ID

// User-defined attribute ($ prefix)
data.$name                 // returns the value of the "name" attribute

// User-defined reference ($ prefix)
data.$ownedAttributes      // returns the array of contained Attribute instances

// Check if a reference is set
data.$left !== undefined   // true if the "left" reference points to something
```

For enumeration values, the stored value is a symbolic identifier. To display it, access the value property:

```javascript
data.$cardinality.value    // returns e.g., "OneToMany"
```

## Navigating the JjOM in Templates

JSX templates operate on two variables: `data` (the abstract syntax subgraph for the current element) and `node` (the layout subgraph). Most template logic uses `data`.

```jsx
// Display the name of the current element
<span>{data.$name}</span>

// List all attributes of an Entity
{data.$ownedAttributes.map(attr =>
  <div>{attr.$name}: {attr.$type.value}</div>
)}

// Filter attributes by type
{data.$ownedAttributes
  .filter(attr => attr.$type.value === 'String')
  .map(attr => <div>{attr.$name}</div>)
}
```

The navigational structure of these expressions depends entirely on your metamodel. If your metamodel defines a reference `left` from `Relation` to `Entity`, then `data.$left` navigates that reference. The JjOM mirrors the metamodel structure at runtime.

## JjOM and the LModel Proxy

In Jjodel's internal architecture, the `LModel` proxy provides a convenience API for accessing and manipulating the JjOM. LModel finds elements **by name** and writes attribute values using the `$attr.value` pattern. This is relevant for internal development and advanced customization; most users interact with the JjOM through templates and the Console.

:::note
The JjOM is the single source of truth for all modeling data in Jjodel. Every editor, viewpoint, and validation rule operates on the same JjOM instance, ensuring consistency across all perspectives.
:::
