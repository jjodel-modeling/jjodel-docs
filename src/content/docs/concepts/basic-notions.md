---
title: Basic Notions
description: Fundamental concepts for understanding Jjodel — models, metamodels, viewpoints, and the JjOM.
sidebar:
  order: 1
---

Jjodel builds on a set of concepts from Model-Driven Engineering (MDE). This page introduces them in the order you will encounter them while using the platform.

## Abstraction

Abstraction is the act of focusing on what matters for a given purpose and ignoring everything else. It is not a simplification for its own sake; it is a deliberate choice about which details are relevant.

Consider a scale model of a car: it reproduces the shape and proportions but not the engine, the wiring, or the upholstery. That model is useful for studying aerodynamics but useless for understanding the electrical system. A crash-test dummy, on the other hand, reproduces the weight distribution of a human body but tells you nothing about anatomy. Each model serves a specific purpose, and neither is complete.

This is the fundamental trade-off: a model that captures everything is as expensive and complex as the real system. A useful model captures only the aspects that answer the questions you care about.

## Models

A **model** is a structured representation of a system, built for a specific cognitive purpose. The definition by J. Rothenberg captures this precisely: a model is the cost-effective use of something in place of something else, allowing us to deal with the world in a simplified manner while avoiding the complexity, danger, and irreversibility of reality.

Two consequences follow from this definition:

1. **All models are partial.** They represent a subset of the system. If they represented everything, they would be the system itself.
2. **Wrong models are dangerous.** If the model misrepresents the system, any conclusions drawn from it will be wrong. The ancient medical practice of bloodletting was based on the four humours model, which turned out to be fundamentally incorrect.

### Contemplative vs Productive Models

Models can be used in two fundamentally different ways.

**Contemplative models** serve as documentation. They convey information between people: from designers to implementors, from architects to stakeholders. They can be partial, informal, and approximate. A whiteboard sketch of a system architecture is a contemplative model.

**Productive models** are formal documents that can be processed automatically by programs. An Entity-Relationship diagram that gets transformed into a database schema is a productive model. A metamodel that generates an editor is a productive model.

Jjodel treats models as productive artifacts. They conform to a metamodel, can be validated, transformed, and used to generate code. At the same time, because they are visual and interactive, they also serve a contemplative role.

## Metamodels

A **metamodel** defines the vocabulary and grammar of a modeling language. It specifies:

- What **types of elements** can exist (e.g., `Class`, `Attribute`, `Association`)
- What **properties** each element type has (e.g., a `Class` has a `name` of type `String`)
- What **relationships** are valid between element types (e.g., a `Class` *contains* zero or more `Attributes`)
- What **constraints** must be satisfied (e.g., every `Class` must have a unique name)

A model **conforms to** its metamodel, exactly as a program written in Java conforms to the Java grammar. If the model violates the metamodel rules, it is invalid.

### Meta-levels

MDE organizes artifacts into four levels, where each level conforms to the one above it:

| Level | Name | Example |
|-------|------|---------|
| **M3** | Meta-metamodel | Ecore, Jjodel meta-metamodel |
| **M2** | Metamodel (DSL) | Your DSL definition (e.g., the ER metamodel) |
| **M1** | Model | A specific ER diagram (instances of your DSL) |
| **M0** | System | The real-world system being described |

The **meta-metamodel** (M3) defines the language for building metamodels. It provides the building blocks: Class, Attribute, Reference, Enumeration, Constraint, Package. Every user-defined metamodel is an instance of this meta-metamodel.

Jjodel's meta-metamodel is built on top of Ecore, inheriting its core concepts but extending them to reduce accidental complexity. When you create a class in the Metamodel Editor and add attributes and references to it, you are using M3 constructs to define an M2 artifact. When someone later instantiates that class in a model, they produce M1 elements that conform to your M2 metamodel.

The practical consequence: you never interact with M3 directly. Jjodel's editor UI exposes the meta-metamodel constructs as buttons and forms. See the [Primitive Data Types](../reference/jjom#primitive-data-types) in the JjOM reference for the complete list of built-in types available at the meta-metamodel level.

## The Viewpoint System

A **viewpoint** defines a perspective on a model. It specifies how model elements are rendered, validated, or transformed. Jjodel's viewpoint system supports:

- **Syntax viewpoints** that define the visual or textual concrete syntax
- **Validation viewpoints** that enforce constraints and business rules
- **Code generation viewpoints** that transform model data into code or text

