---
title: "Tutorial 5: Concrete Syntax for ER Diagrams"
description: "Give the ER language from Tutorial 3 two switchable notations, Chen diagrams and a table-based logical view, plus a validation overlay that works with both."
sidebar:
  order: 5
  label: "Tutorial 5: ER Concrete Syntax"
  badge:
    text: New
    variant: tip
---

In this tutorial you give the ER language from [Tutorial 3](../tutorial-03-erd) a proper concrete syntax. You build two complete notations for the same models: a **Chen notation** (entities as rectangles, attributes as ovals, relationships as diamonds) and a **logical notation** (entities as tables with their attributes inside, relationships as direct edges). You finish with a validation overlay that works under both.

In Jjodel a notation is an exclusive viewpoint. Building a second notation does not touch the metamodel or the models; switching between notations is one click. This tutorial makes that concrete.

**Prerequisites:** Completed [Tutorial 3](../tutorial-03-erd). You reuse its `ERDLanguage` project, including the metamodel and the model with Person, Role, and Car. [Tutorial 4](../tutorial-04-simulation) is useful background for silent views but is not required.

**Time:** ~45 minutes

---

## Why Two Notations?

Chen notation is conceptual. It gives every attribute its own node, which makes it good for teaching and for whiteboard-style discussions, and verbose for anything larger than a handful of entities.

The logical notation is compact. Attributes collapse into rows inside the entity box, and relationships become plain labeled edges. It reads like a relational schema and scales to larger models.

Both notations render the same abstract syntax. Choosing between them is an audience decision, not a modeling decision. This is [multi-view modeling](../../user-guide/viewpoints) applied to concrete syntax: the viewpoint defines the concern, the model stays untouched.

---

## Part 1: Chen Notation

### Step 1: Create the ChenNotation viewpoint

1. Open the `ERDLanguage` metamodel
2. Click **+** in the Viewpoints panel
3. Name it `ChenNotation`
4. Leave **Is Exclusive** checked (this is a syntax viewpoint)
5. Activate it

The draft `ConceptualERD` viewpoint from Tutorial 3 stays as it is; you can compare the two at the end. Any metaclass without a view in `ChenNotation` falls back to the Default viewpoint's rendering, so the canvas never goes blank while you work.

### Step 2: Entity as a rectangle

Right-click on the `Entity` metaclass and select **Add View**. Open the **Template** tab and reduce the default template to a header with the editable name:

```jsx title="Template for Entity"
<div className={'root'}>
    <div className={'header'}>
        <div className={'input-container mx-2'}>
            {data.$name ?
                <Input data={data.$name} field={'value'} hidden={true} autosize={true} placeholder={'...'} /> :
                <Input data={data} field={'name'} hidden={true} autosize={true} placeholder={'Name'} />
            }
        </div>
    </div>
    {decorators}
</div>
```

Then open the **Style** tab and define the rectangle in the Local CSS & LESS Editor:

```scss title="Style for Entity (SCSS)"
&>.root {
    border: 2px solid var(--border-color-1)!important;
    background-color: var(--background-1);
    color: var(--color-1);
    display: flex;
    justify-content: center;
    align-items: center;
    width: 140px;
    height: 60px;

    &>.header {
        text-align: center;
        padding: 0px;
        margin: 0px;
    }
}
```

Note the separation: the template defines structure, the style defines appearance. In Tutorial 3 you wrote inline styles inside the JSX to get a quick result; moving them to the Style tab keeps templates readable and lets you recolor the notation through the palette swatches (`--background-1`, `--border-color-1`, `--color-1`) without touching code.

<!-- TODO: screenshot — Entity rendered as a plain rectangle in ChenNotation (new UI) -->

### Step 3: Attribute as an oval

In Chen notation every attribute is its own node. Right-click on `Attribute`, select **Add View**, and use the same header-only template as in Step 2. The oval shape comes entirely from the style:

```scss title="Style for Attribute (SCSS)"
&>.root {
    border: 1px solid var(--border-color-1)!important;
    border-radius: 50%;
    background-color: var(--background-1);
    color: var(--color-1);
    display: flex;
    justify-content: center;
    align-items: center;
    width: 110px;
    height: 50px;

    &>.header {
        text-align: center;
        padding: 0px;
        margin: 0px;
    }
}
```

Attributes are separate nodes on the canvas: drag each one next to its owning entity.

### Step 4: Underline key attributes

Chen notation underlines key attributes. The metamodel from Tutorial 3 has no notion of key yet, so extend it:

1. Go to the metamodel
2. Add an attribute `isKey` of type `Boolean` to the `Attribute` class

Because Jjodel is reflective, every existing Attribute instance immediately gains the `isKey` property. Set it to `true` on `Role.id` and `Car.id`.

Now make the Attribute template react to it. Add a conditional style on the header:

