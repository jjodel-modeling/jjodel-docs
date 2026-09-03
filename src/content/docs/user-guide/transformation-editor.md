---
title: Transformation Editor
description: How to use the JjTL Transformation Editor in Jjodel.
sidebar:
  badge:
    text: "3.0"
    variant: note
  order: 9
---

The Transformation Editor is a dedicated environment for writing and executing JjTL model-to-model transformations.

Available since Jjodel 3.0.

<!-- TODO: screenshot - Transformation Editor overview (new UI) -->

## Opening the editor

Open the Transformation Editor from the project sidebar under **Behaviour > Transforms**. Click an existing transformation to edit it, or create a new one.

## Editor layout

The editor has four areas:

- **Source/Target selectors** (top bar): choose the source and target metamodels
- **Code editor** (center): write JjTL transformation rules with syntax highlighting
- **Metamodel browser** (left): browse source and target metamodel structures side by side
- **Suggested Mappings** (right): AI-assisted mapping suggestions and grammar reference

## Writing a transformation

A transformation starts with a header declaring its name and the source/target metamodels:

```jjtl
transformation MyTransformation

from SourceMetamodel
to   TargetMetamodel
```

Then add class mappings and attribute bindings. See the [JjTL Reference](../../languages/jjtl) for the full syntax.

Transformation names use letters, digits, and underscores (`Class2Table`, `uml_to_rdbms`). Hyphens are not valid in transformation names.

## Mapping view

The editor draws the correspondences declared in your rules as arrows between the source and target metamodel structures. Arrows use Manhattan routing: nearly horizontal connections render as straight lines, the others bend at right angles. This keeps dense mappings readable when several rules target the same class.

The mapping view updates as you type: adding a class mapping or an attribute binding adds the corresponding arrow.

<!-- TODO: screenshot — mapping arrows between source and target metamodels (new UI) -->

## Validation and execution

Click **Validate** to check the transformation for syntax errors. The Problems panel at the bottom shows errors and warnings.

Click **Execute** to run the transformation. Jjodel creates a new target model containing the transformation result. The Output panel shows execution details, timing, and any warnings.

### Interactive execution

If the transformation uses `prompt` or `confirm` (see [Interactive features](../../languages/jjtl#interactive-features)), execution pauses at each call and opens a dialog. The value you enter flows into the binding being evaluated; canceling a prompt yields `null`. Combined with `let`, one answer can drive several bindings without repeated dialogs.

## Trace view

After execution, the **Trace** tab shows every mapping that was applied: which source elements produced which target elements, and whether each attribute mapping is invertible.

<!-- TODO: screenshot - Trace view with mappings (new UI) -->

Use the search box to filter trace entries by class name or mapping rule.
