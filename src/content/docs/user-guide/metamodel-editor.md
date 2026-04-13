---
title: Metamodel Editor
description: Define the abstract syntax of your language — classes, attributes, references, and constraints.
sidebar:
  order: 2
  label: Metamodel Editor
---

The Metamodel Editor is the core workspace for defining the **abstract syntax** of your modeling language. Here you create classes, define their attributes and operations, establish relationships (references), and set constraints that models must satisfy.

## Interface Overview

The Metamodel Editor consists of:

- **Canvas** — the main area where you visually create and arrange metamodel elements
- **Tree View** — a hierarchical view of the metamodel structure (classes, packages, features)
- **Properties Panel** — contextual tabs for editing the selected element's properties

<!-- TODO: screenshot — metamodel editor interface with annotations (new UI) -->

## Working with Classes

Classes (`DClass`) are the primary building blocks of a metamodel. To create a class:

1. Click the **Add Class** button in the toolbar (or use the context menu on the canvas)
2. Enter a name for the class
3. The class appears on the canvas as a box

### Class Properties

Each class has the following configurable properties:

- **name** — the unique identifier of the class within the metamodel
- **isAbstract** — if `true`, the class cannot be directly instantiated; it serves as a base for subclasses
- **isInterface** — marks the class as an interface (defines a contract without implementation)
- **isRootable** — if `true`, instances of this class can serve as root elements in a model
- **isSingleton** — restricts instantiation to a single instance per model
- **isFinal** — prevents the class from being extended

### Inheritance

Classes support single and multiple inheritance. To create an inheritance relationship:

1. Select the child class
2. Use the **extends** property to point to one or more parent classes
3. The child class inherits all attributes, references, and operations from its parents

## Working with Attributes

Attributes (`DAttribute`) represent typed properties of a class. To add an attribute:

1. Select a class
2. In the Properties Panel, navigate to the **Attributes** section
3. Click **Add Attribute**
4. Specify the attribute name and type

Supported types include primitive data types (`EString`, `EInt`, `EBoolean`, `EDouble`, and others) and custom enumerations. See the [JjOM reference](../../reference/jjom#primitive-data-types) for the full list of primitives.

## Working with References

References (`DReference`) define relationships between classes. Jjodel supports two kinds of references:

- **Containment references** — express parent-child (composition) relationships; contained elements are owned by the parent and cannot exist independently
- **Non-containment references** — express associations between classes without ownership semantics

To create a reference:

1. Select the source class
2. In the Properties Panel, navigate to **References**
3. Click **Add Reference**
4. Specify the target class, multiplicity, and whether the reference is a containment

### Multiplicity

References have configurable multiplicity bounds:

- `0..1` — optional single reference
- `1..1` — mandatory single reference
- `0..*` — optional collection
- `1..*` — mandatory collection with at least one element

## Working with Operations

Operations (`DOperation`) define behaviors associated with a class. They can be used for model transformations, computed properties, or custom logic.

## Working with Enumerations

Enumerations define closed sets of symbolic values. Use them for attributes where only specific options are valid: data types (`String`, `Integer`, `Boolean`), cardinalities (`OneToOne`, `OneToMany`), statuses (`Active`, `Inactive`), or any domain-specific value set.

To create an enumeration:

1. Click the **Add Enumeration** button in the toolbar (or use the context menu)
2. Enter a name for the enumeration (e.g., `Cardinality`)
3. Add **literals**: each literal represents one valid value (e.g., `OneToOne`, `OneToMany`, `ManyToMany`)

To use an enumeration as an attribute type:

1. Select a class and add (or edit) an attribute
2. Set the attribute type to the enumeration name instead of a primitive type
3. When users create instances of this class, the attribute appears as a dropdown with the enumeration literals

Because Jjodel is reflective, adding a new literal to an enumeration immediately makes it available in all existing model instances that use that enumeration. No regeneration step is required.

See the [Primitive Data Types](../../reference/jjom#primitive-data-types) in the JjOM reference for the complete list of built-in types.

## Working with Packages

Packages (`DPackage`) organize classes into logical groups, similar to namespaces. A package can contain classes or other packages, enabling hierarchical organization of large metamodels.

## Tree View

The Tree View provides an alternative, hierarchical representation of the metamodel. It displays the complete structure of packages, classes, attributes, references, and operations in a collapsible tree format.

<!-- TODO: screenshot — tree view metamodel (new UI) -->

The Tree View is especially useful for navigating complex metamodels and for quickly locating specific elements.

:::tip[Keyboard shortcuts]
Use keyboard shortcuts to speed up common operations in the editor. Check the console or help menu for available shortcuts.
:::
