---
title: "Tutorial 3: Entity-Relationship Diagrams"
description: Build a complete ER diagram language from scratch — metamodel with composition, enumerations, and a visual viewpoint.
sidebar:
  order: 3
---

In this tutorial you build a complete Entity-Relationship diagram language. Unlike the first two tutorials, this one follows a realistic workflow: you start with a known notation, formalize it as a metamodel, discover problems along the way, and solve them using composition, enumerations, and validation.

The objective is to build a DSL that lets you describe ER diagrams by defining what Entities, Attributes, and Relationships mean at the metamodel level. You will create core classes, define relationships between them, and add enumerations for type safety.

**Prerequisites:** Completed [Tutorial 1](./tutorial-01-basic) and familiarity with [Basic Notions](../../concepts/basic-notions).

**Time:** ~40 minutes

---

## Why ER Diagrams?

ER diagrams are a notation you already know from database courses. This is intentional: because the domain is familiar, you can focus on the metamodeling process rather than domain analysis. The reduced cognitive load makes this an ideal exercise for learning abstract syntax, references, enumerations, and later concrete syntax.

ER diagrams are particularly suited as a first DSL because they introduce several key metamodeling concepts at once: references between classes (an Entity having Relationships), enumerations (cardinalities), semantic rules (no duplicate entity names), and later, different concrete syntaxes (conceptual vs logical views of the same model).

### Domain vs Notation

A subtle but important point: ER diagrams are not themselves a domain to be analyzed. They are a *notation* used to model other domains (library management, hospital staffing, e-commerce). In this tutorial, the ER notation itself becomes the subject of our metamodeling exercise. Entity, Attribute, and Relationship are the concepts we classify and formalize.

In most real-world scenarios, you build DSLs for domains, not for notations. You would model a hospital, not the ER diagram format. We use ERD here because it is a notation you already understand, so you can concentrate entirely on the metamodeling mechanics.

---

## Part 1: The Metamodel

### Step 1.1: Create the Project

