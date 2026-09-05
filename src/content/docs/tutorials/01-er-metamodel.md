---
title: "Your First Language: An ER Metamodel"
description: "Define a metamodel for Entity-Relationship diagrams, build a first model that conforms to it, and watch the two evolve together."
sidebar:
  order: 1
  label: "1. An ER Metamodel"
---

In this tutorial you define the abstract syntax of an Entity-Relationship language: entities that own typed attributes, relationships between entities, and cardinalities. You then build a small model with it and change the metamodel while the model is open, to see how Jjodel keeps the two in sync. No concrete syntax yet: the model is edited in the default view, so this page teaches one thing, the metamodel.

<!-- TODO: video pill (under 3 minutes): the seven metamodel steps at speed -->

<!-- TODO: screenshot: the finished ER metamodel on the canvas (new UI) -->

**Prerequisites:** [Your First Project](../../getting-started/first-project) and [Basic Notions](../../concepts/basic-notions).

**Time:** about 30 minutes.

## Why ER diagrams

ER diagrams are a notation you know from database courses. The domain is familiar, so you can concentrate on the metamodeling mechanics: inheritance, containment, enumerations, mandatory features. The same notation carries the whole tutorial path: in the next tutorials it gets a graphical syntax, a data entry table, and a transformation to a relational schema.

One point is worth keeping in mind. ER diagrams are not a domain; they are a notation used to model other domains (a library, a hospital, a shop). Here the notation itself is what you formalize: Entity, Attribute and Relationship are the concepts you classify. In most real projects you build a language for a domain, not for a notation, and [Domain Analysis](../../concepts/domain-analysis) describes that process.

## Part 1: The metamodel

### Step 1: Create the project

