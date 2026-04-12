---
title: Nodes & Edges
description: Visual elements in the diagram — shapes, labels, connections, and layout.
sidebar:
  order: 5
  label: Nodes & Edges
---

# Nodes & Edges

In Jjodel's graphical editor, model elements are rendered as **nodes** (shapes) and **edges** (connections). Understanding how nodes and edges work is essential for creating effective visual representations of your models.

## Nodes

A node is the visual representation of a model element on the canvas. Nodes are defined by the active viewpoint and can take various forms: rectangles, ellipses, diamonds, compartmentalized boxes, or custom SVG shapes.

### Node Properties

Each node has configurable visual properties:

- **Position** (x, y) — location on the canvas
- **Size** (width, height) — dimensions of the shape
- **Shape** — the geometric form used to render the element
- **Label** — text content, typically bound to an attribute of the model element
- **Fill color** and **border** — visual styling
- **Compartments** — internal subdivisions for displaying child elements (e.g., attributes inside a class box)

<!-- TODO: screenshot — node with properties highlighted (new UI) -->

### Interacting with Nodes

You can interact with nodes in the graphical editor by:

- **Clicking** — select the node and display its properties in the Properties Panel
- **Double-clicking** — enter edit mode (e.g., to rename the element)
- **Dragging** — move the node on the canvas
- **Resizing** — drag the resize handles to change dimensions
- **Right-clicking** — access the context menu for additional actions (delete, duplicate, add children)

## Edges

An edge is a visual connection between two nodes, typically representing a reference or association in the metamodel.

### Edge Properties

- **Source** and **target** — the two nodes connected by the edge
- **Line style** — solid, dashed, dotted
- **Arrow type** — none, open, closed, diamond (for composition/aggregation)
- **Routing** — direct (straight line) or Manhattan (orthogonal segments)
- **Labels** — text displayed on the edge (e.g., role name, multiplicity)
- **Bend points** — intermediate points that control the edge path

### Edge Routing

Jjodel supports two routing modes:

- **Direct routing** — a straight line from source to target
- **Manhattan routing** — the edge follows horizontal and vertical segments, creating clean right-angle paths typical of UML diagrams

## Layout

Jjodel provides layout options to automatically arrange nodes and edges on the canvas. Layout algorithms can be applied globally to the entire diagram or locally to selected elements.

:::note
Node positions and sizes are part of the viewpoint configuration, not the model itself. Different viewpoints can display the same model elements at different positions and with different shapes.
:::
