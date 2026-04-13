---
title: Anatomy of a Modeling Language
description: Understanding the components of a modeling language — abstract syntax, concrete syntax, validation, and generation.
sidebar:
  order: 4
---

A modeling language is a structured system of notation, rules, and semantics that allows users to represent complex concepts, systems, or domains in visual, textual, or blended form. In Jjodel, a modeling language is composed of four interrelated components, each serving a distinct role.

<!-- TODO: illustration — Jjodel conceptual model diagram (from WordPress) -->

## Metamodel (Abstract Syntax)

The metamodel is the foundation. It defines the **vocabulary** and **grammar** of your language: what kinds of elements can exist, what properties they have, and how they relate to each other.

A Jjodel metamodel is composed of:

- **Packages** (`DPackage`) — logical containers that group related classes
- **Classes** (`DClass`) — the element types of your language
- **Attributes** (`DAttribute`) — typed properties belonging to a class
- **References** (`DReference`) — relationships between classes, either containment (composition) or plain association

The metamodel provides the blueprint that all models must conform to, ensuring consistency and structural integrity.

## Concrete Syntax (Syntax Viewpoints)

The concrete syntax defines **how** abstract concepts are presented to the user. In Jjodel, concrete syntax is defined through **syntax viewpoints** — collections of views that map metamodel classes to their visual or textual representations.

A syntax viewpoint includes:

- **Shapes, icons, and colors** for representing classes and references visually
- **Layout rules** for positioning, alignment, and spacing
- **Labels** for displaying attribute values as text
- **Edge styles** for rendering connections between elements

Each view within a syntax viewpoint is associated with a **constraint** (in OCL or JavaScript) that determines which model instances it applies to. This enables selective rendering based on element type, property values, or context.

## Validation (Validation Viewpoints)

Validation viewpoints enforce the **rules and constraints** that model instances must satisfy. Validation is critical for catching errors and inconsistencies early in the modeling process.

Validation capabilities include:

- **Structural validation** — ensuring references point to valid targets, multiplicities are respected, required attributes are set
- **Semantic validation** — enforcing business rules or domain-specific logic
- **Custom constraints** — user-defined rules for naming conventions, dependency checks, or any domain requirement

When a validation rule is violated, Jjodel generates a notification — informational, warning, or error — that guides the modeler toward a fix.

## Code Generation (Generation Viewpoints)

Generation viewpoints transform model elements into **executable artifacts**: source code, configuration files, documentation, or any text-based output.

Code generation involves:

- **Mapping** metamodel classes to output templates
- **Iterating** over model instances to produce concrete artifacts
- **Customizing** generation rules for specific programming languages, frameworks, or output formats

This component closes the loop from abstract design to concrete implementation, making your models directly useful beyond the diagram.

## How They Fit Together

These four components form a layered architecture:

1. The **metamodel** defines what can exist (abstract syntax)
2. **Syntax viewpoints** define how it looks (concrete syntax)
3. **Validation viewpoints** define what is correct (semantics)
4. **Generation viewpoints** define what it produces (pragmatics)

Together, they constitute a complete language workbench. Jjodel's reactive architecture ensures that all four layers remain synchronized as you evolve any one of them.
