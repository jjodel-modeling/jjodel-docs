---
title: Viewpoints
description: Define how model elements are rendered, validated, and used to generate code.
sidebar:
  order: 4
  label: Viewpoints
---

A viewpoint defines a perspective on a model. It controls how elements look, what constraints they must satisfy, and what artifacts they produce. The same model can have multiple viewpoints, each tailored to a different audience or purpose.

## Types of Viewpoints

Jjodel supports three categories of viewpoints:

**Syntax viewpoints** define the visual or textual representation of model elements. They map abstract metamodel concepts to concrete graphical or textual forms. This is the most commonly used type.

**Validation viewpoints** enforce constraints and rules that model instances must satisfy. They produce notifications (information, warning, error) that guide the modeler toward restoring validity.

**Code generation viewpoints** transform model elements into executable artifacts: source code, configuration files, documentation, or any textual output.

Each viewpoint is an orthogonal description of one aspect of the language. You can have a syntax viewpoint for visual rendering, a validation viewpoint for constraint checking, and a generation viewpoint for code output, all operating on the same model independently.

## Creating a Viewpoint

To create a new viewpoint:

1. Open the metamodel
2. Create a new **Viewpoint** from the toolbar or menu
3. Give it a name (e.g., `ConceptualERD`)
4. **Activate** the viewpoint so it becomes the active rendering perspective

<!-- TODO: screenshot — creating and activating a viewpoint (new UI) -->

A viewpoint starts empty. You populate it by adding **views**, one for each metaclass you want to render.

## Views

A view defines how instances of a specific metaclass are rendered. Each view consists of four parts:

1. **Predicate** that selects which model elements this view applies to
2. **Template** that defines the visual structure (JSX)
3. **Style** that controls the appearance (CSS)
4. **Events** that define interactive behavior (optional)

### Adding a View

To add a view for a metaclass (e.g., `Entity`):

1. Right-click on the metaclass in the metamodel editor
2. Select **Add View**
3. Choose the viewpoint this view belongs to
4. A default view is created with a basic template

<!-- TODO: screenshot — adding a view to a metaclass (new UI) -->

## Predicates

The predicate determines which model elements a view applies to. Every instance in the model is tested against the predicate; those that match are rendered using this view's template and style.

### OCL Predicates

The standard way to write a predicate is in OCL:

```
context DObject inv: self.instanceof.name = 'Entity'
```

This selects all instances whose metaclass is named `Entity`.

### JavaScript Predicates

You can also write predicates in JavaScript:

```javascript
data.instanceof.id === '3f2a...c7b1'
```

This uses the metaclass **ID** instead of the name string.

### OCL vs JavaScript: When to Use Which

Jjodel uses OCL.js, a JavaScript implementation of OCL. It works well for simple predicates but does not fully implement the OCL standard, and the library has intermittent maintenance.

Using the metaclass ID (JavaScript predicate) instead of the name string (OCL predicate) has one practical advantage: if you rename the metaclass, the ID-based predicate continues to work. A name-based predicate would break silently.

For most use cases, either approach works. If your predicate is simple (selecting instances by metaclass), both are equivalent.

## Templates

Templates define the visual structure of a view. They are written in **JSX** (JavaScript XML), a declarative notation from the React framework that combines HTML-like markup with JavaScript expressions.

### Basic Template Structure

A template receives two variables:

- **`data`** contains the abstract syntax subgraph for the current element (attributes, references, values)
- **`node`** contains the layout subgraph (position, dimensions)

Most template logic uses `data`.

### Example: Entity Template

```jsx
<div style={{
  padding: '8px',
  border: '2px solid #334155',
  borderRadius: '4px',
  background: '#f8fafc'
}}>
  <strong>{data.$name}</strong>
  {data.$ownedAttributes.map(attr =>
    <div key={attr.id} style={{fontSize: '12px', color: '#64748b'}}>
      {attr.$name}: {attr.$type.value}
    </div>
  )}
</div>
```

This renders an Entity as a box with its name in bold and a list of its attributes below.

Key expressions in this template:

- `data.$name` reads the user-defined attribute `name` (the `$` prefix accesses metamodel-defined features)
- `data.$ownedAttributes` navigates the containment reference to get all child Attribute instances
- `.map(attr => ...)` iterates over the attributes (standard JavaScript)
- `attr.$type.value` reads the enumeration value of the attribute's type

### The `<Input />` Component

Jjodel provides a library of predefined components (JjDL). The `<Input />` component enables **projectional editing**: the user can edit an attribute value directly in the rendered view, and the abstract syntax updates automatically.

```jsx
<Input value={data.$name} />
```

This renders an editable text field bound to the `name` attribute. Changes made by the user in the diagram propagate immediately to the model.

### Conditional Rendering

You can conditionally render parts of a template based on model data:

```jsx
{data.$left && <Edge
  id={data.id + '_left'}
  source={node}
  target={/* target node */}
/>}
```

The expression `data.$left &&` checks whether the `left` reference is set before rendering the edge. This prevents errors when the reference is not yet assigned.

## Edges

Edges are visual connections between nodes. They represent references in the metamodel and are specified using the `<Edge />` component inside a view template.

### Edge Component Properties

```jsx
<Edge
  id={data.id + '_edge'}
  source={node}
  target={/* target node */}
  label="relates to"
/>
```

- **`id`**: a unique identifier for this edge. A common pattern is to append a suffix to the element's ID (e.g., `data.id + '_left'`)
- **`source`**: the source node (typically `node`, which refers to the current element's layout node)
- **`target`**: the target node, obtained by navigating the JjOM to find the referenced element's layout information
- **`label`**: optional text displayed on the edge

### Edge Views

An Edge View defines the styling of edges: line style, arrowheads, color, thickness. Unlike regular views, edge views do not need a predicate because they are explicitly invoked from within another template.

To create an edge view, duplicate an existing view and modify its styling. This is often easier than creating one from scratch.

<!-- TODO: screenshot — edge configuration (new UI) -->

### Source and Target Navigation

Finding the target node requires navigating both the **data** submodel (to find the referenced element) and the **node** submodel (to find its visual position). The JjOM splits these two concerns, so you need to traverse both. See the [JjOM reference](../reference/jjom) for details on the data/node split.

## Styling

The Style tab controls visual properties: colors, borders, fonts, sizes, and spacing. Styles can be static CSS or computed dynamically based on element properties.

### User-Defined Styling Parameters

Jjodel supports user-defined styling parameters that make your viewpoints configurable. Instead of hardcoding a border color, you can define a parameter that the user can adjust through a visual tool.

Parameter types include:

- **Color palettes**: define a color scheme with multiple colors
- **Measures**: numeric values like border width or padding
- **Free text**: custom string values
- **SVG paths**: define custom shapes

<!-- TODO: screenshot — user-defined styling parameters (new UI) -->

These parameters appear as interactive widgets in the view configuration panel, allowing visual customization without editing CSS directly.

## Default Viewpoints

When you create a new metamodel, Jjodel automatically generates **default viewpoints** that provide a basic visual representation for each class. Default views use simple rectangles with the class name as a label.

Default viewpoints have a special role: they serve as the fallback rendering when no custom viewpoint is active. You can customize them, but they cannot be deleted.

When you create a new custom viewpoint and activate it, it takes precedence over the defaults. Any metaclass without a view in the active viewpoint falls back to the default rendering.

:::caution
Viewpoints define *how* to render models. They do not contain model data. Modifying a viewpoint changes the visualization, not the model structure. Deleting a viewpoint does not delete any model elements.
:::
