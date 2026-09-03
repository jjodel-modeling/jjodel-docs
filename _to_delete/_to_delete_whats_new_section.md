## v3.0 Beta, September 2026 update

The beta moved on since July. The changes below are live at [beta.jjodel.io](https://beta.jjodel.io).

**Data Manager**

- A third way to work on a model, next to the canvas and the tree view: a table of instances per metaclass, with forms to create, edit and delete them, a containment outline, a one-hop neighborhood diagram on each row, and a delete preview that shows the cascade and the dangling references before anything is removed. See [Data Manager](../user-guide/data-manager/).
- Reachable from the model entry in the project sidebar and from the syntax picker in the toolbar (**Data manager**).

**View Designer**

- Views are now authored declaratively from the properties panel: **Applies to**, **Structure**, **Symbol**, **Form** tabs, plus **Source** in Advanced mode. The JSX template path stays available. See [View Designer](../user-guide/view-designer/).
- Instance nodes render with a header (underlined instance name, secondary type), a two-column attribute compartment, an optional accent bar, and a footer for empty slots. Structure options depend on the shape: what a symbol cannot host is not offered, and the panel says why.
- A library of value renderers shared by nodes, tables and forms: swatches, chips, reference pills, booleans, numbers with units, dates, progress, code. Collections show four values and a `+k` chip. Singletons without values render as a pill (`Color::Red`).
- A renderer inspector (Alt+click a row) shows the four detection rules, which one won and why, and lets you change the renderer; the change is written to the metamodel as an annotation.

**Forms**

- The same view renders as a form in the properties rail (**Form** tab on an instance) and in the Data Manager. Four themes (plain, card, compact, inspector), labels above or on the left, per-feature widget overrides, and inline, list or hidden treatment of references.
- Form layout comes from the metamodel: a twelve-column grid where each type has a width, with no per-field settings.

**Metamodel**

- Annotations in the `jjodel/` namespace drive rendering: `renderer`, `unit`, `min`, `max`, `multiline`. See [Metamodel Annotations](../reference/metamodel-annotations/).
- Names are unique among siblings in a model (two instances with the same container cannot share a name) and across a metamodel (case-sensitive, with a warning on near-duplicates; datatypes have their own namespace). Auto-generated names never shadow a name you typed.
- An `EInt` attribute marked as ID numbers new instances automatically.
- Ecore import from the UI.

**Saving**

- One **Save project** action shared by the toolbar, the Data Manager and Save & Exit. The autosave runs after fifteen seconds of inactivity, at most every two minutes, without notifications; the top bar shows the time of the last save.

**Known limits**

- `jjodel/*` annotations are not preserved by an Ecore export and re-import.
- An instance created from the Data Manager while the canvas of its model is closed appears on the diagram only once you open the canvas.
