---
title: JjOM API Reference
description: Programmatic access to all elements in the Jjodel Object Model.
sidebar:
  order: 2
---

The JjOM API provides programmatic access to all elements in the Jjodel Object Model. You can use the API from the Console, within JjEL expressions, in viewpoint templates, and in event handlers. Models can be queried and manipulated through JavaScript/JSX expressions directly; no code generation is needed.

## DModel API

| Property | Type | Description |
|----------|------|-------------|
| `name` | `String` | Model name |
| `packages` | `Array<DPackage>` | Top-level packages |
| `objects` | `Array<DObject>` | Top-level elements |

## DClass API

| Property | Type | Description |
|----------|------|-------------|
| `name` | `String` | Class name |
| `isAbstract` | `Boolean` | Whether the class is abstract |
| `isInterface` | `Boolean` | Whether the class is an interface |
| `isRootable` | `Boolean` | Whether instances can be model roots |
| `isSingleton` | `Boolean` | Whether only one instance is allowed |
| `isFinal` | `Boolean` | Whether the class can be extended |
| `isPrimitive` | `Boolean` | Whether this is a primitive type |
| `isMetamodel` | `Boolean` | Whether this belongs to the metamodel level |
| `extends` | `Array<DClass>` | Direct parent classes |
| `extendedBy` | `Array<DClass>` | Direct subclasses |
| `attributes` | `Array<DAttribute>` | Owned attributes |
| `references` | `Array<DReference>` | Owned references |
| `operations` | `Array<DOperation>` | Owned operations |
| `features` | `Array<Feature>` | All structural features (attributes + references) |
| `instances` | `Array<DObject>` | Direct instances of this class |
| `allInstances` | `Array<DObject>` | All instances, including subclass instances |
| `packages` | `Array<DPackage>` | Containing packages |
| `parent` | `*` | Parent element in the containment hierarchy |

## DObject API

| Property | Type | Description |
|----------|------|-------------|
| `id` | `Pointer` | Unique identifier |
| `className` | `String` | Name of the instantiated class (returns `"DObject"` for model-level elements, `"DClass"` for metamodel-level) |
| `instanceOf` | `DClass` | The metaclass |
| `parent` | `*` | Containing element |
| `name` | `String` | Display name (aliased to `$name.value` when a user-defined `name` attribute exists) |

## DAttribute API

| Property | Type | Description |
|----------|------|-------------|
| `name` | `String` | Attribute name |
| `type` | `String` | Data type (primitive or enumeration name) |

## DReference API

| Property | Type | Description |
|----------|------|-------------|
| `name` | `String` | Reference name |
| `target` | `DClass` | Target class |
| `containment` | `Boolean` | Whether this is a containment reference |
| `multiplicity` | `Object` | Lower and upper bounds |

## DEnumeration API

| Property | Type | Description |
|----------|------|-------------|
| `name` | `String` | Enumeration name |
| `literals` | `Array<DEnumerationLiteral>` | Valid values |

## DValue API

| Property | Type | Description |
|----------|------|-------------|
| `value` | `*` | The concrete scalar value (string, integer, boolean, or enumeration literal) |
| `name` | `String` | For enumeration values, the literal name |

## DPackage API

| Property | Type | Description |
|----------|------|-------------|
| `name` | `String` | Package name |
| `packages` | `Array<DPackage>` | Nested packages |
| `objects` | `Array<DObject>` | Contained elements |

## Layout API (Node Submodel)

| Property | Type | Description |
|----------|------|-------------|
| `node.x` | `Number` | Horizontal position |
| `node.y` | `Number` | Vertical position |
| `node.w` | `Number` | Width |
| `node.h` | `Number` | Height |

## View API

| Property | Type | Description |
|----------|------|-------------|
| `view.oclCondition` | `String` | The OCL predicate that determines which elements this view applies to |

## Usage Examples

### Querying instances

```javascript
// All instances of Person (including subclasses)
Person.allInstances

// Filter by attribute value
Person.allInstances.filter(p => p.name === "Alice")

// Count elements
Class.allInstances.length
```

### Navigating the model graph

```javascript
// From instance to metaclass
data.instanceOf.name                   // → "Entity"

// Retrieve a user-defined attribute value
data.$name.value                       // → "User"
data.$description.value                // → "This entity is essential for..."

// List all attribute names of an entity
data.$ownedAttributes.values.map(a => a.name)  // → ["id", "name", "surname"]

// List only String attributes
data.$ownedAttributes.values
  .filter(s => s.$type.value.name === 'String')
  .map(a => a.name)                    // → ["name", "surname"]

// From class to its subclasses
Entity.extendedBy.map(c => c.name)     // → ["Person", "Organization"]
```

### Layout manipulation

```javascript
// Read position
node.x * node.y

// Check view predicate
view.oclCondition  // → "context DObject inv: self.instanceof.name = 'Entity'"
```

### Checking properties

```javascript
// Is this class abstract?
myClass.isAbstract  // → true/false

// Can this class be used as a model root?
myClass.isRootable  // → true/false

// What type of JjOM element is this?
data.className      // → "DClass" (metamodel) or "DObject" (model)
```

:::caution[Temporary IDs]
Objects created via `DObject.new()` receive temporary IDs that may change after persistence. Do not use these IDs for long-term references.
:::
