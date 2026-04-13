---
title: Viewpoints
description: Define how model elements are rendered, validated, and behave through composable viewpoints.
sidebar:
  order: 4
  label: Viewpoints
---

A viewpoint defines a perspective on a model. It controls how elements look, what constraints they must satisfy, and how they behave. Each viewpoint contains a set of views, and each view targets specific metaclass instances through a predicate.

## Multi-View Modeling

Complex systems require multiple perspectives. A structural perspective shows how elements relate; a behavioral perspective shows how they evolve over time; a validation perspective highlights constraint violations. Forcing all of these into a single view creates visual noise and cognitive overload.

Jjodel realizes multi-view modeling through coordinated, interrelated metamodels describing different concerns of a domain. Each viewpoint represents a distinct abstraction (structural, behavioral, validation), and the same underlying model data supports all of them. Switching viewpoints is instant; the model itself is never modified.

This design follows the principle of Separation of Concerns (SoC), as formalized in ISO/IEC/IEEE 42010:2011: viewpoints define concerns, views realize them. By letting engineers focus on one concern at a time, multi-view modeling reduces cognitive load and promotes semantic consistency.

## Viewpoints and Views

A viewpoint groups a family of **views**. Each view targets instances of a specific metaclass and determines how they appear on the canvas. The targeting mechanism is the **predicate**: a boolean expression that selects which instances the view applies to.

Each view has up to four components:

**Predicate** selects the instances this view applies to. Without a predicate, the view applies to all instances of its target metaclass. You can write predicates in OCL or JavaScript.

**Template** defines the visual structure of matching instances. Templates use JSX and have access to three variables: `data` (the abstract syntax attributes), `node` (the concrete syntax / layout attributes), and `view` (the view-level attributes).

**Style** controls the visual appearance using SCSS. Styles are scoped to the view and can be layered with overlay viewpoints.

**Events** define behavior using the ECA (Event-Condition-Action) model. An event rule fires on data changes and can update node state attributes, enabling computed properties, validation feedback, and simulation.

<!-- TODO: screenshot -- viewpoint panel showing views with their components (new UI) -->

## Exclusive vs Overlay Viewpoints

Viewpoints come in two kinds, determined by the **Is Exclusive** checkbox when you create them.

### Exclusive viewpoints

Syntax viewpoints are typically **exclusive**: only one exclusive viewpoint can be active at a time. When you activate "State Machine Visual Syntax", the previously active exclusive viewpoint is deactivated. This makes sense for concrete syntax: you see either the Chen notation or the crow's foot notation, not both.

In the Viewpoints panel, exclusive viewpoints show a solid **EX** badge.

### Overlay viewpoints

An **overlay** (non-exclusive) viewpoint adds features on top of whatever exclusive viewpoint is currently active. Multiple overlays can be active simultaneously. They extend or override existing view definitions without replacing the entire concrete syntax.

In the Viewpoints panel, overlay viewpoints show a dimmed **EX** badge (indicating the exclusive flag is off).

Overlay viewpoints serve several purposes:

**Decoration**: add visual markers to existing nodes. For example, an orange outline on all State instances, or a colored badge on elements that meet certain criteria.

**Validation**: check constraints that the metamodel syntax alone cannot express. For example, enforcing that a state machine has exactly one Initial State.

**Semantics and simulation**: attach runtime behavior to model elements, such as state machine execution.

**Editor behavior enhancement**: modify how the editor responds to user actions on specific elements.

**In-place transformations**: apply model-level changes triggered by events.

### How overlays compose

When an overlay viewpoint defines a view for the same metaclass as the active exclusive viewpoint, the overlay's definitions layer on top. If the overlay provides only a style (no template), the exclusive viewpoint's template remains and the overlay's style is applied on top. If the overlay provides a template, it overrides the exclusive viewpoint's template for that metaclass.

<!-- TODO: screenshot -- viewpoints panel showing EX badges, one overlay active (new UI) -->

## Creating a Viewpoint

To create a new viewpoint:

1. Open the metamodel editor
2. Click **+** in the Viewpoints panel
3. Enter a name (e.g., `Colored Viewpoint`)
4. Set the **Is Exclusive** checkbox: checked for syntax viewpoints, unchecked for overlays
5. The viewpoint appears in the list

To activate a viewpoint, click on it. For exclusive viewpoints, this deactivates the previously active one. For overlay viewpoints, you toggle them on and off independently.

<!-- TODO: screenshot -- creating a viewpoint with Is Exclusive unchecked (new UI) -->

## Decoration Overlays

A decoration overlay modifies the visual appearance of elements without replacing their template. The typical workflow:

1. Create a new viewpoint with **Is Exclusive unchecked**
2. Add a view targeting the metaclass you want to decorate (e.g., `State`)
3. Leave the template empty (or remove it)
4. Define only the **style**, for example:

```scss
&>.root {
    outline: 4px solid orange;
}
```

5. Activate the overlay

