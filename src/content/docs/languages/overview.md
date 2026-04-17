---
title: Jjodel Language Family
description: Overview of JjEL, JjTL, and JjScript and how they compose.
sidebar:
  order: 1
---

Jjodel provides three complementary languages for working with models and metamodels. Each serves a distinct purpose along the purity-effect spectrum:

| Language | Paradigm | Side effects | Primary use |
|----------|----------|-------------|-------------|
| **JjEL** | Functional | None | Querying, computing values |
| **JjTL** | Declarative | None (creates a new model) | Model-to-Model transformation |
| **JjScript** | Imperative | Yes (in-place mutation) | Metamodel editing |

## How they compose

JjEL is the foundation. Both JjTL and JjScript delegate all expression evaluation to JjEL. You write JjEL expressions inside JjTL transformation rules and inside JjScript commands.

JjTL and JjScript are independent of each other. JjTL transforms models declaratively (source model in, target model out). JjScript modifies the metamodel imperatively (create, rename, delete elements in place).

Both JjTL and JjScript support JjModal commands (`prompt`, `confirm`) for interactive, human-in-the-loop scenarios, and JjLet bindings (`let $x = expr in body`) for reusing computed values.

## Design principles

All three languages follow the same design criteria, in priority order:

1. **Maximum declarativity.** Describe *what* you want, not *how* to compute it.
2. **Minimum cognitive load.** Few rules, minimal syntax, no boilerplate.
3. **Maximum intuitiveness.** Constructs read like natural language. Textual operators (`and`, `or`, `not`, `implies`), first-order-logic quantifiers (`forall`, `exists`), null-safe navigation (`?.`, `??`).

## Where to use each language

Use **JjEL** in the Console to query models, in viewpoint templates to compute display values, and in validation constraints.

Use **JjTL** in the Transformation Editor to define model-to-model transformations with automatic traceability.

Use **JjScript** in the Console to create and modify metamodel elements, either manually or through the Jjodie AI assistant.

## Next steps

- [JjEL Reference](../jjel) for expression syntax and built-in methods
- [JjTL Reference](../jjtl) for transformation rules
- [JjScript Reference](../jjscript) for scripting commands
