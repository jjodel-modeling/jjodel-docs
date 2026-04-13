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

```javascript title="onClick"
// When a class is clicked, log its name to the console
(element) => {
  console.log("Clicked:", element.name);
}
```

### Example: onDataUpdate Handler

The `onDataUpdate` event is particularly useful for computing derived values. In an algebraic expression language, you can propagate computed results upward through the model tree:

```javascript title="onDataUpdate"
// When an operand changes, recompute the result
(element, attribute, newValue) => {
  if (attribute.name === "name" && newValue.length === 0) {
    console.warn("Name cannot be empty");
  }
}
```

For an `Add` expression with `left` and `right` references: `val = left.val + right.val`. This rule fires whenever either operand changes, propagating the new result up the expression tree reactively.

## Validation Rule Pattern

Validation rules are a specific use of the ECA model within overlay viewpoints. They check a constraint on every data update and write the result to `node.state`, where it can be picked up by the validation template for display.

The standard pattern:

```javascript title="Validation Rule Pattern"
if (condition) {
    node.state = {error_type: error_message}
} else {
    node.state = {error_type: undefined}
}
```

The `error_type` key identifies the kind of error. Common conventions: `error_lowerbound` for multiplicity violations, `error_naming` for invalid identifiers, `error_custom` for domain-specific rules. Setting the key to `undefined` clears the error when the condition is no longer violated.

### Example: enforcing a single Initial State

In a state machine metamodel, each model should have exactly one Initial State. This constraint cannot be expressed by the metamodel syntax alone (the metamodel allows zero or more Initial State instances). A validation rule enforces it:

```javascript title="Single Initial State Validation"
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

## Observed Properties

State attributes can be associated with model elements (data) or with syntax nodes. When you need a state attribute to trigger reactive updates, you must declare it as an **observed property** in the view configuration.

Observed properties work like attribute grammars: they store synthesized or inherited values computed from the model. The key difference from classical attribute grammars is that Jjodel requires these attributes to be explicitly declared. When an observed property changes value, it triggers the `onDataUpdate` event, which lets other ECA rules react to the change.

Declaring an observed property means the system watches that specific key in `node.state` (or in the data model) for changes. Without the declaration, writing to a state attribute still stores the value, but no `onDataUpdate` fires and no dependent rules execute.

### Example: active state for simulation

For state machine simulation, each State instance needs an `active` boolean attribute. When declared as an observed property on the State view:

1. The `resetStateMachine` action sets `active = true` on the initial state and `active = false` on all others
2. The change triggers `onDataUpdate` on each affected State node
3. The State template reads `node.state.active` and applies conditional styling (e.g., green background for the active state)
4. Other rules that depend on the active state can react accordingly

This creates a chain: button click → custom action → state attribute write → observed property change → onDataUpdate → template re-render.

## Custom Event Actions

Beyond the built-in events (`onDataUpdate`, `whileDragging`, etc.), you can define **custom event actions** in the Events tab of a view. A custom action is a named JavaScript function that can be called from template elements like buttons.

Custom actions are defined in the Events tab and referenced in the template by name:

```jsx title="JSX Template"
{/* In the template */}
<button onClick={resetStateMachine}>Reset</button>
```

```javascript title="resetStateMachine"
// In the Events tab, as a custom action named "resetStateMachine"
// 1. Deactivate all states
let allStates = data.allSubObjects
    .filter(o => o.instanceof.name === 'State');
allStates.forEach(s => {
    s.node.state = {active: false};
});

// 2. Find the initial state (no incoming transitions)
let initialState = allStates.find(s => {
    let isTarget = data.allSubObjects
        .filter(o => o.instanceof.name === 'Transition')
        .some(t => t.$nextState && t.$nextState.value === s);
    return !isTarget;
});

// 3. Activate the initial state
if (initialState) {
    initialState.node.state = {active: true};
}
```

This pattern separates the triggering mechanism (buttons in the template) from the execution logic (actions in the Events tab). The template handles presentation; the action handles model manipulation.

### Firing transitions

Event buttons trigger transition firing. When clicked, the action finds the currently active state, looks for a transition owned by that state whose event matches the clicked button, and if found, deactivates the current state and activates the target:

```javascript title="Firing Transitions"
// Custom action for event firing (simplified)
let activeState = data.allSubObjects
    .filter(o => o.instanceof.name === 'State')
    .find(s => s.node.state.active);

if (activeState) {
    let transition = activeState.$ownedTransitions
        .find(t => t.$event && t.$event.value && t.$event.value.name === eventName);
    if (transition && transition.$nextState && transition.$nextState.value) {
        activeState.node.state = {active: false};
        transition.$nextState.value.node.state = {active: true};
    }
}
```

This implements the step semantics of a Labeled Transition System (LTS): given the current state and an event, fire the matching transition and move to the next state.

## Custom DOM Events

For advanced scenarios where callback chains are insufficient, Jjodel supports **custom DOM events** for inter-component communication. These events follow the standard browser `CustomEvent` API and can be dispatched and listened to across different parts of the interface.

:::note
Event handlers execute in the browser context and have access to the current model, the selected element, and the active viewpoint. Use them to create rich, interactive modeling experiences.
:::
