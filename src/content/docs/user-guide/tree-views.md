---
title: Tree Views
description: Navigate and edit metamodels and models using hierarchical tree representations.
sidebar:
  order: 3
  label: Tree Views
---

Jjodel provides two specialized tree views — one for metamodels and one for models — that offer a hierarchical, text-oriented perspective of your modeling artifacts. Tree views complement the graphical canvas by making it easy to navigate, inspect, and edit complex structures.

## Tree View (Metamodel)

The metamodel tree view displays the complete structure of your metamodel in a collapsible hierarchy:

```
MyMetamodel
├── Package: core
│   ├── Class: Entity
│   │   ├── Attribute: name (String)
│   │   └── Reference: children (0..*)
│   └── Class: NamedElement [abstract]
│       └── Attribute: name (String)
└── Package: relations
    └── Class: Association
        ├── Reference: source (1..1)
        └── Reference: target (1..1)
```

<!-- TODO: screenshot — metamodel tree view (new UI) -->

### Operations in Tree View

From the metamodel tree view you can:

- **Select** any element to view and edit its properties in the Properties Panel
- **Drag and drop** elements to reorganize them (e.g., move a class into a different package)
- **Right-click** for context menu options: rename, delete, add child elements
- **Expand/collapse** branches to focus on specific parts of the metamodel

## Tree View (Model)

The model tree view shows the instances in your model, organized by their metamodel class:

```
MyModel
├── Person: "Alice"
│   ├── name = "Alice"
│   ├── age = 30
│   └── address → Address: "Home"
├── Person: "Bob"
│   └── name = "Bob"
└── Address: "Home"
    └── street = "Via Roma 1"
```

<!-- TODO: screenshot — model tree view (new UI) -->

### Operations in Tree View

From the model tree view you can:

- **Instantiate** new objects by right-clicking on a class node
- **Edit** attribute values directly
- **Establish** and **remove** references between objects
- **Navigate** to referenced objects by clicking on reference links

## When to Use Tree Views

Tree views are particularly useful when:

- The model or metamodel is large and the canvas becomes crowded
- You need to quickly inspect all properties of a specific element
- You want to perform bulk operations (e.g., adding multiple attributes)
- You are working with deeply nested containment hierarchies

:::tip
You can keep both the canvas and the tree view open simultaneously. Selecting an element in one view highlights it in the other.
:::
