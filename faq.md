---
title: FAQ
description: Frequently asked questions about Jjodel.
sidebar:
  order: 10
---

# Frequently Asked Questions

## General

### What is Jjodel?

Jjodel is a cloud-native, reflective modeling platform for defining, visualizing, and evolving Domain-Specific Modeling Languages (DSLs) directly in the browser. It provides an integrated environment where metamodels, models, and viewpoints coexist and co-evolve in real time, without code generation or tool recompilation.

### Who develops Jjodel?

Jjodel is developed and maintained by the **Software Engineering (SWEN) Research Group** at the University of L'Aquila (Italy), with collaborations across Europe. It is part of the AIM-PRO European research project.

### Is Jjodel open source?

Yes. Jjodel is released under the **MIT License**, which allows free use, modification, and redistribution. The source code, documentation, and examples are available on [GitHub](https://github.com/jjodel-modeling/).

### What makes Jjodel different from other modeling tools?

Three key differentiators set Jjodel apart:

1. **Live co-evolution** — metamodel changes propagate instantly to models, editors, and viewpoints without regeneration or redeployment
2. **Cloud-native** — no installation required, real-time collaboration built in
3. **Reactive and reflective architecture** — the tool observes its own structure and synchronizes all components automatically

## Access and Setup

### How do I access Jjodel?

Visit [app.jjodel.io](https://app.jjodel.io) in your browser. Registration is free.

### Do I need to install anything?

No. Jjodel runs entirely in the browser. For local development or offline use, you can optionally install Jjodel via Docker or build from source — see [Installation](./installation/install-jjodel).

### Can I use Jjodel offline?

The cloud version requires an internet connection. For offline use, you can run Jjodel locally using Docker, though this setup does not include shared storage or real-time synchronization.

### Which browsers are supported?

Google Chrome and Microsoft Edge (latest versions) are recommended. Other Chromium-based browsers are generally supported.

## Modeling

### What kinds of models can I create?

Jjodel supports any domain-specific or general-purpose modeling language. You define the metamodel (abstract syntax), and Jjodel lets you create models conforming to it. Common examples include UML class diagrams, entity-relationship diagrams, state machines, process models, and custom DSLs.

### How does live co-evolution work?

Every change to a metamodel is immediately reflected across all related models, viewpoints, and editors. This is possible because Jjodel interprets metamodels at runtime (rather than generating code from them) and uses a reactive architecture that propagates changes automatically.

### Can I import or export models?

Ecore and XMI import/export is planned for a future release. The team is also exploring participation in the [LionWeb](https://github.com/lionWeb-io) initiative for cross-tool interoperability.

## Collaboration

### Does Jjodel support collaborative editing?

Yes. Multiple users can work simultaneously on the same models or metamodels. All actions are propagated in real time through a cloud-based publish-subscribe infrastructure.

### Can Jjodel be integrated with other tools?

Jjodel can interoperate with external tools through REST APIs. Its React-based editors can also be embedded in other web applications.

## Technical

### Does Jjodel support version control?

Jjodel includes an operation recorder but does not currently provide built-in version control. Projects are stored in the cloud with operational history.

### Does Jjodel support metamodel evolution?

Yes — this is one of Jjodel's core strengths. Metamodel changes are propagated instantly, with no recompilation needed.

## Learning and Support

### Where can I find tutorials?

See the [Tutorials](./tutorials/tutorial-01-basic) section for step-by-step guides, and the [Video Pills](./video-pills) page for recorded introductions and demonstrations.

### Is Jjodel used in teaching or research?

Yes. Jjodel is used in MDE courses, software modeling laboratories, and European research projects (AIM-PRO). It serves as an open, reflective environment for experimentation, prototyping, and education.

### How can I contribute?

Visit the [GitHub repository](https://github.com/jjodel-modeling/) to report issues, propose features, or contribute code. Look for issues labeled `good first issue` to get started.