```jsx title="Template for Attribute (with key underline)"
<div className={'root'}>
    <div className={'header'}
         style={{textDecoration: data.$isKey && data.$isKey.value ? 'underline' : 'none'}}>
        <div className={'input-container mx-2'}>
            {data.$name ?
                <Input data={data.$name} field={'value'} hidden={true} autosize={true} placeholder={'...'} /> :
                <Input data={data} field={'name'} hidden={true} autosize={true} placeholder={'Name'} />
            }
        </div>
    </div>
    {decorators}
</div>
```

The condition is a plain JavaScript expression over `data`. Toggle `isKey` on any attribute and watch the underline appear and disappear live.

<!-- TODO: screenshot — Role entity with underlined id attribute oval (new UI) -->

### Step 5: Relationship as a diamond

Right-click on `Relationship` and select **Add View**, with the usual header-only template. The diamond is a rotated square; the header rotates back so the label stays horizontal:

```scss title="Style for Relationship (SCSS)"
&>.root {
    border: 2px solid var(--border-color-1)!important;
    background-color: var(--background-1);
    color: var(--color-1);
    display: flex;
    justify-content: center;
    align-items: center;
    width: 90px;
    height: 90px;
    transform: rotate(45deg);

    &>.header {
        transform: rotate(-45deg);
        text-align: center;
        padding: 0px;
        margin: 0px;
    }
}
```

Rotation is preferable to `clip-path` for diamonds: the border follows the rotated box, while `clip-path` would cut the border away together with the corners.

### Step 6: Edges with split cardinalities

A Chen relationship connects to its entities with two edges, and the cardinality splits across them: `OneToMany` puts `1` on the left edge and `N` on the right edge. Extend the Relationship template with two guarded `<Edge>` components:

```jsx title="Template for Relationship (with edges)"
<div className={'root'}>
    <div className={'header'}>
        <div className={'input-container mx-2'}>
            {data.$name ?
                <Input data={data.$name} field={'value'} hidden={true} autosize={true} placeholder={'...'} /> :
                <Input data={data} field={'name'} hidden={true} autosize={true} placeholder={'Name'} />
            }
        </div>
    </div>
    {data.$left.value &&
        <Edge
            view={'EdgeAssociation'}
            key={data.id + '_left'}
            start={node}
            end={data.$left.value.node}
            label={{OneToOne: '1', OneToMany: '1', ManyToOne: 'N', ManyToMany: 'N'}[data.$cardinality.value]}
        />
    }
    {data.$right.value &&
        <Edge
            view={'EdgeAssociation'}
            key={data.id + '_right'}
            start={node}
            end={data.$right.value.node}
            label={{OneToOne: '1', OneToMany: 'N', ManyToOne: '1', ManyToMany: 'N'}[data.$cardinality.value]}
        />
    }
    {decorators}
</div>
```

Three things happen here. `start={node}` anchors each edge to the diamond's own node. `end` navigates the `left` (or `right`) reference to the target entity and reaches its node through the data/node split (see the [JjOM reference](../../reference/jjom)). The `label` indexes a plain JavaScript object with the enumeration literal, so each edge shows its half of the cardinality; no special query language is involved.

The guards (`data.$left.value &&`) keep the template safe while the references are still unset. The mandatory constraints from the metamodel flag the missing values anyway.

Your Chen notation is complete: rectangles, ovals with underlined keys, diamonds, and labeled edges.

<!-- TODO: screenshot — complete Chen diagram with Person, Role, Car, hasRole, shares (new UI) -->

---

## Part 2: Logical Notation

### Step 7: Create the LogicalERD viewpoint

Create a second viewpoint named `LogicalERD`, again with **Is Exclusive** checked, and activate it. `ChenNotation` deactivates automatically: only one exclusive viewpoint is active at a time.

:::note[Fallback is expected]
Right after activation the canvas shows the generic Default rendering for everything: `LogicalERD` has no views yet. This is the fallback mechanism doing its job. You now replace it, view by view.
:::

### Step 8: Entity as a table

In the logical notation, attributes live inside the entity box as rows. Add a view for `Entity` with a header plus a rows section that maps over the containment reference:

```jsx title="Template for Entity (table)"
<div className={'root'}>
    <div className={'header'}>
        <div className={'input-container mx-2'}>
            {data.$name ?
                <Input data={data.$name} field={'value'} hidden={true} autosize={true} placeholder={'...'} /> :
                <Input data={data} field={'name'} hidden={true} autosize={true} placeholder={'Name'} />
            }
        </div>
    </div>
    <div className={'rows'}>
        {data.$ownedAttributes.map(attr =>
            <div key={attr.id} className={'row'}
                 style={{textDecoration: attr.$isKey && attr.$isKey.value ? 'underline' : 'none'}}>
                {attr.$name}: {attr.$type.value}
            </div>
        )}
    </div>
    {decorators}
</div>
```

The `map` over `data.$ownedAttributes` is the same navigation you used in Tutorial 3, now producing one row per attribute with its type, and reusing the `isKey` underline from Step 4.