Multiple viewpoints can coexist on the same model, each providing a different perspective without altering the underlying data. This is the foundation of **multi-view modeling** in Jjodel.

## Abstract Syntax vs Concrete Syntax

The **abstract syntax** is the metamodel: it defines what elements exist and how they relate. When you work with a model using only the abstract syntax, each element appears as an individual item with properties that you fill in manually. This is verbose and does not scale well.

The **concrete syntax** is the visual or textual representation defined by a viewpoint. An ER diagram can have a conceptual syntax (ovals, diamonds, rectangles) or a logical syntax (boxes with lines). Both represent the same abstract syntax; they just look different.

The separation between abstract and concrete syntax is fundamental. You define the structure once (metamodel) and then create as many visual representations as you need (viewpoints).

## Elements, Nodes, and Edges

Jjodel distinguishes between the abstract and the visual:

- **Elements** are the building blocks of models: classes, attributes, associations, and other objects defined by the metamodel. They live in the abstract syntax.
- **Nodes** are the visual representations of elements in a diagram. A node defines how an element looks: its shape, color, label, position.
- **Edges** represent visual connections between nodes, typically corresponding to references or associations in the metamodel.

You can change how something looks (viewpoint) without changing what it is (model).

## Topological vs Layout-Sensitive Notations

Most visual notations in software engineering are **topological**: meaning is encoded in connectivity (which elements are connected by edges). You can move, resize, and rearrange elements freely without changing the model's meaning. ER diagrams and UML class diagrams are topological.

Some engineering domains use **layout-sensitive** notations where the spatial position of elements carries meaning. Railway track plans, PCB layouts, power cabinet schematics, and algebraic formulas all fall in this category. Moving an element to a different position changes the model's semantics.

Traditional modeling tools treat layout as decoration and ignore it semantically. Jjodel treats layout as a first-class concern through the node submodel of the [JjOM](../reference/jjom), ensuring that layout-sensitive notations preserve their semantic integrity.

## Accidental Complexity

As Grady Booch put it: "The real challenge of software engineering is not writing code, but managing complexity." This applies directly to modeling tools.

**Accidental complexity** is complexity that does not come from the problem you are solving but from the tools you are using to solve it. If you spend more time fighting the tool than thinking about the domain, you are dealing with accidental complexity.

Traditional metamodeling tools introduce accidental complexity through multi-step workflows: edit the metamodel, regenerate Java code, recompile, redeploy the editor, then test. Each step is a potential source of errors and interrupts the modeling flow. Jjodel is designed to minimize accidental complexity by eliminating this cycle entirely.

## Generative vs Reflective Platforms

Modeling tools differ in how they handle metamodel changes.

**Generative platforms** (EMF, MPS) require code generation and recompilation whenever the metamodel changes. You modify the metamodel, generate editor code, compile it, deploy it, and only then can you test the result. This creates a disruption in the modeling workflow.

**Reflective platforms** (Jjodel, MetaEdit+) react immediately to changes. When you modify the metamodel, all models and editors adapt automatically. There is no generation step, no compilation, no redeployment. The modeling flow is never interrupted.

Jjodel is both reflective and integrated: all artifacts (metamodel, models, viewpoints) live in the same environment and stay synchronized through a reactive architecture.

## Live Co-evolution

Live co-evolution is the practical result of Jjodel's reflective architecture. When you add a new attribute to a metamodel class, every existing model instance immediately gains that attribute. When you change a viewpoint template, the diagram updates in real time.

This is particularly valuable in two contexts: **research**, where rapid prototyping of DSLs requires constant metamodel iteration; and **teaching**, where students can focus on modeling concepts rather than fighting tool infrastructure.

## Constraints and Expressions

Jjodel supports two expression mechanisms for validation, navigation, and dynamic rendering:

- **OCL predicates** for selecting model elements and defining constraints (based on OCL.js)
- **JavaScript/JSX expressions** for template rendering, custom interaction logic, and advanced computations

In viewpoint templates, user-defined attributes and references are accessed using the `$` prefix: `data.$name` retrieves the value of attribute `name`, and `data.$left` navigates a reference called `left`.

## Collaboration

Jjodel supports **real-time collaborative modeling**. Multiple users can work on the same model or metamodel simultaneously. Every action is propagated through a cloud-based publish-subscribe infrastructure, ensuring all clients stay synchronized with minimal latency.
