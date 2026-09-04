---
title: JjOM API Reference
description: The properties every JjOM element exposes to templates, expressions, and the Console.
sidebar:
  order: 2
---

Every element of a model, of a metamodel, and of the notation is reachable at runtime through the JjOM API. The properties below are the ones JavaScript sees: view templates, event handlers, and the JavaScript mode of the [Console](../../user-guide/console) all read the same names, so what you test in the Console is what you can write in a view. JjEL renames a few of them, listed under [Two vocabularies](#two-vocabularies).

Two levels exist. The **D** level is the raw serializable record kept in the store: `DClass`, `DObject`, `DValue`. The **L** level is the logic wrapper around it, and it is what you get in templates and expressions: it resolves pointers into objects, computes derived properties such as `allInstances`, and validates what you write back. The tables below list the L-level properties.

## Metamodel elements

### DModel

The container of a metamodel or of a model. A metamodel has `isMetamodel` true; a model has it false and points to its metamodel through `instanceof`.

| Property | Type | Description |
|----------|------|-------------|
| `name` | `String` | Model name |
| `isMetamodel` | `Boolean` | True for a metamodel, false for a model |
| `instanceof` | `LModel` | The metamodel this model conforms to |
| `packages` | `Array<LPackage>` | Packages held by the model |
| `objects` | `Array<LObject>` | Root objects of a model |
| `models` | `Array<LModel>` | Models conforming to this metamodel |
| `dependencies` | `Array<LModel>` | Metamodels this one depends on |

### DPackage

| Property | Type | Description |
|----------|------|-------------|
| `name` | `String` | Package name |
| `classes` | `Array<LClass>` | Classes declared in the package |
| `enumerators` | `Array<LEnumerator>` | Enumerations declared in the package |
| `datatypes` | `Array<LDataType>` | Datatypes declared in the package |
| `subpackages` | `Array<LPackage>` | Nested packages |

### DClass

| Property | Type | Description |
|----------|------|-------------|
| `name` | `String` | Class name |
| `abstract` | `Boolean` | Cannot be instantiated directly |
| `interface` | `Boolean` | Declared as an interface |
| `isPrimitive` | `Boolean` | A primitive datatype, such as `EString` |
| `isSingleton` | `Boolean` | At most one instance |
| `isRootable` | `Boolean` | Instances may sit at the root of a model |
| `isFinal` | `Boolean` | Cannot be extended |
| `partial` | `Boolean` | Instances may carry features the class does not declare |
| `extends` | `Array<LClass>` | Direct superclasses |
| `extendedBy` | `Array<LClass>` | Direct subclasses |
| `implements`, `implementedBy` | `Array<LClass>` | Interface sides of the same relation |
| `attributes` | `Array<LAttribute>` | Owned attributes |
| `references` | `Array<LReference>` | Owned references |
| `operations` | `Array<LOperation>` | Owned operations |
| `features` | `Array<LStructuralFeature>` | Attributes and references together |
| `referencedBy` | `Array<LReference>` | References that target this class |
| `instances` | `Array<LObject>` | Direct instances |
| `allInstances` | `Array<LObject>` | Instances of this class and of its subclasses |

JjEL names these flags differently: see [Two vocabularies](#two-vocabularies) below.

### DAttribute

| Property | Type | Description |
|----------|------|-------------|
| `name` | `String` | Attribute name |
| `type` | `LClassifier` | The primitive type or the enumeration; print `type.name` for `EString`, `EInt`, and the others |
| `lowerBound`, `upperBound` | `Number` | Multiplicity, with `-1` as unbounded |
| `ordered`, `unique` | `Boolean` | Collection semantics when the attribute holds many values |
| `defaultValue` | `*` | Value used when no other is set |

### DReference

| Property | Type | Description |
|----------|------|-------------|
| `name` | `String` | Reference name |
| `type` | `LClass` | The class the reference points to |
| `containment` | `Boolean` | The target is contained by the source |
| `composition` | `Boolean` | The source owns the target and deletes it with itself |
| `aggregation` | `Boolean` | The target is shared and survives the source |
| `opposite` | `LReference` | The reference that closes the pair, when one exists |
| `lowerBound`, `upperBound`, `many` | `Number`, `Boolean` | Multiplicity of the reference |

There is no `target` property. The class at the other end is `type`, the same name used for attributes.

### DEnumerator and DEnumLiteral

| Property | Type | Description |
|----------|------|-------------|
| `name` | `String` | Enumeration name |
| `literals` | `Array<LEnumLiteral>` | The declared literals |

A literal carries a `name` and a `value`, also readable as `ordinal`.

## Model elements

### DObject

An instance of a class.

| Property | Type | Description |
|----------|------|-------------|
| `id` | `Pointer` | Identifier of the element |
| `name` | `String` | Display name, taken from the identity slot when the class declares one |
| `instanceof` | `LClass` | The class this object instantiates |
| `features` | `Array<LValue>` | The slots of the object, one per attribute and reference |
| `father`, `parent` | `LModel`, `LValue` | Where the object sits in the containment tree |
| `allSubObjects` | `Array<LObject>` | Every object below this one in containment |
| `className` | `String` | The JjOM class of the element itself, `"DObject"` here |

`className` names the kind of JjOM element you are holding, not the metaclass. To read the metaclass, use `instanceof.name`.

### DValue

One slot of an object: the value of an attribute, or the targets of a reference.

| Property | Type | Description |
|----------|------|-------------|
| `value` | `*` | The single value, or the first one |
| `values` | `Array` | Every value in the slot |
| `instanceof` | `LAttribute`, `LReference` | The feature this slot fills |
| `edges` | `Array<LEdge>` | Edges drawn for this slot on the canvas |

## Layout and notation

### Node

The layout submodel of an element on a canvas.

| Property | Type | Description |
|----------|------|-------------|
| `x`, `y` | `Number` | Position |
| `w`, `h` | `Number` | Size |
| `state` | `Object` | Free-form state, the place where ECA rules write validation errors and simulation flags |
| `zoom` | `Object` | Zoom of the node contents |
| `isSelected` | `Object` | Selection, per user |
| `subElements` | `Array` | Nodes nested in this one |

### View

The declaration of how instances render.

| Property | Type | Description |
|----------|------|-------------|
| `name` | `String` | View name |
| `viewpointType` | `String` | Type of the viewpoint the view belongs to |
| `isExclusiveView` | `Boolean` | Whether the view excludes the others that apply |
| `oclCondition`, `jsCondition` | `String` | Selectors of the 1.5 record, kept on views that carry one |
| `appliableTo` | `String` | `Any`, `Graph`, `GraphVertex`, `Vertex`, `Edge`, `EdgePoint` or `Field` |
| `appliableToClasses` | `Array<String>` | JjOM classes the view accepts, such as `DObject` or `DClass` |
| `explicitApplicationPriority` | `Number` | Priority when several views apply to the same element |
| `ir` | `Object` | The declarative record introduced in 3.0. `metaclasses` and `predicate` say which elements the view accepts, `kind` what it produces, `priority` how it ranks, and `shape`, `structure` and `form` how it draws |
| `jsxString` | `String` | The JSX template of a view authored before 3.0, no longer interpreted |
| `events` | `Object` | Event handlers and custom actions, by name |
| `draggable`, `resizable` | `Boolean` | What the user may do with the node |
| `adaptWidth`, `adaptHeight` | `Boolean` | Whether the node sizes itself to its contents |

Some of these fields belong to the record as it was before 3.0. A view authored today declares what it accepts inside `ir`, through `metaclasses` and a structured `predicate` built in the Applies to form; `oclCondition` and `jsCondition` are the selectors of that older record, and OCL selection was dropped. `events` and `subViews` are being restored and are planned <span class="badge-next">3.5</span>.

## Two vocabularies

The JjOM properties above are what JavaScript sees: view templates, event handlers, and the JavaScript mode of the Console. [JjEL](../../languages/jjel) exposes the same information under its own names, and a few of them differ:

| In JjEL | In JavaScript |
|---------|---------------|
| `isAbstract` | `abstract` |
| `isInterface` | `interface` |
| `isPartial` | `partial` |
| `instanceOf` | `instanceof` |
| `isFinal`, `isSingleton`, `isRootable`, `className` | same name |

Write `c.isAbstract` in a JjEL guard or a validation condition, and `data.abstract` in a template. Mixing them is the most common reason an expression that works in one place returns `undefined` in the other.

## Reading values with the $ prefix

Built-in properties are read directly. Features declared by your metamodel are read with a `$` prefix, which keeps them apart from the built-ins whatever you name them.

```javascript title="Built-in properties and features"
// built-in
data.className              // "DObject"
data.instanceof.name        // "Entity", the metaclass
data.id                     // the element id

// declared by the metamodel
data.$name                  // the slot (an LValue)
data.$name.value            // "User", the string in it
data.$ownedAttributes.values // the objects the reference points to
```

A class that declares an attribute called `name` gets it as its display name: `data.name` and `data.$name.value` return the same string.

## Examples

```javascript title="Querying a metamodel"
// every instance of Entity, subclasses included
Entity.allInstances

// the subclasses of Entity
Entity.extendedBy.map(c => c.name)

// the attributes of Entity that hold text
Entity.attributes
  .filter(a => a.type.name === 'EString')
  .map(a => a.name)
```

```javascript title="Walking a model"
// the attribute names of the current entity
data.$ownedAttributes.values.map(a => a.name)

// the objects contained below this one
data.allSubObjects.filter(o => o.instanceof.name === 'Transition')

// where the node sits, and what a rule wrote on it
node.x * node.y
node.state.error_naming
```

:::caution[Temporary IDs]
`DObject.new()` returns an object whose id is temporary and changes when the project is persisted. Do not store those ids as long-term references.
:::
