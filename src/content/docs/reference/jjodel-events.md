---
title: Jjodel Events
description: The ECA rules a view can carry, the events that fire them, and the state they write.
sidebar:
  order: 3
---

A view can react. Beside the structure that says how an element draws, it holds a set of handlers that run when something happens to that element, and custom actions that the template can call. Handlers are written in the **Events** tab of the view.

## The Event-Condition-Action model

Rules follow the Event-Condition-Action pattern:

- An **event** fires the rule, for example a value changed or a node was dragged
- A **condition** decides whether the rule acts, as a guard inside the handler
- An **action** runs, reading the JjOM and writing state back

The action runs on the element the view applies to. Inside a handler you get the same three variables a template gets: `data` for the model element, `node` for its layout and state, and `view` for the view itself.

## Events

| Event | Fires when |
|-------|------------|
| `onDataUpdate` | A value in the model changes |
| `onDragStart` | A drag begins |
| `whileDragging` | On every tick of a drag |
| `onDragEnd` | A drag ends |
| `onResizeStart` | A resize begins |
| `whileResizing` | On every tick of a resize |
| `onResizeEnd` | A resize ends |
| `onRotationStart` | A rotation begins |
| `whileRotating` | On every tick of a rotation |
| `onRotationEnd` | A rotation ends |

`onDataUpdate` is the one that carries most of the work: it is what makes validation, derived values, and simulation react to an edit. The drag, resize, and rotation events belong to the layout submodel, and a handler on them reads and writes `node`.

Clicks are not in this list. A view reacts to a click through the element that receives it: a button or any other element in the template calls a custom action by name.

## Custom actions

Beside the events above, the Events tab holds named functions. They are stored on the view under `events`, keyed by name, and the template calls them:

```jsx title="Calling an action from a template"
<button onClick={resetStateMachine}>Reset</button>
```

```javascript title="resetStateMachine, in the Events tab"
// deactivate every state
let allStates = data.allSubObjects
    .filter(o => o.instanceof.name === 'State');
allStates.forEach(s => { s.node.state = {active: false}; });

// the initial state is the one no transition points to
let initialState = allStates.find(s => {
    let isTarget = data.allSubObjects
        .filter(o => o.instanceof.name === 'Transition')
        .some(t => t.$nextState && t.$nextState.value === s);
    return !isTarget;
});

if (initialState) { initialState.node.state = {active: true}; }
```

The template presents, the action manipulates. That separation is what keeps a view readable once it carries behavior.

## Writing state

Handlers communicate with templates through `node.state`, a free-form object on the layout node. A rule writes a key, the template reads it and draws accordingly.

```javascript title="The validation pattern"
if (condition) {
    node.state = {error_type: error_message}
} else {
    node.state = {error_type: undefined}
}
```

The key names the kind of error. `error_lowerbound` for a multiplicity that is not satisfied, `error_naming` for an identifier that does not conform, `error_custom` for a domain rule. Setting the key to `undefined` clears the error, which is what makes the rule handle both directions: the error appears when the model breaks the constraint and goes away when the user fixes it.

### One initial state

A state machine metamodel cannot say in its structure that exactly one initial state is allowed. A rule can:

```javascript title="onDataUpdate on the State view"
let count = data.father.allSubObjects
    .filter(o => o.instanceof.name === 'State' && o.$isInitial && o.$isInitial.value)
    .length;

if (count > 1) {
    node.state = {error_initial: "Only one initial state allowed!"}
} else {
    node.state = {error_initial: undefined}
}
```

The rule walks up to the container, counts the siblings that declare themselves initial, and writes the error when there is more than one. A validation viewpoint then renders it: its generic error view reads the keys in `node.state` and draws the marker next to the element.

### Rules that ship with Jjodel

The default validation viewpoint carries two rules and one view. The **lowerbound** rule reports a reference whose minimum multiplicity is not met, as `error_lowerbound`. The **naming** rule reports a name that is not a legal identifier, as `error_naming`. The **generic error** view holds no rule: it is the shape every error is drawn with, so that errors look the same wherever they come from.

## Observed properties

A key in `node.state` stores a value whether or not anything watches it. To make a change in that key fire `onDataUpdate` on the elements that depend on it, declare the key as an **observed property** on the view. Without the declaration, the write still lands, but no rule runs and nothing redraws.

This is the mechanism behind simulation. Declare `active` as an observed property on the State view, and the chain closes: a button calls an action, the action writes `active`, the observed property fires `onDataUpdate`, the view reads `node.state.active` and paints the current state.

```javascript title="Firing a transition"
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

That is the step semantics of a labeled transition system: take the active state, find the transition its event matches, move the token.

## Custom DOM events

Where a chain of callbacks is not enough, Jjodel components talk to each other with standard browser `CustomEvent`s. They are dispatched and listened to as in any web page, and they are the escape hatch for interactions that cross parts of the interface a view has no handle on.

:::note
Handlers run in the browser, on the same JjOM every editor reads. What they write is a model change like any other, so it lands in the undo history and reaches every view that shows the element.
:::
