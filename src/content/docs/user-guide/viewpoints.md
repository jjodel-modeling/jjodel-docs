---
title: Viewpoints
description: Define how model elements are rendered, validated, and used to generate code.
sidebar:
  order: 4
  label: Viewpoints
---

Viewpoints are one of Jjodel's most powerful features. A viewpoint defines a **perspective** on a model — how elements look, how they behave, what constraints they must satisfy, and what artifacts they generate. The same model can have multiple viewpoints, each tailored to a different audience or purpose.

## Types of Viewpoints

Jjodel supports four categories of viewpoints:

### Syntax Viewpoints (Concrete Syntax)

Syntax viewpoints define the **visual or textual representation** of model elements. They map abstract metamodel concepts to concrete graphical or textual forms.

#### Visual Viewpoints

Visual viewpoints use shapes, colors, icons, and connectors to render model elements as diagrams. For each metamodel class, you define a **view** that specifies:

- **Shape** — rectangle, ellipse, diamond, custom SVG, etc.
- **Label** — which attribute(s) to display as text
- **Color and style** — fill, border, font, opacity
- **Compartments** — subdivisions within a shape (e.g., showing attributes inside a class box)
- **Edge style** — for references: line type, arrowheads, routing (Manhattan or direct)

<!-- TODO: screenshot — visual viewpoint configuration (new UI) -->

#### Textual Viewpoints

Textual viewpoints define a text-based syntax for model elements. Instead of graphical shapes, elements are rendered as structured text following a grammar you define. This enables blended modeling — switching between graphical and textual representations of the same model.

### Validation Viewpoints

Validation viewpoints enforce **constraints and rules** that model instances must satisfy. They are used to check model consistency, enforce naming conventions, verify structural integrity, and apply domain-specific business rules.

Validation rules produce notifications that guide the modeler toward restoring model validity. Notifications can be informational, warnings, or errors.

### Code Generation Viewpoints

Code generation viewpoints transform model elements into **executable artifacts** — source code, configuration files, documentation, or any textual output. You define templates that map metamodel classes to code patterns, enabling automated generation from your models.

## Viewpoint Configuration

Each viewpoint is configured through a set of tabs in the Properties Panel:

### Applied To

Defines which metamodel classes and model elements the viewpoint applies to. You can use OCL or JavaScript constraints to filter which instances should be rendered by this viewpoint.

### Template

Specifies the visual template for the view — the shape, layout, and content of each rendered element. Templates use JSX-like expressions for dynamic content.

<!-- TODO: screenshot — template tab (new UI) -->

### Style

Controls the appearance properties: colors, borders, fonts, sizes, spacing, and opacity. Styles can be static or computed dynamically based on element properties.

### Events

Defines interactive behavior: what happens when the user clicks, drags, resizes, or hovers over a model element. Events enable custom interaction logic through JavaScript handlers.

### Options

Additional configuration for layout, alignment, connection routing, and rendering behavior.

## Default Viewpoints

When you create a new metamodel, Jjodel automatically generates **default viewpoints** that provide a basic visual representation for each class. These defaults use simple rectangles with the class name as a label. You can customize or replace them with your own viewpoint definitions.

## Multi-View Modeling

Jjodel's viewpoint system enables true multi-view modeling: the same underlying model can be visualized through multiple viewpoints simultaneously. For example, a software architecture model might have:

- A **structural viewpoint** showing classes and relationships
- A **deployment viewpoint** showing servers and connections
- A **validation viewpoint** highlighting constraint violations
- A **documentation viewpoint** generating API documentation

Each viewpoint presents a different perspective without modifying the underlying model data.

:::caution[Viewpoints are not models]
Viewpoints define *how* to render models — they do not contain model data themselves. Modifying a viewpoint changes the visualization, not the model structure.
:::