1. Log in to [app.jjodel.io](https://app.jjodel.io)
2. Create a **New Project** named `ERDLanguage`
3. Create a new **Metamodel**

### Step 1.2: Define NamedElement

Many ER concepts share a common property: they all have a name. Instead of repeating this attribute in every class, define a shared superclass.

1. Create a class called `NamedElement`
2. Set **isAbstract** to `true` (this class will never be instantiated directly)
3. Add an attribute `name` of type `String`, set as mandatory

<!-- TODO: screenshot — NamedElement class with name attribute (new UI) -->

### Step 1.3: Define Entity

1. Create a class called `Entity`
2. Set `Entity` to **extend** `NamedElement` (it inherits the `name` attribute)

### Step 1.4: Define Attribute

1. Create a class called `Attribute`
2. Set `Attribute` to **extend** `NamedElement`
3. Create a **containment reference** from `Entity` to `Attribute`
   - Name: `ownedAttributes`
   - Multiplicity: `0..*`
   - Enable **containment** (the black diamond)

### Why Containment Matters

Containment (the black diamond on the reference) means that an Attribute *belongs exclusively* to one Entity. If an Attribute is contained by Entity A, it cannot simultaneously belong to Entity B.

Without containment, the metamodel would allow the same Attribute instance to be shared between multiple Entities, which does not make sense in the ER domain.

Containment also changes how you create instances: new Attributes can only be created through the **context menu** of an Entity, not as standalone elements. This enforces the ownership rule directly in the editor.

<!-- TODO: screenshot — Entity with containment reference to Attribute (new UI) -->

### Step 1.5: Define Types with an Enumeration

Attributes need types. Define them as an enumeration.

1. Create an **Enumeration** called `Type`
2. Add the following literals: `String`, `Integer`, `Boolean`
3. Add an attribute `type` to the `Attribute` class
   - Set the type to the `Type` enumeration
   - Set as mandatory (lower bound = 1)

Because Jjodel is reflective, existing Attribute instances in your model immediately gain the new `type` property. No regeneration needed.

<!-- TODO: screenshot — Type enumeration and Attribute with type property (new UI) -->

### Step 1.6: Define Relationship

1. Create a class called `Relationship`
2. Set `Relationship` to **extend** `NamedElement`
3. Create two **non-containment references** to `Entity`:
   - `left` (multiplicity: `1..1`, mandatory)
   - `right` (multiplicity: `1..1`, mandatory)

These are plain references, not containment: a Relationship points to two Entities but does not own them.

### Step 1.7: Define Cardinality

Relationships in ER diagrams have cardinality constraints. Model these as an enumeration.

1. Create an **Enumeration** called `Cardinality`
2. Add the following literals: `OneToOne`, `OneToMany`, `ManyToOne`, `ManyToMany`
3. Add an attribute `cardinality` to the `Relationship` class
   - Set the type to `Cardinality`
   - Set as mandatory

<!-- TODO: screenshot — complete ER metamodel (new UI) -->

Your metamodel is complete. It defines: entities with owned attributes (composition), typed attributes (enumeration), and relationships with cardinality between entities.

---

## Part 2: The Model

### Step 2.1: Create a Model

1. From the workspace, create a **New Model** conforming to your ER metamodel
2. The model editor opens with the abstract syntax view

### Step 2.2: Create Entities

Create three entities using the abstract syntax:

**Person**
- Attribute `name` (type: String)
- Attribute `surname` (type: String)
- Attribute `age` (type: Integer)

**Role**
- Attribute `id` (type: Integer)
- Attribute `name` (type: String)

**Car**
- Attribute `id` (type: Integer)
- Attribute `manufacturer` (type: String)

Because `ownedAttributes` is a containment reference, you create new attributes through the context menu of each Entity (right-click on the Entity, select "Add Attribute").

<!-- TODO: screenshot — model with Person, Role, Car entities and their attributes (new UI) -->

### Step 2.3: Create Relationships

Create two relationships:

1. **hasRole**: Person (left) to Role (right), cardinality: OneToMany
2. **shares**: Person (left) to Car (right), cardinality: ManyToMany

You will see validation errors until you specify the `left`, `right`, and `cardinality` properties for each relationship. The mandatory constraints from the metamodel enforce this.

<!-- TODO: screenshot — model with relationships and validation (new UI) -->

### Step 2.4: Observe Co-evolution

Go back to the metamodel and add a new literal to the `Cardinality` enumeration: `ZeroToMany`. Switch back to the model. The new option is immediately available in the cardinality dropdown for relationships.

This is live co-evolution in action. No regeneration, no recompilation.

---

## Part 3: A Visual Viewpoint

The abstract syntax view shows every element as an individual item with properties. This is functional but verbose. A proper ER diagram uses rectangles for entities, ovals for attributes, and diamonds for relationships. Let's build that.

### Step 3.1: Create a Viewpoint

1. Go to the metamodel
2. Create a new **Viewpoint** (e.g., `ConceptualERD`)
3. Activate the viewpoint

### Step 3.2: Add an Entity View

1. Right-click on the `Entity` class in the metamodel
2. Select **Add View**
3. The view is created with a default template

The **predicate** determines which model elements this view applies to. By default, it selects all instances of `Entity`. You can write this as an OCL predicate:

``` title="OCL Predicate"
context DObject inv: self.instanceof.name = 'Entity'
```

Or equivalently in JavaScript:

```javascript title="Predicate (JavaScript)"
data.instanceof.id === '<Entity-metaclass-id>'
```

Using the metaclass ID (instead of the name string) makes the predicate resilient to class renaming.

### Step 3.3: Customize the Template

The template defines the visual representation using JSX. Replace the default template with something like:

```jsx title="Template for Entity"
<div style={{padding: '8px', border: '2px solid #334155', borderRadius: '4px', background: '#f8fafc'}}>
  <strong>{data.$name}</strong>
  {data.$ownedAttributes.map(attr =>
    <div key={attr.id} style={{fontSize: '12px', color: '#64748b'}}>
      {attr.$name}: {attr.$type.value}
    </div>
  )}
</div>
```

This renders each Entity as a box with its name in bold and its attributes listed below. The expression `data.$ownedAttributes` navigates the containment reference, and `attr.$type.value` reads the enumeration value.

<!-- TODO: screenshot — Entity rendered with custom viewpoint (new UI) -->

### Step 3.4: Add Attribute and Relationship Views

Following the same process, add views for:

- **Attribute**: rendered as an oval or a simple label (the concrete appearance depends on your design choice)
- **Relationship**: rendered as a diamond shape, with edges connecting to the left and right entities

For edges, use the `<Edge />` component in your template:

```jsx title="Template for Relationship Edge"
{data.$left && <Edge
  id={data.id + '_left'}
  source={node}
  target={/* navigate to the left entity's node */}
  label={data.$cardinality.value}
/>}
```

Edge specification requires navigating both the data submodel (to find the target element) and the node submodel (to find its visual position). See the [JjOM reference](../../reference/jjom) for details on the data/node split.

<!-- TODO: screenshot — complete ER diagram with conceptual syntax (new UI) -->

---

## What You Learned

In this tutorial you:

- Built a metamodel using **composition** (containment references) to enforce ownership rules
- Used **enumerations** to define closed sets of values (types, cardinalities)
- Experienced **validation** through mandatory constraints
- Observed **live co-evolution** when extending an enumeration
- Created a **visual viewpoint** with JSX templates and edge components
- Used the **$ prefix** to access user-defined attributes and references in templates

## Next Steps

- [Domain Analysis](../../concepts/domain-analysis) — apply this process to an unfamiliar domain
- [Viewpoints Reference](../../user-guide/viewpoints) — explore advanced viewpoint features (styling, events, options)
- [JjOM Reference](../../reference/jjom) — understand data vs node submodels for edge navigation
