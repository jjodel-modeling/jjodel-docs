---
title: Textual Notation
description: Where the textual languages of Jjodel are documented and what each one is for.
sidebar:
  order: 4
  label: Textual Notation
---

Most work in Jjodel happens in the editors: you drop classifiers on a canvas, draw references between them, and describe views by filling a form. Three textual languages sit beside those editors, for the tasks a form cannot express and for the ones you want under version control.

| Language | What it does | Where you write it |
|----------|--------------|--------------------|
| [JjEL](../../languages/jjel) | Evaluates expressions over a model without changing it | View predicates, validation conditions, the Console |
| [JjTL](../../languages/jjtl) | Maps a model conforming to one metamodel onto another | The Transformation Editor |
| [JjScript](../../languages/jjscript) | Creates, renames, moves, and deletes metamodel elements | The Console, and the blocks Jjodie generates |

The three share one expression syntax: JjEL is the sub-language JjTL and JjScript evaluate their expressions with, so a navigation you learn in one works in the others.

The [Languages](../../languages/overview) chapter documents the syntax of each. This page exists to say which one you need.

## What is not a textual language

View templates are not part of these three. A view is a declarative record edited in the [View Designer](../../user-guide/view-designer): you describe it, you do not program it. The JSX templates of 1.5 are no longer interpreted. What the expressions of these languages navigate is the [JjOM API](../jjom-api).
