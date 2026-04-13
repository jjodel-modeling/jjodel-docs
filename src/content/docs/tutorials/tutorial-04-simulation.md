---
title: "Tutorial 4: State Machine Simulation"
description: Build a complete state machine language with visual syntax, edge routing, and operational semantics simulation.
sidebar:
  order: 4
  label: "Tutorial 4: Simulation"
---

This tutorial builds a state machine language from scratch. You will define the metamodel, create a visual concrete syntax with viewpoints, and add operational semantics that let you simulate the state machine by clicking event buttons.

## Objective

By the end of this tutorial you will have a working state machine editor where states are rendered as rounded boxes, transitions as labeled arrows, and a simulation panel lets you reset the machine and fire events to watch states activate in sequence.

## Prerequisites

Complete [Tutorial 1: Basic Metamodel](./tutorial-01-basic) before starting. You should know how to create metaclasses, attributes, and references.

## The State Machine Metamodel

### Abstract syntax

The metamodel uses three concrete metaclasses plus one abstract parent.

**namedElement** (abstract) provides a `name: EString` attribute inherited by all others.

**State** represents a control state. It owns a set of outgoing transitions through a containment reference `ownedTransitions: Transition [0..*]`. Each Transition belongs to exactly one State (its source), and transitions cannot exist without their containing State.

**Transition** represents an edge between two states. It has two references: `nextState: State [1]` (the target state, mandatory) and `event: Event [0..1]` (the triggering event, optional).

**Event** represents a trigger that causes a transition to fire. A Transition may reference zero or one Event (`0..1`), meaning transitions can fire without an explicit event.

### Create the metamodel

1. Create a new project
2. Add the four metaclasses: `namedElement`, `State`, `Transition`, `Event`
3. Set `namedElement` as abstract
4. Add the `name: EString` attribute to `namedElement`
5. Set State, Transition, and Event to extend `namedElement`
6. Add the `ownedTransitions` containment reference from State to Transition (`0..*`)
7. Add the `nextState` reference from Transition to State (`1`)
8. Add the `event` reference from Transition to Event (`0..1`)

<!-- TODO: screenshot -- state machine metamodel in editor (new UI) -->

### Implied semantics

This metamodel corresponds to the classical semantics of a Labeled Transition System (LTS). States correspond to graph nodes. Transitions correspond to labeled edges. Events serve as labels. The source state of a transition is implicit (the State that contains the Transition via `ownedTransitions`). The target state is explicit (the `nextState` reference).

## Creating a Model

Create a model conforming to the metamodel. Add three states (S0, S1, S2), two transitions (T1 from S0 to S1, T2 from S1 to S2), and one event (go) referenced by both transitions.

In the abstract syntax view, you see the standard instance representation with all attributes and references visible.

<!-- TODO: screenshot -- state machine model in abstract syntax (new UI) -->

## Defining the Concrete Syntax

### Create the viewpoint

1. In the Viewpoints panel, click **+** to create a new viewpoint
2. Name it `Visual Concrete Syntax`
3. Leave **Is Exclusive** checked (this is a syntax viewpoint)
4. Click the checkmark to activate it

<!-- TODO: screenshot -- viewpoints panel with Visual Concrete Syntax created (new UI) -->

### Add a view for State

Right-click on the `State` metaclass in the metamodel editor and select **Add View**. This creates a default view for all State instances. The default view shows a box with the name and a placeholder body text.

<!-- TODO: screenshot -- default view for State with placeholder (new UI) -->

### Customize the State template

Open the view's **Template** tab. The default JSX template includes a header with `<Input>` components and a body with placeholder text. Simplify it to show only the state name:

```jsx
<div className={'root'}>
    <div className={'header'}>
        <div className={'input-container mx-2'}>
            {data.$name ?
                <Input data={data.$name} field={'value'} hidden={true} autosize={true} placeholder={'...'} />
                <Input data={data} field={'name'} hidden={true} autosize={true} placeholder={'Name'} />
            }
        </div>
    </div>
    {decorators}
</div>
```

The key change: the body div is removed. States now render as compact labeled boxes.

### Customize the State style

Open the view's **Style** tab. The style editor has two sections: user-defined parameters (background-, border-color-, color- with palette swatches) and the Local CSS & LESS Editor.

Modify the SCSS to create rounded state boxes:

