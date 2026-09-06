---
title: Tutorials
description: "A guided path through Jjodel: one Entity-Relationship language that grows from a metamodel to concrete syntax, data entry, AI assistance, and model transformation."
sidebar:
  order: 0
---

The tutorials build one language, step by step. You start with a metamodel for Entity-Relationship diagrams, give it a graphical notation, populate a model from a table, let Jjodie generate and explain parts of the project, and finally transform the ER model into a relational schema. Each tutorial opens the project where the previous one left it, and states in its prerequisites what you need if you skip ahead.

The domain is deliberately familiar. ER diagrams are a notation you already know, so your attention goes to the metamodeling mechanics rather than to domain analysis. See [Domain Analysis](../concepts/domain-analysis) for the process you would follow with an unfamiliar domain.

Before you start, complete [Your First Project](../getting-started/first-project) and read [Basic Notions](../concepts/basic-notions). Each tutorial takes between 30 and 60 minutes.

## The path

| # | Tutorial | What you learn | Time |
|---|---|---|---|
| 1 | [Your First Language: An ER Metamodel](./01-er-metamodel) | Classes, inheritance, containment, enumerations, a first model, live co-evolution | 30 min |
| 2 | [Concrete Syntax: Chen Diagrams](./02-chen-notation) | A syntax viewpoint and its views, the symbol catalogue, labels, conditional fill for keys | 40 min |
| 3 | [Populating a Model with the Data Manager](./03-data-manager) | Transactional creation from forms, reference pickers, the neighborhood diagram, multi-edit, delete with a preview | 30 min |
| 4 | [Working with Jjodie](./04-jjodie) | A provider and its key, a metamodel from a sentence and its JjScript, a failing script and how to recover, Explain this on the Chen diagram, documentation with protected paragraphs, meta-commands | 30 min |
| 5 | Model Transformation: From ER to a Relational Schema (planned) | A second metamodel, JjTL mappings and guards, cross-type resolution, trace view, SQL generation | 60 min |
| 6 | [State Machine Simulation](./tutorial-04-simulation) | A separate, advanced example: operational semantics, panels and controls, visual feedback | 60 min |

Tutorial 6 uses a different domain and stands on its own. It assumes tutorials 1 and 2.

## Text and video

Each tutorial is complete on its own as text and screenshots. Where a short video (under three minutes) is available, it sits at the top of the page and shows the same steps at speed; use it as a preview, then follow the text.
