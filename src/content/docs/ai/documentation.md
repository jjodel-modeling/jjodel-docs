---
title: Documentation Generation
description: Generate a Markdown description of a whole project, review it, protect the parts you wrote, and regenerate when the metamodels change.
sidebar:
  order: 4
  badge:
    text: "3.0"
    variant: default
    class: version-3-0
  label: Documentation
---

A metamodel says what a language can express; it does not say why. Documentation generation reads every metamodel in a project, asks a language model to describe the domain, each class, and each feature, and writes the result as Markdown you can edit, protect, export, and regenerate.

<!-- TODO: screenshot — Documentation tab with the generated document in Formatted view (new UI) -->

## Generating

The **Documentation** card on the project page shows the current document, or a **Generate** button when there is none. Generation needs at least one class in the project. The document opens in its own **Documentation** tab, next to the metamodel and model tabs.

The tab's toolbar carries the provider picker for this feature, **Edit**, **Regenerate**, the **Markdown** / **Formatted** toggle, **Copy**, and **Export** (Markdown file or PDF). When a provider is configured, **Regenerate** sends the project to it; when none is, or when the call fails, Jjodel falls back to a local generator that produces the same structure from names and types alone: the domain is inferred from the class names and the descriptions come from templates. The status line says which one produced the current document, and when.

## What the Model Receives and Returns

The model receives the whole project: all metamodels, with their packages, classes, attributes, references, and enumerations. Before the call, Jjodel looks up the project name, the metamodel names, and the class names on Wikidata, so that a class named `Ledger` or `Synapse` reaches the model with a definition attached. The answer is a structured description: the domain the project belongs to, with a confidence score, a project summary, and a description for every class, attribute, and reference.

Jjodel turns it into Markdown: an overview with the domain and a statistics table, one section per metamodel, one subsection per class with its description and its attribute and reference tables, the enumerations, and a closing **Notes** section that is already protected (see below) so you have a place to write from the start.

The confidence score is shown on the card. It is the model's own estimate of how well it recognized the domain, not a measure of the accuracy of the descriptions.

## Editing and Protecting

**Edit** opens the Markdown for changes; **Save** keeps them. A regeneration would overwrite them, so wrap the paragraphs you want to keep between `@protected` and `@end`:

```markdown title="Documentation (Markdown view)"
@protected
The State class is the unit of behavior. Only one state is active at a time.
@end
```

Protected blocks survive **Regenerate**; everything else is replaced. In the formatted view the markers appear as lock icons. The regenerate dialog reminds you of this before proceeding.

## Keeping It Current

Jjodel hashes the project at generation time. When the metamodels change afterwards, the tab shows an **Outdated** badge, and **Regenerate** brings the document back in line, protected blocks included.

## Limits

- The document is stored in your browser, with the project id as key. It is not part of the `.jjodel` file: export it with **Export** if it must travel with the project or survive a change of browser.
- The whole project goes to the provider in one request. A very large project can exceed what the model accepts; the generator reports a parsing error in that case, and the local generator remains available.
- The **Documentation Generation** prompt in Settings is not used yet by this feature, which has its own fixed instruction. Editing that prompt has no effect for now.