1. Sign in to [app.jjodel.io](https://app.jjodel.io).
2. From the Dashboard, click **New Project**, name it `ERDLanguage`, and click **Create**.
3. Open the project and create a new **Metamodel**. The Metamodel Editor opens with an empty canvas and the palette on the left.

If the palette or the properties panel look unfamiliar, the [Metamodel Editor](../../user-guide/metamodel-editor) page describes each area.

### Step 2: Define NamedElement

Entities, attributes and relationships all have a name. Instead of repeating the attribute three times, define it once in an abstract superclass.

1. Drag **Abstract Class** from the palette onto the canvas and name it `NamedElement`.
2. Drag **Attribute** from the **Members** section and drop it on `NamedElement`. Name it `name`, set its type to `EString`.
3. In the properties panel, set the multiplicity of `name` to `[1..1]`. The attribute is now mandatory: every named element must have a name.

Abstract means the class is never instantiated directly. It exists to be inherited from.

<!-- TODO: screenshot: NamedElement with the name attribute selected in the properties panel (new UI) -->

### Step 3: Define Entity

1. Drag **Class** onto the canvas and name it `Entity`.
2. Draw an inheritance connection from `Entity` to `NamedElement` (from the **Connections** section of the palette, or by dragging from an anchor of `Entity` to `NamedElement`).

`Entity` now inherits `name`. The class box shows no attribute of its own, but the tree view lists the inherited feature.

### Step 4: Define Attribute and its containment

1. Drag **Class** onto the canvas, name it `Attribute`, and make it extend `NamedElement` as you did for `Entity`.
2. Create a reference from `Entity` to `Attribute`: drag from an anchor of `Entity` to `Attribute`, or right-click `Entity` and choose **Add reference**, then set the type to `Attribute` in the properties panel.
3. Name the reference `ownedAttributes`, set its multiplicity to `[0..*]`, and switch on **Composition**.

Composition (containment) is the decision that matters here. It says that an Attribute belongs to exactly one Entity: the same Attribute instance cannot appear in two entities, and deleting an Entity deletes its attributes. It also changes how you create instances later: in a model, an Attribute can only be created from its parent Entity, never as a standalone element.

<!-- TODO: screenshot: the ownedAttributes reference with Composition switched on (new UI) -->

### Step 5: Give attributes a type

Attributes need a type. Model the allowed types as a closed set.

1. Drag **Enumeration** onto the canvas and name it `Type`.
2. Drag **Literal** from **Members** onto the enumeration three times, naming the literals `String`, `Integer`, `Boolean`.
3. Drop an **Attribute** on the `Attribute` class, name it `type`, and set its type to the `Type` enumeration instead of a primitive. Make it mandatory with multiplicity `[1..1]`.

In a model, `type` will appear as a dropdown listing the three literals.

### Step 6: Define Relationship

1. Drag **Class** onto the canvas, name it `Relationship`, and make it extend `NamedElement`.
2. Create two references from `Relationship` to `Entity`, named `left` and `right`, both with multiplicity `[1..1]` and Composition switched off.

These are plain references: a Relationship points at two entities but does not own them. The two entities keep living on their own, and the same Entity can take part in many relationships.

### Step 7: Define Cardinality

1. Drag **Enumeration** onto the canvas and name it `Cardinality`.
2. Add the literals `OneToOne`, `OneToMany`, `ManyToOne`, `ManyToMany`.
3. Drop an **Attribute** on `Relationship`, name it `cardinality`, type `Cardinality`, multiplicity `[1..1]`.

The metamodel is complete. The status bar should report 4 classes, 2 enumerations, 3 attributes and 3 references. It defines entities that own typed attributes (composition plus an enumeration) and relationships with a cardinality between two entities.

<!-- TODO: screenshot: the complete metamodel, ER rendering style (new UI) -->

## Part 2: A first model

### Step 8: Create the model

From the workspace, create a new **Model** and choose `ERDLanguage` as its metamodel. The model opens in the default view: each element is a node listing its properties, with no notation of its own. That is what the next tutorial adds.

### Step 9: Create three entities

Create three instances of `Entity` and fill them as follows. Because `ownedAttributes` is a containment reference, you create each attribute from its entity: right-click the entity node and add an `Attribute` from the context menu, then set its `name` and pick its `type` from the dropdown.

`Person` with attributes `name` (String), `surname` (String), `age` (Integer).

`Role` with attributes `id` (Integer), `name` (String).

`Car` with attributes `id` (Integer), `manufacturer` (String).

Try to create an `Attribute` from the palette or from the canvas background: the editor does not offer it. Containment rules out attributes without an owner.

<!-- TODO: screenshot: the model with Person, Role and Car in the default view (new UI) -->

### Step 10: Create two relationships

Create two instances of `Relationship`:

`hasRole`: `left` is `Person`, `right` is `Role`, `cardinality` is `OneToMany`.

`shares`: `left` is `Person`, `right` is `Car`, `cardinality` is `ManyToMany`.

Until `left`, `right` and `cardinality` are set, each relationship shows a validation error. The three features are mandatory in the metamodel (`[1..1]`), and the editor reports the violation as soon as the instance exists. The reference pickers for `left` and `right` list only entities, because that is the type you declared.

<!-- TODO: screenshot: a Relationship with a validation error before left and right are set (new UI) -->

### Step 11: Change the metamodel while the model is open

Go back to the metamodel and add a literal `ZeroToMany` to the `Cardinality` enumeration. Return to the model and open the `cardinality` dropdown of `hasRole`: the new literal is there.

The same holds for any change. Add an attribute to a class and every instance of that class shows the new property; make a feature mandatory and instances that leave it empty are flagged at once. The next tutorial uses this when it adds an `isKey` flag to `Attribute` with the model already populated.

This is live co-evolution. The model is checked against the metamodel as it is now, not against a copy taken when the model was created, and there is no regeneration step in between.

## What you learned

You built a metamodel with an abstract superclass and inheritance, used composition to express ownership, and used enumerations for closed sets of values. You created a model that conforms to it, saw mandatory features turn into validation errors, and changed the metamodel with the model open.

Two ideas from this tutorial carry through the whole path. Containment decides how instances are created, which the Data Manager tutorial relies on. And enumerations become dropdowns in every form, which is what makes data entry in later tutorials safe.

## Next steps

Continue with [Concrete Syntax for ER Diagrams](../tutorial-05-er-concrete-syntax), which gives this metamodel a Chen notation and a table-based notation. For the features you used here, see the [Metamodel Editor](../../user-guide/metamodel-editor) page and the [JjOM reference](../../reference/jjom).