```scss title="Style for Entity (SCSS)"
&>.root {
    border: 1px solid var(--border-color-1)!important;
    background-color: var(--background-1);
    color: var(--color-1);
    min-width: 160px;

    &>.header {
        font-weight: 600;
        text-align: center;
        padding: 4px;
        border-bottom: 1px solid var(--border-color-1);
    }

    &>.rows {
        padding: 4px 8px;
        font-size: 12px;

        &>.row {
            line-height: 1.6;
        }
    }
}
```

<!-- TODO: screenshot — Person rendered as a table with attribute rows (new UI) -->

### Step 9: Hide the standalone Attribute nodes

The table already lists every attribute, but each Attribute instance still renders as its own node through the Default fallback, cluttering the canvas with duplicates. Hide them with the same zero-size mechanism that powers [silent views](../../user-guide/viewpoints), just without any edge.

Add a view for `Attribute` with a minimal template:

```jsx title="Template for Attribute (hidden)"
<div className={'root'}>
    {decorators}
</div>
```

And a zero-size style:

```scss title="Style for Attribute (SCSS)"
&>.root {
    border: 0px solid var(--border-color-1)!important;
    width: 0px;
    height: 0px;
}
```

The attribute data is still there, still editable through the entity's rows and the properties panel; only its standalone node disappears in this notation.

### Step 10: Relationship as a direct edge

The logical notation draws no diamond. The relationship becomes a single edge between the two entities, so the view for `Relationship` is a true silent view:

```jsx title="Template for Relationship (silent view)"
<div className={'root'}>
    {data.$left.value && data.$right.value &&
        <Edge
            view={'EdgeAssociation'}
            key={data.id + '_edge'}
            start={data.$left.value.node}
            end={data.$right.value.node}
            label={{OneToOne: '1:1', OneToMany: '1:N', ManyToOne: 'N:1', ManyToMany: 'N:N'}[data.$cardinality.value]}
        />
    }
    {decorators}
</div>
```

Reuse the zero-size style from Step 9 for this view too.

Compare with Step 6: there the edges started at the visible diamond (`start={node}`); here both endpoints navigate references, and the relationship's own node has no visual presence at all. A silent edge carries one centered label, which is why the compact `1:N` form replaces the split cardinalities of the Chen notation.

<!-- TODO: screenshot — logical notation with tables and direct labeled edges (new UI) -->

---

## Part 3: One Overlay, Both Notations

### Step 11: Validate unique entity names

Tutorial 3 mentioned a semantic rule the metamodel alone cannot express: no two entities may share a name. Enforce it with a validation overlay.

1. Create a viewpoint named `UniqueNames` with **Is Exclusive unchecked** (this is an overlay)
2. Activate it; it composes with whatever exclusive notation is active
3. Add a view targeting `Entity`
4. Leave template and style alone; open the **Events** tab and add an `onDataUpdate` rule:

```javascript title="Unique Entity Names Validation"
// onDataUpdate handler for the Entity metaclass
let duplicates = data.$parent.$children
    .filter(c => c.$className === 'Entity' && c.$name === data.$name).length;

if (duplicates > 1) {
    node.state = {error_duplicate: "Entity names must be unique!"}
} else {
    node.state = {error_duplicate: undefined}
}
```

The rule follows the standard [validation pattern](../../reference/jjodel-events): navigate from the instance to its siblings, count the conflicts, and write the result to `node.state`. The Generic error view renders the notification; you write no template and no style.

Test it: rename `Car` to `Person`. Both entities show the error. Rename it back and the error clears through the `else` branch.

<!-- TODO: screenshot — duplicate name error shown on two Person entities (new UI) -->

### Step 12: Switch notations, keep the overlay

Activate `ChenNotation` again. The diamonds and ovals return, and the `UniqueNames` overlay stays active: overlays compose with any exclusive viewpoint. Rename an entity into a conflict and the error appears inside the Chen rendering exactly as it did in the logical one.

Switch back and forth a few times. The model never changes; the notations are interchangeable projections; validation is orthogonal to both. This separation (one abstract syntax, many concrete syntaxes, overlays for cross-cutting concerns) is the core of how Jjodel treats notation as cheap, disposable infrastructure rather than a commitment.

<!-- TODO: screenshot — same model side by side in Chen and logical notation (new UI) -->

---

## What You Learned

In this tutorial you:

- Built **two exclusive syntax viewpoints** for the same metamodel and switched between them without touching the model
- Separated **structure from appearance**: JSX templates for the former, scoped SCSS in the Style tab for the latter
- Extended the metamodel with `isKey` and used **live co-evolution** inside a conditional template expression
- Rendered edges both **from a visible node** (the Chen diamond) and **from a silent view** (the logical edge), choosing endpoints through data/node navigation
- **Hid nodes** with zero-size styles when their data is already rendered elsewhere
- Wrote a **validation overlay** with the ECA pattern that keeps working under any active notation

## Next Steps

- [Viewpoints](../../user-guide/viewpoints): decoration overlays, panels, and controls to enrich your notations
- [Jjodel Events](../../reference/jjodel-events): the full ECA reference behind the validation rule
- [Tutorial 4: State Machine Simulation](../tutorial-04-simulation): silent views plus operational semantics and simulation panels