```scss
&>.root {
    border: 2px solid var(--border-color-1)!important;
    border-radius: 12px;
    background-color: var(--background-1);
    color: var(--color-1);
    display: flex;
    justify-content: center;
    align-items: center;
    width: 150px;
    height: 65px;

    &>.header {
        text-align: center;
        padding: 0px;
        margin: 0px;
    }
}
```

The user-defined parameters (`--background-1`, `--border-color-1`, `--color-1`) let you change colors via the palette swatches without editing CSS.

<!-- TODO: screenshot -- customized State rendering as rounded box (new UI) -->

### Add a view for Transition (silent view)

The view for Transition is a **silent view**: it does not render a visible box. Instead, it draws an edge from the source state to the target state. A silent view sets `width: 0; height: 0` in its style so the node itself is invisible; only the Edge component is visible.

Right-click on the `Transition` metaclass and select **Add View**. Then customize the template:

```jsx
<div className={'root'}>
    {data.$nextState.value &&
        <Edge
            view={'EdgeAssociation'}
            key={data.id + '_edge'}
            start={data.parent.parent.node}
            end={data.$nextState.value.node}
            label={data.$event && data.$event.value && data.$event.value.name}
        />
    }
    {decorators}
</div>
```

The template checks that `nextState` is set before rendering the edge. The `start` property navigates from the Transition to its parent State and then to that State's node. The `end` property navigates to the target State's node. The `label` shows the event name if one is assigned.

Set the style to make the Transition node invisible:

```scss
&>.root {
    border: 0px solid var(--border-color-1)!important;
    width: 0px;
    height: 0px;
}
```

<!-- TODO: screenshot -- complete state machine with edges and event labels (new UI) -->

## Adding Simulation

### The simulation viewpoint

The simulation layer is built as an **overlay viewpoint** (non-exclusive). It adds behavior on top of the visual syntax without replacing it. The approach uses three mechanisms:

1. A state attribute `active` on State instances to track which state is currently active
2. A `resetStateMachine` custom event action that initializes the simulation
3. Event buttons in a `<Panel>` component that fire transitions

### State attributes and observed properties

State attributes work like attribute grammars: they store intermediate results needed for a specific purpose. In Jjodel, synthesized and inherited attributes must be explicitly declared as **observed properties**. When an observed property changes, it triggers the `onDataUpdate` event, which lets other rules react to the change.

For simulation, the `active` attribute is a boolean state attribute on State instances. It determines whether a state is currently active in the simulation.

### Panel and Control components

The Model view (the topmost view that contains all rendered elements) can include `<Panel>` and `<Control>` components. These render as floating panels on the canvas.

The `<Panel>` component creates a titled panel with custom content:

```jsx
<Panel title={'State Machine Simulation'}>
    <div className={'panel_content'}>
        <button onClick={resetStateMachine}>Reset</button>
        {data.allSubObjects.filter(o => o.instanceof.name === 'Event').map(e =>
            <button>{e.name}</button>
        )}
    </div>
</Panel>
```

This panel shows a Reset button and one button for each Event instance in the model. The event buttons are generated dynamically by querying the model for all Event instances.

The `<Control>` component adds workbench-level controls:

```jsx
<Control title={'Workbench'} payoff={'Options'}>
    <Slider name={'level'} title={'Detail level '} node={node} max={3} />
    <Toggle name={'grid'} title={'Grid'} node={node} />
    <Toggle name={'snap'} title={'Snap'} node={node} />
</Control>
```

<!-- TODO: screenshot -- simulation panel with Reset and event buttons (new UI) -->

### Implementing resetStateMachine

The `resetStateMachine` function is defined as a custom event action in the Model view's **Events** tab. It performs two steps:

1. Select all State instances and set their `active` attribute to `false`
2. Find the initial state (the state with no incoming transitions, i.e., no Transition has it as `nextState`) and set its `active` attribute to `true`

### Implementing nextState

When an event button is clicked, the action finds the currently active state, looks for a transition triggered by that event, and if found, deactivates the current state and activates the target state. This implements the step semantics of the LTS.

### Visual feedback

The State view's template reads the `active` state attribute and applies conditional styling. An active state might show a green background or a thicker border, giving immediate visual feedback during simulation.

## Summary

This tutorial covered the full lifecycle of a modeling language in Jjodel: metamodel definition (abstract syntax), viewpoint creation (concrete syntax), silent views for edges, simulation panels with Panel/Control components, state attributes as observed properties, and custom event actions for operational semantics. The same ECA mechanism that powers validation (see [Viewpoints](../user-guide/viewpoints)) also powers simulation; the difference is what the rules compute.
