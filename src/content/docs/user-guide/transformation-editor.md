---
title: Transformation Editor
description: How to use the JjTL Transformation Editor in Jjodel.
sidebar:
  badge:
    text: "3.0"
    variant: default
    class: version-3-0
  order: 9
---

The Transformation Editor is a dedicated environment for writing and executing JjTL model-to-model transformations.

Available since Jjodel 3.0.

![The Transformation Editor on a Family to Person transformation](./images/transformation-editor-overview.png)

## Opening the editor

Transformations live under **Transforms** in the project rail and in the **Transformations** section of the project page. Click one to open its editor, or use **New transform** to start one.

## Editor layout

The editor has four areas:

- **Top bar**: the **Source** and **Target** metamodel selectors, then **Validate Transformation**, **Format Code** (`⌘+Shift+F`), **Execute Transformation** (`⌘+Enter`), and **Settings**
- **Metamodels** (left): the source and target structures side by side, each tagged **SRC** and **TGT** and each with its own search box
- **Code editor** (center): the JjTL rules, with syntax highlighting and its own copy, fullscreen, validate, and execute buttons
- **Suggested Mappings** (right): AI-assisted mapping suggestions, which need an AI provider configured in Settings (see [Mapping Suggestions](../../ai/mappings)), and a **Grammar** reference

A panel across the bottom carries three tabs, **Problems**, **Trace**, and **Output**, and the status bar below it reports whether the transformation is valid along with the cursor position and the language.

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

![Arrows connecting the classes and features of the source metamodel to those of the target metamodel](./images/transformation-mapping-arrows.png)

## Validation and execution

Click **Validate** to check the transformation for syntax errors. The Problems panel at the bottom shows errors and warnings. A class creation written directly in a rule body, with no enclosing feature (`-> Column { ... }` instead of `-> columns { -> Column { ... } }`), is reported here as a validation error.

Click **Execute** to run the transformation. Jjodel creates a new target model containing the transformation result: one instance per matched source instance for each rule, plus the objects created inside features, which appear in the tree view under the instance that contains them. The Output panel shows execution details and timing, and lists the warnings of the run. The executor does not stop on a warning, so read this panel when the target model is not what you expected. The warnings you will meet most often:

- a feature named in `-> feature { ... }` that does not exist on the target class: nothing is created for it
- a `forall` written in a rule body with no feature around it: the executor names the feature it chose, and asks you to write it explicitly
- a value that reaches no attribute, reference or feature of the target class: the instance, the key and the reason are named
- an enumeration value whose name matches no literal of the target enumeration: it is written as a string

### Interactive execution

If the transformation uses `prompt` or `confirm` (see [Interactive features](../../languages/jjtl#interactive-features)), execution pauses at each call and opens a dialog. The value you enter flows into the binding being evaluated; canceling a prompt yields `null`. Combined with `let`, one answer can drive several bindings without repeated dialogs.

## Trace view

After execution, the **Trace** tab shows every class mapping that was applied: which source element produced which target element, and, for each attribute binding, the source value, the target value and whether the binding is invertible. The entries are the rule-level instances; objects created inside a feature with `->` or `forall` belong to the entry of the rule that created them and are not listed as separate trace links.

The trace is what cross-type resolution reads during execution (see [Cross-type resolution](../../languages/jjtl#cross-type-resolution)). It is built anew at every run and is not saved with the project.

![The Trace tab after running StateMachine_to_PetriNet, with the State to Place entry expanded to show its attribute bindings](./images/transformation-trace-view.png)

Use the search box to filter trace entries by class name or mapping rule.
