---
title: JjOM API Reference
description: Programmatic access to all elements in the Jjodel Object Model.
sidebar:
  order: 2
---

The JjOM API provides programmatic access to all elements in the Jjodel Object Model. You can use the API from the Console, within JjEL expressions, in viewpoint templates, and in event handlers.

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
| `className` | `String` | Name of the instantiated class |
| `instanceOf` | `DClass` | The metaclass |
| `parent` | `*` | Containing element |

## DAttribute API

| Property | Type | Description |
|----------|------|-------------|
| `name` | `String` | Attribute name |
| `type` | `String` | Data type |

## DReference API

| Property | Type | Description |
|----------|------|-------------|
| `name` | `String` | Reference name |
| `target` | `DClass` | Target class |
| `containment` | `Boolean` | Whether this is a containment reference |

## DPackage API

| Property | Type | Description |
|----------|------|-------------|
| `name` | `String` | Package name |
| `packages` | `Array<DPackage>` | Nested packages |
| `objects` | `Array<DObject>` | Contained elements |

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
myObject.instanceOf.name

// From class to its features
Person.attributes.map(a => a.name)  // → ["name", "age"]

// From class to its subclasses
Entity.extendedBy.map(c => c.name)  // → ["Person", "Organization"]
```

### Checking properties

```javascript
// Is this class abstract?
myClass.isAbstract  // → true/false

// Can this class be used as a model root?
myClass.isRootable  // → true/false
```

:::caution[Temporary IDs]
Objects created via `DObject.new()` receive temporary IDs that may change after persistence. Do not use these IDs for long-term references.
:::
