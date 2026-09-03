---
title: View Designer
description: Author how instances render, as a node, as a row or as a form, from the properties panel of a view.
sidebar:
  order: 5
  badge:
    text: "3.0"
    variant: note
  label: View Designer
---

The View Designer is the properties panel of a view when the view is authored declaratively. Instead of writing a JSX template and an SCSS block, you describe the view as a structured record: which metaclasses it applies to, which shape draws the node, how the header and the attribute compartment are laid out, which widgets the form uses. Jjodel renders the description with its own interpreter, and every field of the panel is a field of that record.

Available since Jjodel 3.0 (September 2026 update).

This page covers the panel and the rendering model behind it. For what a viewpoint is and how views compose, see [Viewpoints](../viewpoints/). Views written as JSX templates keep working; the declarative path is the recommended one for new views.

<!-- TODO: screenshot — properties rail with the View Designer tabs on a vertex view (new UI) -->

## Enabling the designer on a view

Select a view in the viewpoint. If the view still uses a template, the panel shows an **IR authoring** section: choose the **Kind** of the view and click **Enable IR authoring**. The rendering of the instances the view matches switches to the interpreter right away.

Three kinds exist:

- **Vertex (node)**: a shape on the canvas, with a header and an attribute compartment.
- **Row (inline)**: how a value renders inside the compartment of another node, or as a standalone node when the value is an object of its own.
- **Edge (line)**: a reference or an object drawn as a connection.

The tabs of the panel depend on the kind. A vertex view has **Applies to**, **Structure**, **Symbol** and **Form**; an edge view has **Applies to**, **Structure**, **Appearance** and **Text**; a row view has **Applies to** and **Text**. **Source**, the raw record, appears in Advanced mode only.

## Three levels of style

A node's appearance is decided at three levels, and each level has its own home in the panel.

**Symbol** is the shape: rectangle, stadium, diamond, ellipse and the other presets of the catalogue, with fill, border, padding, marker and sizing. Each of these can be fixed or conditional on the instance. The Symbol tab is where this lives.

**Structure** is what depends on the shape: where the name goes, whether the type shows, whether there is an accent bar and where, whether the compartment renders inline, in a popover, or not at all. The Structure tab is where this lives.

**Row views** are how single values render: an enumeration literal, a reference, a colour, a number with a unit. They are a library shared by nodes, the [Data Manager](../data-manager/) table and forms, so a value looks the same wherever it appears.

The levels cascade. A style field can be set on the metaclass, overridden by the viewpoint, and overridden again on a single instance. When a field shows an inherited value, the panel says where it comes from.

## The Structure tab

The Structure tab of a vertex view has three groups above the field compartments.

**Name** sets the **Position** of the instance name (in a header band, centered, below the shape, or outside it) and how the **Type** shows next to it: inline, as a chip, as a badge, or hidden. The instance name is underlined, as in UML object diagrams; the type is secondary.

**Accent** sets the **Placement** of the categorical accent (none, a bar on top, a bar on the left, or a ring on round shapes) and its **Color**. The colour is inherited from the metaclass unless you override it here.

**Compartment** sets the **Mode** (inline, popover, or none), the number of **Columns**, what happens to **Empty slots** (a dash, a collapsed footer that counts them, or hidden), and whether a reference to another node on the canvas carries an **Edge marker**.

Only the options the current symbol supports are offered. A stadium has no flat top edge, so it does not offer a header band; a diamond has no room for rows, so its compartment defaults to none. When an option is missing the panel says why, under the field and in a summary line at the bottom of the tab. If you change the symbol and a saved value is no longer valid, the node renders with the fallback but your value stays in the record.

Below the groups, **Field compartments** decide how the attribute rows are grouped and ordered. Compartments order and title the rows; they never hide a feature. Rows that no compartment claims render in a final group.

## The Form tab

The same view can render as a form: in the **Form** tab of the properties rail when an instance is selected, and inside the Data Manager. The Form tab of the View Designer configures that rendering.

**Theme** chooses one of four presets: **Plain**, **Card**, **Compact**, **Inspector**. Leave it empty to use the host's default. **Labels** go **Above** the field or to its **Left**; the left placement suits the compact theme.

In Advanced mode two tables appear, one row per feature of the metaclass named in **Applies to**.

- **Widgets** overrides the widget of a feature. The select offers only the widgets compatible with the feature's type, and the default entry names the widget the metamodel derives. When the metamodel declares a renderer for the feature and the view overrides it, the row says so and offers **Reset**.
- **Features** decides how a reference or a containment renders: **Inline** (the target's form embedded in this one), **List** (a list of targets), or **Hidden**. Inline is not available on multi-valued features. Hidden removes the feature from the form in both Basic and Advanced.

The **Basic** column marks the features that show in Basic mode. Unless you declare them, Basic is derived from multiplicity: required features show, the rest wait for Advanced.

Rows are grouped in the order the form will render them, using the same field compartments as the node. **Edit compartments** jumps to the Structure tab.

## Row views

Every value in a compartment, a table cell or a form is drawn by one of these renderers:

| Renderer | When | How it looks |
|---|---|---|
| Swatch | a colour value | a small rounded square, then the value |
| Chip | an enumeration literal | a slate chip |
| Reference pill | a reference to another instance | a cyan pill with a link icon; an arrow when the target is on the canvas |
| Boolean | `EBoolean` | a filled dot for true, a hollow one for false, then the word |
| Number with unit | a numeric value with a declared unit | the value, then the unit in monospace |
| Date | a date | absolute date in monospace, then the relative age |
| Truncated text | a string wider than the cell | one line with an ellipsis; the full value in the tooltip |
| Progress | a number with declared minimum and maximum | a short track with the value after it |
| Code | text the metamodel marks as code | monospace on a light background |
| Dash | an empty slot | a dash; the row stays |

Collections show the first four values and a `+k` chip; click it to expand. The count in the row label always shows the true total. A reference whose target was deleted shows a red icon and the last known name struck through.

An instance whose metaclass is a singleton and that has no valued slot renders as a pill instead of a rectangle: `Color::Red`, where `Color` is the first abstract direct superclass and `Red` the instance. A singleton with values keeps the rectangle and gets a cardinality badge.

### How a renderer is chosen

The renderer of a value is decided by a ladder of four rules, in order:

1. A declaration in the metamodel: a `jjodel/renderer` annotation, or a `Color` type.
2. The value itself: a string that parses as a colour, a number, a date.
3. An enumeration whose literals are all colour names.
4. The attribute name, as a tie-break only.

You can see the ladder at work. Hold Alt and click a row of a node, or use the sliders icon that appears when you hover it: the **Value-renderer detection** inspector opens and shows what each rule found, which one won and why, and the rules it never reached. The footer shows the chosen renderer and lets you change it. A change from the inspector is written to the metamodel as an annotation, so the ladder stops running for that feature and every view sees the same choice.

When the view's Form tab overrides the widget of a feature, the inspector shows that override as rule 0, above the metamodel declaration, and the row's status chip reads `view` instead of `auto`.

Declarations live in metamodel annotations; see [Metamodel Annotations](../../reference/metamodel-annotations/) for the keys.

## Known limits

- Annotations written from the inspector are stored in the Jjodel project. An Ecore round trip (export, then import) does not preserve them yet.
- A feature literally named `op` is rejected by the view validator when it appears in the Widgets or Features tables.
