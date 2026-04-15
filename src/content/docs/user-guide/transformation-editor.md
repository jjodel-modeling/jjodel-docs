---
title: Transformation Editor
description: How to use the JjTL Transformation Editor in Jjodel.
sidebar:
  order: 7
---

The Transformation Editor is a dedicated environment for writing and executing JjTL model-to-model transformations.

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

Then add class mappings and attribute bindings. See the [JjTL Reference](../languages/jjtl) for the full syntax.

## Validation and execution

Click **Validate** to check the transformation for syntax errors. The Problems panel at the bottom shows errors and warnings.

Click **Execute** to run the transformation. Jjodel creates a new target model containing the transformation result. The Output panel shows execution details, timing, and any warnings.

## Trace view

After execution, the **Trace** tab shows every mapping that was applied: which source elements produced which target elements, and whether each attribute mapping is invertible.

<!-- TODO: screenshot - Trace view with mappings (new UI) -->

Use the search box to filter trace entries by class name or mapping rule.
