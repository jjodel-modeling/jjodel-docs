---
title: Your First Project
description: Build your first metamodel, model, and viewpoint in Jjodel — step by step.
sidebar:
  order: 3
---

This guide walks you through creating a minimal but complete language workbench in Jjodel: a simple class diagram language with classes, attributes, and associations.

## Step 1 — Create a New Project

1. From the **Dashboard**, click the main menu (upper-left corner)
2. Select **New Project**
3. Give your project a name (e.g., `MyFirstLanguage`) and an optional description
4. Click **Create**

Your project is now visible in the Dashboard. Click on it to enter the workspace.

<!-- TODO: screenshot — new project dialog (new UI) -->

## Step 2 — Define Your Metamodel

The metamodel defines the *abstract syntax* of your language — what kinds of elements exist and how they relate to each other.

1. In the workspace, open the **Metamodel Editor**
2. Create a new class called `Class`
   - Add an attribute `name` of type `String`
3. Create a second class called `Attribute`
   - Add an attribute `name` of type `String`
   - Add an attribute `type` of type `String`
4. Create a **containment reference** from `Class` to `Attribute`
   - Name it `attributes`, set multiplicity to `0..*`
5. Create a third class called `Association`
   - Add a reference `source` pointing to `Class`
   - Add a reference `target` pointing to `Class`

You now have a metamodel that can describe class diagrams with classes, their attributes, and associations between classes.

<!-- TODO: screenshot — metamodel editor with the three classes (new UI) -->

:::tip[Live co-evolution]
As you modify the metamodel, Jjodel automatically propagates changes to all models and viewpoints. No regeneration or recompilation needed.
:::

## Step 3 — Create a Model

A model is an *instance* of your metamodel — it contains concrete data conforming to the rules you defined.

1. From the workspace, create a **New Model**
2. Instantiate a `Class` element and name it `Person`
   - Add an `Attribute` named `name` with type `String`
   - Add an `Attribute` named `age` with type `Integer`
3. Instantiate another `Class` element named `Address`
   - Add an `Attribute` named `street` with type `String`
4. Create an `Association` from `Person` to `Address`

You have just created a simple domain model using the language you defined in Step 2.

<!-- TODO: screenshot — model editor with Person and Address (new UI) -->

## Step 4 — Create a Viewpoint

Viewpoints define the *concrete syntax* — how model elements look in the graphical editor.

1. Open the **Viewpoint Editor**
2. Create a new viewpoint (e.g., `ClassDiagramView`)
3. Define a **view** for `Class`:
   - Use a rectangle shape
   - Display the class name as a label
   - Show contained attributes inside the rectangle
4. Define a **view** for `Association`:
   - Use a line connecting source and target classes
5. Apply the viewpoint to your model

Your model is now rendered as a visual class diagram.

<!-- TODO: screenshot — rendered class diagram viewpoint (new UI) -->

## What You Built

Congratulations — you have just created a complete language workbench:

- A **metamodel** defining the abstract syntax (classes, attributes, associations)
- A **model** containing domain-specific instances (Person, Address)
- A **viewpoint** providing a graphical concrete syntax (class diagram notation)

This is the fundamental workflow in Jjodel. From here you can extend your language with validation rules, code generation, custom events, and more.

## Next Steps

- [Dashboard](../../user-guide/dashboard) — manage your projects
- [Metamodel Editor](../../user-guide/metamodel-editor) — explore advanced metamodeling features
- [Viewpoints](../../user-guide/viewpoints) — learn about visual, textual, and validation viewpoints
- [Basic Notions](../../concepts/basic-notions) — understand the conceptual foundations
