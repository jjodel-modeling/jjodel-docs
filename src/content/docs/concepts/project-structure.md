---
title: Project Structure
description: How projects, metamodels, models, and viewpoints are organized in Jjodel.
sidebar:
  order: 2
---

# Project Structure

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
└── Viewpoint(s)          — visual/validation/generation perspectives
    └── Views             — per-class rendering rules
```

## Metamodels

Metamodels define the structure and constraints of the models in your project. Each metamodel specifies the allowable elements, relationships, and rules. Multiple metamodels can coexist within a single project, enabling complex multi-domain modeling scenarios.

The Metamodel Editor provides a visual interface for creating and modifying metamodel elements. It supports class creation, inheritance, attribute definition, reference establishment, and constraint specification.

## Models

Models contain the actual data — instances of metamodel elements. Each model adheres to the rules and structure defined by its corresponding metamodel, ensuring consistency within the project.

The Model Editor enables you to instantiate metamodel elements, set attribute values, establish references, and visualize the model structure according to the active viewpoint.

## Viewpoints

Viewpoints define how models are visualized, validated, or used for code generation. Each viewpoint contains configurations for appearance, layout, interaction, and behavior. You can create multiple viewpoints for the same model, tailoring the presentation to different audiences or purposes.

## Validation

Validation rules ensure data consistency and model integrity. These constraints — defined in the metamodel or through validation viewpoints — enforce structural requirements and business rules. When a constraint is violated, Jjodel displays notifications that guide you toward restoring validity.

## Logs

Jjodel includes a logging mechanism that records errors, warnings, and system events. Logs help you track modifications and maintain an audit trail, which is especially valuable in collaborative projects.

:::tip[One project, many perspectives]
A single project can contain multiple metamodels, multiple models, and multiple viewpoints. This modular structure lets you start simple and scale as your language and domain grow in complexity.
:::
