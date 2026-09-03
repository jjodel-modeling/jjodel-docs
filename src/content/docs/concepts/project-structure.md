---
title: Project Structure
description: How projects, metamodels, models, transformations, and viewpoints are organized in Jjodel.
sidebar:
  order: 3
---

In Jjodel, a **project** is the top-level container that organizes all the resources needed to define, visualize, and work with your modeling languages. Understanding the project structure helps you manage complexity as your languages grow.

## Anatomy of a Project

Every Jjodel project follows a layered hierarchy:

```
Project
├── Metamodel(s)          — language definitions
│   ├── Package(s)        — logical groupings
│   │   ├── Class(es)     — element types
│   │   │   ├── Attributes
│   │   │   ├── References
│   │   │   └── Operations
│   │   └── ...
│   └── ...
├── Model(s)              — instances conforming to metamodels
│   └── Objects           — concrete elements with attribute values
├── Transformation(s)     — JjTL rules from one metamodel to another
└── Viewpoint(s)          — syntax, decoration, validation, and semantics
    └── Views             — per-metaclass rendering rules
```

The project page lists these four sections, and the tree in the right rail shows the same structure as one hierarchy, with the models nested under the metamodel they conform to.

The tree shows what contains what. The relations between the artifacts run differently:

![A model conforms to a metamodel, a viewpoint renders it, and a transformation declared between two metamodels produces one model from another](./images/project-artifacts.svg)

A project also carries a **type** that decides who can reach it: **Private**, **Public**, or **Collaborative**. See [Dashboard](../../user-guide/dashboard) for how the type is set and how whole projects are imported and exported.

## Metamodels

Metamodels define the structure and constraints of the models in your project. Each metamodel specifies the allowable elements, relationships, and rules. Multiple metamodels can coexist within a single project, which is what makes transformations between them possible.

The [Metamodel Editor](../../user-guide/metamodel-editor) is where you build them: classifiers on the canvas, features dropped onto them, references drawn between anchors.

## Models

Models contain the actual data: instances of metamodel elements. Each model conforms to one metamodel, and the status bar tells you so at a glance.

There are three ways to work on the same model, and they stay in sync:

- The **canvas**, which renders the model through the active viewpoint
- The **tree**, which shows the containment hierarchy and is the fastest way to find one element
- The [Data Manager](../../user-guide/data-manager), which shows instances as a table with forms and needs no viewpoint at all

## Transformations

A transformation reads a model conforming to one metamodel and produces a model conforming to another. Rules are written in JjTL in the [Transformation Editor](../../user-guide/transformation-editor), which validates them, runs them, and keeps a trace of what each rule produced.

## Viewpoints

Viewpoints define how models are rendered, decorated, validated, and given behavior. A viewpoint's **type** is chosen when you create it and decides how it composes with the others: a **Syntax** viewpoint is exclusive, so only one can be active at a time, while **Decoration**, **Validation**, **Semantics**, and **Editor behavior** viewpoints are overlays that stack on top of it.

Inside a viewpoint, each view targets a metaclass and describes how its instances draw: as a node, as a row inside another node, or as an edge. See [Viewpoints](../../user-guide/viewpoints) for how they compose and [View Designer](../../user-guide/view-designer) for how a single view is authored.

## Validation

Validation rules ensure model integrity beyond what the metamodel structure can express. They live in validation viewpoints and report through the editor: a warning triangle on the affected row in the tree, a marker on the node, and a message when you hover it.

## Feedback surfaces

Three places report what the tools are doing:

- The **status bar** at the bottom of an editor, with the element counts and the conformance state of the model
- The **Problems** and **Output** tabs of the Transformation Editor, for validation errors and execution details
- The [Console](../../user-guide/console), where JjScript and JjEL run and Jjodie answers

:::tip[One project, many perspectives]
A single project can contain multiple metamodels, multiple models, and multiple viewpoints. This modular structure lets you start simple and scale as your language and domain grow in complexity.
:::
