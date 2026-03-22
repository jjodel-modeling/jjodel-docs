# What is Model-Driven Engineering?

Model-Driven Engineering (MDE) is a software development approach that places
**models** — rather than code — at the center of the development process.
Instead of writing programs directly, you describe your system at a higher level
of abstraction, and tools derive artifacts (code, documentation, tests) from
those descriptions.

## The core idea

In traditional software development, the gap between how we *think* about a
system and how we *implement* it is large. A requirements document describes
entities like "Customer", "Order", and "Product" — but the code that implements
them is spread across dozens of files, mixed with infrastructure concerns,
persistence logic, and error handling.

MDE narrows this gap. You model the domain explicitly, and the model *is* the
primary artifact — not an afterthought or documentation written after the fact.

## Models and metamodels

A **model** is a simplified representation of something — a system, a process,
a domain. A class diagram describing a library system (with classes `Book`,
`Author`, `Loan`) is a model.

A **metamodel** is a model of a model. It defines what concepts and
relationships are allowed in a given class of models. In the library example,
the metamodel says: "a model in this language can contain classes, attributes,
and references between classes."

This relationship — a model *conforms to* its metamodel — is the foundational
concept in MDE. Every model is valid only with respect to some metamodel.

```
Metamodel:  Class, Attribute, Reference   ← defines the language
Model:      Book, Author, Loan            ← instance of the language
```

## The four layers

MDE organizes modeling artifacts into four layers, often called M0 through M3:

| Layer | Name | Example |
|-------|------|---------|
| M3 | Meta-metamodel | MOF, Ecore — the language for defining metamodels |
| M2 | Metamodel | Your class diagram language, UML, Ecore model |
| M1 | Model | A specific class diagram of a library system |
| M0 | Runtime | The actual objects in a running system |

Each layer *conforms to* the layer above it. Your metamodel conforms to MOF.
Your model conforms to your metamodel. The running system conforms to your model.

## Why it matters

MDE is particularly valuable when:

- **The domain is complex** and needs to be understood independently of any
  implementation technology
- **Multiple artifacts must stay consistent** — documentation, code, tests,
  configuration — and regenerating them from a single source of truth is safer
  than maintaining them separately
- **The domain evolves** — a change to the metamodel can propagate
  systematically to all models that conform to it
- **Abstraction is key** — different stakeholders (domain experts, developers,
  testers) can work at different levels without stepping on each other

## MDE and Jjodel

Jjodel is a web-based platform for practicing MDE directly in the browser —
no installation, no Eclipse, no configuration. You define metamodels, create
models that conform to them, specify how they should be visualized (viewpoints),
and write transformations that map one model to another.

The goal is to make MDE accessible: to students encountering it for the first
time, to researchers experimenting with new language designs, and to educators
building course material around concrete, runnable examples.

## Further reading

- [Metamodel vs Model](./metamodel-vs-model.md) — the distinction in depth
- [The modeling layers](./modeling-layers.md) — M0 through M3 explained
- [Model transformations](./transformations-theory.md) — how models become other models
