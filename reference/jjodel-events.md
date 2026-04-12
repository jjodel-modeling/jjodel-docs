---
title: Jjodel Events
description: Event-driven interactions — configuring custom behaviors for user actions.
sidebar:
  order: 3
---

# Jjodel Events

Jjodel supports an event-driven interaction model that allows you to define custom behaviors in response to user actions on model elements. Events are configured through the **Events** tab in the Viewpoint Properties Panel.

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

```javascript
// When an attribute changes, validate the new value
(element, attribute, newValue) => {
  if (attribute.name === "name" && newValue.length === 0) {
    console.warn("Name cannot be empty");
  }
}
```

## Custom DOM Events

For advanced scenarios where callback chains are insufficient, Jjodel supports **custom DOM events** for inter-component communication. These events follow the standard browser `CustomEvent` API and can be dispatched and listened to across different parts of the interface.

:::note
Event handlers execute in the browser context and have access to the current model, the selected element, and the active viewpoint. Use them to create rich, interactive modeling experiences.
:::
