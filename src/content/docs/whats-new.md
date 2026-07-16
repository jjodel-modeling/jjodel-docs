---
title: What's New
description: Recent changes and updates to Jjodel.
sidebar:
  order: 2
---

:::caution[Beta]
Jjodel 3.0 is available as a public beta at [beta.jjodel.io](https://beta.jjodel.io). It is in active development: features listed below may still change before the final release.
:::

## v3.0 Beta

**Languages**

- JjTL (Jjodel Transformation Language): declarative model-to-model transformations with two-pass execution, automatic trace model, cross-type resolution, interactive `prompt`/`confirm` commands, and a hardened write-back pipeline (inherited attributes, reference-only transformations, arrays, enumeration literals).
- JjEL (Jjodel Expression Language) completed: `forall`/`exists` with set-theoretic semantics, `with...do` context binding, `implies`, null-safe navigation (`?.`, `??`), type checks with `is`, and a built-in library of more than one hundred methods for strings, numbers, collections, and dates.
- JjScript: imperative metamodel editing with structural commands, `validate`, `undo`/`redo`, `forall` bulk edits, and interactive `let` bindings.

**Console**

- Multi-language Console: a single input with three modes (Jjodie assistant, JjScript, JjEL), a mode chip with picker, keyboard cycling, and `/jjel`, `/js`, `/ask`, `/help` meta-commands.

**Modeling environment**

- Complete UI redesign with progressive disclosure (Basic and Advanced modes) and redesigned side panels to reduce cognitive load.
- Megamodel view: a project-level overview of metamodels, models, viewpoints, and transformations with their relations.
- Edge rendering: Manhattan routing, per-edge labels with overlap avoidance, segment dragging, and edge markers.
- Improved tree views and Ecore/XMI round-trip (including EDataType export).

**AI assistance**

- Jjodie assistant integrated in the Console: natural-language requests are translated to JjScript and executed. Configurable providers: OpenAI, Anthropic, DeepSeek, Mistral, Gemini, Groq, Kimi, Ollama, or local.

**In progress**

- Conformance validation feedback in the editor (per-model indicator, per-node badges) and user-defined invariants in JjEL.

## v2.0

**New**
- Property dialog on the model editor supporting default and custom syntax.
- Cross-metamodel references and class extensions displayed directly on classes.
- Background grid with snap-to-grid alignment.
- Zoom in/out controls.

**Improved**
- Palette redesigned with new icons. Icons added to editor tabs.
- Refined default abstract syntax.
- Multiplicity labels visible on edges.
- Console results, state visualization, and node attribute display improved.
- Contextual menu and user profile management refined.

**Fixed**
- General bug fixes and performance improvements.

## v1.50

**Fixed**
- Session management: reloading the page no longer forces re-login.

## v1.41

**New**
- Console Tips: tooltips on console outputs with suggested keys.
- Model dependencies: models can depend on other models (extend-like), supporting chains (A to B to C) and loops.
- Cross-Reference Activation for classes (inheritance) and features (type).
- Context-menu containment expanded.

**Improved**
- Edge behavior updated. Note: older saves may show side effects.

**Fixed**
- Models can now be deleted from the project structure.
- Viewpoints can now be deleted (except the active one).
- Containment references correctly update `.parent` properties.

## v1.4

Redesigned user interface with a cleaner layout, simplified navigation, and modern aesthetic.

- Left-hand menu consolidating all major actions.
- Refined layouts for diagrammatic modeling.
- Improved tree views, property editors, and viewpoint panels.

## v1.3

Viewpoints and views can now be deleted.

## v1.2

Extension mechanism in the metamodel editor.

## v1.1

Bug fixes.

## v0.x

Pre-release for internal use only.
