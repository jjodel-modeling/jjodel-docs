---
title: Metamodel Annotations
description: The jjodel/* annotation keys that a metamodel can carry to drive rendering and forms.
sidebar:
  badge:
    text: "3.0"
    variant: note
  order: 5
---

A metamodel element can carry annotations. Jjodel reads a small set of them, all in the `jjodel/` namespace, to decide how values render and how forms lay out. They live on the attribute (or reference) they describe, one key per annotation, as `source = "jjodel/<key>=<value>"`.

Available since Jjodel 3.0 (September 2026 update).

You rarely write them by hand. The renderer inspector on a node (Alt+click a row) writes `jjodel/renderer` for you when you change a renderer; the other keys are set the same way or from the metamodel editor. Because they are annotations, they are part of the metamodel: every view, every table and every form sees the same declaration.

## Keys

| Key | Applies to | Value | Effect |
|---|---|---|---|
| `jjodel/renderer` | attribute | `swatch`, `enumChip`, `refPill`, `boolean`, `numberUnit`, `date`, `truncatedText`, `progress`, `code` | Fixes the value renderer. Declared renderers win over every heuristic (rule 1 of the detection ladder). |
| `jjodel/unit` | numeric attribute | any short string, e.g. `px`, `ms`, `kg` | Shows the unit after the number. A unit is never inferred from the attribute name. |
| `jjodel/min` | numeric attribute | a number | Lower bound of the value. With `jjodel/max` it enables the progress renderer. |
| `jjodel/max` | numeric attribute | a number | Upper bound of the value. |
| `jjodel/multiline` | `EString` attribute | `true` | The attribute is long text: forms use a growing textarea that spans the full row. Decided at rule 2 of the ladder, so a declared renderer still wins. |

An unknown `jjodel/*` key is ignored. Annotations outside the namespace are left untouched.

## Precedence

For a given attribute the order is:

1. A widget override in the Form tab of the view (`FormSpec.widgets`), visible in the inspector as rule 0.
2. `jjodel/renderer`, or a `Color` type.
3. The value itself, and `jjodel/multiline`.
4. An enumeration whose literals are all colour names.
5. The attribute name, as a tie-break.

A view override is scoped to that view. An annotation is scoped to the metamodel.

## Limits

The annotations are stored in the Jjodel project. Exporting to Ecore and importing again does not preserve them yet; a metamodel that comes back from an `.ecore` round trip renders through the heuristic rules until the annotations are set again.
