---
title: Basic Notions
description: Fundamental concepts for understanding Jjodel — models, metamodels, viewpoints, and the JjOM.
sidebar:
  order: 1
---

This section introduces the fundamental concepts that underpin Jjodel. Understanding these notions will help you work effectively with the platform and appreciate its design philosophy.

## Models and Metamodels

In Jjodel, a **model** is a structured representation of real-world or abstract concepts. Models are not free-form — they conform to a **metamodel**, which acts as a template or "model of models."

A metamodel defines:

- What **types of elements** can exist (e.g., `Class`, `Attribute`, `Association`)
- What **properties** each element type has (e.g., a `Class` has a `name` of type `String`)
- What **relationships** are valid between element types (e.g., a `Class` *contains* zero or more `Attributes`)
- What **constraints** must be satisfied (e.g., every `Class` must have a unique name)

Models and metamodels coexist within the **Jjodel Object Model (JjOM)** and are accessible through the same interface. This unified architecture is what enables Jjodel's live co-evolution: changes to the metamodel are immediately reflected in all conforming models and their visual representations.

## The Viewpoint System

A **viewpoint** defines a perspective on a model. It specifies how model elements are rendered, validated, or transformed. Jjodel's viewpoint system supports:

- **Syntax viewpoints** — define the visual or textual concrete syntax
- **Validation viewpoints** — enforce constraints and business rules
- **Code generation viewpoints** — transform model data into code or text

Multiple viewpoints can coexist on the same model, each providing a different perspective without altering the underlying data. This is the foundation of **multi-view modeling** in Jjodel.

## Elements, Nodes, and Edges

Jjodel distinguishes between the abstract and the visual:

- **Elements** are the building blocks of models: classes, attributes, associations, and other objects defined by the metamodel. They live in the abstract syntax layer.
- **Nodes** are the visual representations of elements in a diagram. A node defines how an element *looks* — its shape, color, label, position.
- **Edges** represent visual connections between nodes, typically corresponding to references or associations in the metamodel.

This separation means you can change how something looks (viewpoint) without changing what it *is* (model).

## Constraints and Expressions

Jjodel supports two expression mechanisms for defining behavior, validation, and dynamic rendering:

- **JjEL (Jjodel Expression Language)** — a domain-specific expression language for navigating models, accessing properties, and defining computed values
- **JavaScript/JSX expressions** — for custom interaction logic, template rendering, and advanced computations

Constraints defined using these expressions can validate model consistency, control visual appearance, and trigger actions based on user interactions.

## Live Co-evolution

Traditional metamodeling tools require a cycle of *edit metamodel → regenerate code → recompile → redeploy* whenever the language evolves. Jjodel eliminates this cycle entirely.

In Jjodel, the metamodel, models, and viewpoints are always synchronized. When you add a new attribute to a metamodel class, every existing model instance immediately gains that attribute. When you change a viewpoint template, the diagram updates in real time. This is possible because Jjodel's architecture is **reactive** and **reflective** — it observes its own structure and propagates changes automatically.

## Collaboration

Jjodel supports **real-time collaborative modeling**. Multiple users can work on the same model or metamodel simultaneously. Every action is propagated through a cloud-based publish-subscribe infrastructure, ensuring all clients stay synchronized with minimal latency.

:::note[Key takeaway]
In Jjodel, three artifacts form a complete language workbench: the **metamodel** (what can exist), the **model** (what does exist), and the **viewpoints** (how it looks and behaves). Changes propagate live across all three.
:::
