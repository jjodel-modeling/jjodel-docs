---
title: What's New
description: Recent changes and updates to Jjodel.
sidebar:
  order: 2
---

## v3.0, September 2026

Jjodel 3.0 was released on 15 September 2026 and is live at [app.jjodel.io](https://app.jjodel.io). It replaces the public beta that ran from July to September.

**Languages**

- JjTL (Jjodel Transformation Language): declarative model-to-model transformations with two-pass execution, automatic trace model, cross-type resolution, interactive `prompt`/`confirm` commands, and a hardened write-back pipeline (inherited attributes, reference-only transformations, arrays, enumeration literals). A rule can create nested objects inside a target feature, reference collections are dereferenced in `forall`, and contained source instances take part in the execution. See the [ER to Relational tutorial](../tutorials/05-er-to-relational/).
- JjEL (Jjodel Expression Language): `forall`/`exists` with set-theoretic semantics, `with...do` context binding, `implies`, null-safe navigation (`?.`, `??`), type checks with `is`, and a built-in library of more than one hundred methods for strings, numbers, collections, and dates.
- JjScript: imperative metamodel editing with structural commands, `validate`, `undo`/`redo`, `forall` bulk edits, and interactive `let` bindings. Name resolution only considers the element kinds a command accepts, prefers an exact-case match, and reports an ambiguous name instead of picking one.

**Modeling environment**

- Complete UI redesign with progressive disclosure (Basic and Advanced modes) and redesigned side panels.
- Megamodel view: a project-level overview of metamodels, models, viewpoints, and transformations with their relations.
- Edge rendering: Manhattan routing, per-edge labels with overlap avoidance, segment dragging, and edge markers.
- Improved tree views and Ecore/XMI round-trip (including EDataType export), and Ecore import from the UI.
- Multi-language Console: a single input with three modes (Jjodie assistant, JjScript, JjEL), a mode chip with picker, keyboard cycling, and `/jjel`, `/js`, `/ask`, `/help` meta-commands.

**Data Manager**

- A third way to work on a model, next to the canvas and the tree view: a table of instances per metaclass, with forms to create, edit and delete them, a containment outline, a one-hop neighborhood diagram on each row, and a delete preview that shows the cascade and the dangling references before anything is removed. See [Data Manager](../user-guide/data-manager/).
- Reachable from the model entry in the project sidebar and from the syntax picker in the toolbar (**Data manager**).
- The Data Manager is the only place where an instance renders as a form. Its configuration is one per project and does not depend on the active viewpoint: select **Data Manager** in the project sidebar and the properties rail offers **Form theme** (Comfortable, Compact, Sectioned, Dense), **Palette** (Slate, Paper, Ink, Mist) and a per-metaclass table of widget overrides.
- Form layout comes from the metamodel: a twelve-column grid where each type has a width, with no per-field settings. See [Configuring the Data Manager](../user-guide/data-manager/#configuring-the-data-manager).

**View Designer**

- Views are authored declaratively from the properties panel: **Applies to**, **Structure**, **Symbol**, **Form** tabs, plus **Source** in Advanced mode. The JSX template path of 1.5 is no longer interpreted. See [View Designer](../user-guide/view-designer/).
- Instance nodes render with a header (underlined instance name, secondary type), a two-column attribute compartment, an optional accent bar, and a footer for empty slots. Structure options depend on the shape: what a symbol cannot host is not offered, and the panel says why.
- A library of value renderers shared by nodes, tables and forms: swatches, chips, reference pills, booleans, numbers with units, dates, progress, code. Collections show four values and a `+k` chip. Singletons without values render as a pill (`Color::Red`).
- A renderer inspector (Alt+click a row) shows the four detection rules, which one won and why, and lets you change the renderer; the change is written to the metamodel as an annotation.
- The **Form** tab of a vertex view overrides the widget of each feature, and the override also decides how the row renders in the node.

**Metamodel**

- Annotations in the `jjodel/` namespace drive rendering: `renderer`, `unit`, `min`, `max`, `multiline`. See [Metamodel Annotations](../reference/metamodel-annotations/).
- Names are unique among siblings in a model (two instances with the same container cannot share a name) and across a metamodel (case-sensitive, with a warning on near-duplicates; datatypes have their own namespace). Auto-generated names never shadow a name you typed, and a duplicate metamodel or model name gets a numeric suffix.
- An `EInt` attribute marked as ID numbers new instances automatically.

**Saving**

- One **Save project** action shared by the toolbar, the Data Manager and Save & Exit. The autosave runs after fifteen seconds of inactivity, at most every two minutes, without notifications; the top bar shows the time of the last save.

**AI assistance**

- Jjodie assistant integrated in the Console: natural-language requests are translated to JjScript and executed, in the scope shown to the model. Configurable providers: OpenAI, Anthropic, DeepSeek, Mistral, Gemini, Groq, Kimi, Ollama, or local.
- The [AI in Jjodel](../ai/overview/) chapter documents Jjodie, mapping suggestions, documentation generation, and provider configuration in one place.

**Known limits**

- User-defined validation is not part of 3.0. What 3.0 checks is conformance to the metamodel: the JjScript `validate` command, the problem marker in the tree view, and the status line of a form in the Data Manager.
- `jjodel/*` annotations are not preserved by an Ecore export and re-import.
- An instance created from the Data Manager while the canvas of its model is closed appears on the diagram only once you open the canvas.

**Planned**

- Validation, in 3.5. It is fully implemented and integrated in the workbench, and it is a complete redesign: invariants and constraints are written declaratively on metamodel classes, with the full expressiveness of JjEL, each rule carries its own message, and a model is checked on demand with its violations marked on the canvas. The ECA-based validation of 1.5 has been removed. See [Validation](../user-guide/validation/).

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
