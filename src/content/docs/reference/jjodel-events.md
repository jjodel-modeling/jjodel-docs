---
title: Jjodel Events
description: Event-driven interactions using the Event-Condition-Action model.
sidebar:
  order: 3
---

Jjodel supports an event-driven interaction model that allows you to define custom behaviors in response to user actions on model elements. Events are configured through the **Events** tab in the Viewpoint Properties Panel.

## The Event-Condition-Action Model

Rules in Jjodel follow the **Event-Condition-Action (ECA)** model. System behavior is defined through triples:

- An **event** triggers the rule (e.g., the user clicks an element, an attribute value changes)
- A **condition** checks whether the rule should fire (optional guard expression)
- An **action** executes when the condition holds (JavaScript code that reads or modifies the JjOM)

ECA rules let Jjodel react to changes, enforce constraints, and update state in a clear and predictable way. They are the mechanism through which viewpoints gain dynamic behavior beyond static rendering.

## Supported Events

Jjodel provides handlers for the following user interactions:

| Event | Triggered When |
|-------|---------------|
| `onClick` | The user clicks on a node or edge |
| `onDoubleClick` | The user double-clicks on an element |
| `onDrag` | The user drags a node to a new position |
| `onDragStart` | A drag operation begins |
| `onDragEnd` | A drag operation ends |
| `onResize` | The user resizes a node |
| `onDataUpdate` | An attribute or reference value changes |
| `onSelect` | An element is selected |
| `onDeselect` | An element is deselected |
| `onHover` | The cursor enters an element's bounding box |
| `onHoverEnd` | The cursor leaves an element's bounding box |

## Configuring Events

Events are defined per viewpoint view. To configure an event:

1. Select the viewpoint view in the editor
2. Open the **Events** tab in the Properties Panel
3. Choose the event type
4. Write the handler logic in JavaScript

### Example: onClick Handler

```javascript
// When a class is clicked, log its name to the console
(element) => {
  console.log("Clicked:", element.name);
}
```

### Example: onDataUpdate Handler

The `onDataUpdate` event is particularly useful for computing derived values. In an algebraic expression language, you can propagate computed results upward through the model tree:

```javascript
// When an operand changes, recompute the result
(element, attribute, newValue) => {
  if (attribute.name === "name" && newValue.length === 0) {
    console.warn("Name cannot be empty");
  }
}
```


## Validation Rule Pattern

Validation rules are a specific use of the ECA model within overlay viewpoints. They check a constraint on every data update and write the result to `node.state`, where it can be picked up by the validation template for display.

The standard pattern:

```javascript
if (condition) {
    node.state = {error_type: error_message}
} else {
    node.state = {error_type: undefined}
}
```

The `error_type` key identifies the kind of error. Common conventions: `error_lowerbound` for multiplicity violations, `error_naming` for invalid identifiers, `error_custom` for domain-specific rules. Setting the key to `undefined` clears the error when the condition is no longer violated.

### Example: enforcing a single Initial State

In a state machine metamodel, each model should have exactly one Initial State. This constraint cannot be expressed by the metamodel syntax alone (the metamodel allows zero or more Initial State instances). A validation rule enforces it:

```javascript
// onDataUpdate handler for the Initial State metaclass
let count = data.$parent.$children
    .filter(c => c.$className === 'Initial State').length;

if (count > 1) {
    node.state = {error_initial: "Only one initial state allowed!"}
} else {
    node.state = {error_initial: undefined}
}
```

This rule runs on every data change. It navigates from the current instance (`data`) to its parent container (`$parent`), then counts all siblings that are Initial State instances. If the count exceeds one, it writes an error to `node.state`. The Default Validation viewpoint's Generic error view picks up the error and renders a notification next to the offending element.

The rule handles both directions: adding a second Initial State triggers the error; deleting it clears the error automatically (the `else` branch sets the key to `undefined`).

### Built-in validation rules

The Default Validation viewpoint includes three pre-configured rules:

**Lowerbound check**: verifies that all references satisfy their minimum multiplicity. If a reference has `lowerBound = 1` and no target is set, the rule writes `error_lowerbound`.

**Naming conformance**: verifies that instance names conform to identifier rules (no special characters, no spaces in names that should be identifiers). Writes `error_naming` on violation.

**Generic error view**: does not contain a rule itself but provides the template and style used to render all validation errors uniformly. It reads error keys from `node.state` and displays them as tooltips or inline notifications.





For an `Add` expression with `left` and `right` references: `val = left.val + right.val`. This rule fires whenever either operand changes, propagating the new result up the expression tree reactively.

## Custom DOM Events

For advanced scenarios where callback chains are insufficient, Jjodel supports **custom DOM events** for inter-component communication. These events follow the standard browser `CustomEvent` API and can be dispatched and listened to across different parts of the interface.

:::note
Event handlers execute in the browser context and have access to the current model, the selected element, and the active viewpoint. Use them to create rich, interactive modeling experiences.
:::
