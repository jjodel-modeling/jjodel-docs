---
title: Basic Notions
description: Core concepts of metamodeling and model-driven engineering as implemented in Jjodel.
sidebar:
  order: 1
  label: Basic Notions
---

Jjodel is a web-based metamodeling tool. To use it effectively, you need to understand a few foundational concepts: what models and metamodels are, how they relate, and how Jjodel organizes them.

## Models and Metamodels

A **model** is a simplified representation of a system. It captures the aspects that matter for a given purpose and ignores the rest. A class diagram models the structure of a software system; a floor plan models the layout of a building.

A **metamodel** defines the rules for building models. It specifies what kinds of elements a model can contain, what attributes they have, and how they can relate to each other. A metamodel for class diagrams defines that classes can have attributes and methods, and that classes can be connected by associations and inheritance.

The relationship between model and metamodel is called **conformance**: a model conforms to its metamodel if every element in the model is an instance of a metaclass defined in the metamodel, and all structural constraints (multiplicities, types, containment) are satisfied.

## Metalevels

Metamodeling operates across multiple levels:

**M3** (meta-metamodel) defines the constructs available for building metamodels. In Jjodel, this is the JjOM (Jjodel Object Model), which provides DClass, DAttribute, DReference, DEnumeration, and other building blocks. M3 is fixed; you do not modify it.

**M2** (metamodel) uses M3 constructs to define a domain. When you create a metamodel for state machines with State, Transition, and InitialState metaclasses, you are working at M2.

**M1** (model) creates instances that conform to the M2 metamodel. A specific state machine with states S1, S2, S3 and transitions between them is an M1 model.

As Grady Booch observed, every object-oriented system involves creating a language. In Jjodel, building a metamodel is building the abstract syntax of that language.

## Classification and Abstraction

Two cognitive operations underlie metamodeling:

**Classification** groups individual things into categories based on shared properties. Observing multiple traffic lights and recognizing they share the pattern (states: red/yellow/green, transitions between them) is classification. The result is a metaclass. This operation was first formalized in Simula (1967), where Dahl and Nygaard introduced the class construct to group objects with common behavior.

**Abstraction** removes detail to focus on relevant properties. A state machine metamodel abstracts away the physical mechanisms of a traffic light and captures only the state/transition structure. Classification and abstraction work together: you classify concrete things, then abstract away the irrelevant details to define the metaclass.

## Domain, Notation, and Separation of Concerns

A **domain** is the area of knowledge a modeling language targets. The domain of ER diagrams is relational data modeling; the domain of state machines is reactive behavior.

A **notation** is the concrete visual or textual form of a language. The same domain can have multiple notations: Chen notation and crow's foot notation both serve the ER domain but use different visual conventions.

The separation between domain (abstract syntax) and notation (concrete syntax) is a design principle in Jjodel. Changing the notation does not change the model. This is an application of **Separation of Concerns** (SoC): each aspect of the system (structure, appearance, validation) is handled independently.

### Separation of Concerns in Multi-View Modeling

SoC is essential for managing complexity. In multi-view modeling, it translates into viewpoints that represent distinct abstractions: structural, behavioral, validation. Each viewpoint addresses one concern, and engineers focus on one concern at a time.

This follows ISO/IEC/IEEE 42010:2011, which defines the architecture description framework: **viewpoints** define the concerns to be addressed; **views** realize those concerns for a specific system. In Jjodel, viewpoints can be exclusive (one active at a time, for concrete syntax) or overlay (layered, for validation and decoration). See [Viewpoints](../../user-guide/viewpoints) for the full explanation.

## Topological vs Layout-Sensitive Notation

Modeling notations fall into two categories based on how they treat spatial arrangement:

**Topological notations** care only about connections, not positions. Two class diagrams with the same classes and associations are semantically identical regardless of where the boxes are placed. Moving a class on the canvas changes nothing.

**Layout-sensitive notations** assign semantic meaning to spatial position. In a table, swapping two columns changes the meaning. In an indentation-based language, nesting depth determines scope. Here, layout is part of the semantics.

Most diagrammatic languages (UML class diagrams, ER diagrams, state machines) are topological. Jjodel supports both kinds through its three-submodel architecture: the data submodel captures abstract syntax, the node submodel captures layout, and the view submodel captures rendering. For topological notations, the node submodel is purely presentational. For layout-sensitive notations, the node submodel carries semantic weight.

See [JjOM Reference](../../reference/jjom) for details on the three submodels.

## DSL: Domain-Specific Language

A DSL is a formal, machine-processable interface to domain knowledge. Unlike general-purpose languages, a DSL restricts its vocabulary and rules to a specific domain, which makes it more expressive within that domain and less error-prone.

In Jjodel, building a metamodel is building the abstract syntax of a DSL. Adding viewpoints with templates and styles completes it with concrete syntax. Adding validation overlays enforces domain constraints. The result is a fully functional DSL that runs in the browser without installation.

## Primitive Data Types

Jjodel supports the following primitive data types for metaclass attributes, aligned with the Ecore type system:

| Type | Description | Example |
|------|-------------|---------|
| EString | Text value | `"Hello"` |
| EInt | 32-bit integer | `42` |
| ELong | 64-bit integer | `9999999999` |
| EFloat | 32-bit floating point | `3.14` |
| EDouble | 64-bit floating point | `3.14159265` |
| EBoolean | True or false | `true` |
| EChar | Single character | `'A'` |
| EByte | 8-bit integer | `127` |
| EShort | 16-bit integer | `32000` |
| EDate | Date value | `2026-04-13` |