The result: all State instances show an orange outline on top of whatever concrete syntax the active exclusive viewpoint defines. Initial State and Final State (which inherit from State) are also affected.

### View component requirements for decoration

| View Component | Required | Optional | Not Applicable |
|----------------|----------|----------|----------------|
| Predicate      |          | Y        |                |
| Template       | Y        |          |                |
| Observed Properties |     | Y        |                |
| Style          | Y        |          |                |
| Event rule (ECA) |        | Y        |                |

The template is listed as required because the overlay must know the structural context, but in practice you can leave it empty to inherit the exclusive viewpoint's template. The style is where the decoration happens.

## Validation Overlays

Jjodel ships with a **Default Validation** viewpoint. It is an overlay with three built-in views:

**Generic error view** displays error notifications in a uniform way across all metaclasses.

**Lowerbound error view** checks that all associations satisfy their minimum multiplicity constraints.

**Naming error view** enforces that instance names conform to identifier rules (no special characters).

You can add custom validation views to the Default Validation viewpoint, or create your own validation overlay.

### View component requirements for validation

| View Component | Required | Optional | Not Applicable |
|----------------|----------|----------|----------------|
| Predicate      |          | Y        |                |
| Template       |          |          | Y              |
| Observed Properties |     | Y        |                |
| Style          |          |          | Y              |
| Event rule (ECA) | Y      |          |                |

Validation views rely entirely on the ECA rule. No template or style is needed; the validation viewpoint uses the Generic error view's template to render any errors.

### Validation rule pattern

A validation rule checks a condition and writes an error to `node.state`. The pattern:

```javascript
if (condition) {
    node.state = {error_type: error_message}
} else {
    node.state = {error_type: undefined}
}
```

The `error_type` key identifies the kind of error (e.g., `error_lowerbound`, `error_naming`). Setting it to `undefined` clears the error when the condition is no longer violated.

### Example: enforce a single Initial State

To enforce that a state machine has exactly one Initial State, create a validation view targeting the `Initial State` metaclass with this `onDataUpdate` rule:

```javascript
// Count all Initial State instances in the model
let count = data.$parent.$children
    .filter(c => c.$className === 'Initial State').length;

if (count > 1) {
    node.state = {error_initial: "Only one initial state allowed!"}
} else {
    node.state = {error_initial: undefined}
}
```

When a second Initial State is added to the model, the validation overlay immediately shows an error notification next to the offending instance.

<!-- TODO: screenshot -- validation error showing "Only one initial state allowed!" (new UI) -->

## Views in Detail

### Predicates

A predicate is a boolean expression that determines which instances a view applies to. You can write predicates in:

**OCL** (Object Constraint Language): the classic MDE approach. Example: `self.oclIsTypeOf(State)`.

**JavaScript**: more accessible for web developers. Example: `data.$className === 'State'`.

Predicates define the **syntactic mapping** (σ) between abstract and concrete syntax. Each view's predicate selects a subset of model instances and maps them to their visual representation through the view's template and style. This is how the language tuple L = (A, C, S, σ, ⟦·⟧) is realized in practice.

### Templates

Templates use JSX and receive three variables:

`data` provides access to the abstract syntax (the DObject and its attributes). Navigate the model tree: `data.$parent`, `data.$children`, `data.$className`. Access attribute values with the `$` prefix: `data.$name`, `data.$ownedTransitions`.

`node` provides access to the concrete syntax (position, size, layout, state attributes). Use `node.state` to read and write computed properties.

`view` provides access to view-level attributes and user-defined parameters.

Templates can contain **queries** that navigate the model. Jjodel replaced OCL with JSX for model querying; a query is simply a JavaScript expression inside JSX that accesses `data` properties.

### Styling

Styles use SCSS, scoped to the view. The root selector `&>.root` targets the outermost container of the rendered node. Overlay styles are applied after exclusive viewpoint styles, so they can override or extend properties.

### Events (ECA)

See [Jjodel Events](../reference/jjodel-events) for the full ECA model. In viewpoint context, the most common event is `onDataUpdate`, which fires whenever the model data changes and lets you update `node.state` with computed or validation results.

## Default Viewpoints

Every metamodel starts with two built-in viewpoints:

**Default** is an exclusive syntax viewpoint that provides a generic rendering for all metaclass instances. It shows each instance as a labeled box with its attributes. This is the fallback when no custom syntax viewpoint is active.

**Default Validation** is an overlay viewpoint with built-in views for generic errors, lowerbound checks, and naming conformance. It is active by default and can be toggled off.

When you create a custom exclusive viewpoint (e.g., "State Machine Visual Syntax"), it takes precedence over the Default viewpoint. Any metaclass not covered by a view in the custom viewpoint falls back to the Default viewpoint's rendering.

:::caution
Viewpoints are part of the notation definition, not the model data. Modifying a viewpoint changes the visualization, not the model structure. Deleting a viewpoint does not delete any model elements.
:::
