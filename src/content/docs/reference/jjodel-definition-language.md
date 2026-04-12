---
title: Jjodel Definition Language
description: Defining metamodels, viewpoints, and expressions using Jjodel's textual notation.
sidebar:
  order: 4
---

# Jjodel Definition Language

The Jjodel Definition Language provides a textual notation for defining metamodels, viewpoints, and expressions. While Jjodel's graphical editors are the primary interface for most users, the definition language offers a compact, code-oriented alternative that is especially useful for advanced users, automation, and version control.

## Expression Languages

Jjodel includes three specialized languages:

### JjEL — Jjodel Expression Language

JjEL is used for navigating models, accessing properties, and defining computed values. It appears in viewpoint templates, validation constraints, and the Console.

```javascript
// Navigate from an object to its metaclass
self.instanceOf.name

// Access an attribute
self.name

// Collection operations
Person.allInstances.filter(p => p.age > 18)
Person.allInstances.map(p => p.name)
```

### JjTL — Jjodel Transformation Language

JjTL is Jjodel's model-to-model transformation language. It defines mappings between source and target metamodels, enabling systematic model transformations.

JjTL serves a dual purpose: it is both a user-facing language for defining transformations and the core intermediate representation for future interoperability with other transformation languages (ATL, ETL).

<!-- TODO: link to JjTL development plan and detailed syntax documentation -->

### JjScript

JjScript provides a scripting interface for programmatic manipulation of metamodels and models. It extends JavaScript with Jjodel-specific APIs for creating, modifying, and querying model elements.

## JSX for Model Navigation

Jjodel uses JSX-like expressions in viewpoint templates to define dynamic content. These expressions are evaluated at render time and can access the current model element, its properties, and its relationships.

```jsx
// A simple template for rendering a class
<rect>
  <text>{self.name}</text>
  {self.attributes.map(a => 
    <text>{a.name}: {a.type}</text>
  )}
</rect>
```

:::note
The definition language is documented here for reference. Most users interact with Jjodel through its graphical editors. The textual notation becomes valuable when working with version control, writing complex expressions, or automating repetitive tasks.
:::
