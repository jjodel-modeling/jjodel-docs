---
title: "Tutorial 1: A Basic Class Diagram Language"
description: Build a simple UML class diagram language from scratch — metamodel, model, and visual viewpoint.
sidebar:
  order: 1
---

# Tutorial 1: A Basic Class Diagram Language

In this tutorial you will build a simple UML class diagram language from scratch. By the end, you will have a working language workbench that lets you create class diagrams with classes, attributes, and associations.

**Prerequisites:** A Jjodel account and familiarity with the [Getting Started](../getting-started/) guide.

**Time:** ~20 minutes

---

## Part 1 — The Metamodel

The metamodel defines what elements exist in your language and how they relate to each other.

### Step 1.1 — Create the Project

1. Log in to [app.jjodel.io](https://app.jjodel.io)
2. From the Dashboard, create a **New Project** named `UMLClassDiagram`

### Step 1.2 — Define the `ClassDiagram` Root Class

1. Open the Metamodel Editor
2. Create a new class called `ClassDiagram`
   - Set **isRootable** to `true` — this class will be the root container of every model
3. This class will contain all other elements

### Step 1.3 — Define the `Class` Element

1. Create a new class called `Class`
2. Add the following attributes:
   - `name: String`
   - `isAbstract: Boolean` (default: `false`)
3. Create a **containment reference** from `ClassDiagram` to `Class`
   - Name: `classes`
   - Multiplicity: `0..*`

### Step 1.4 — Define `Attribute`

1. Create a new class called `Attribute`
2. Add attributes:
   - `name: String`
   - `type: String`
   - `visibility: String` (values: `public`, `private`, `protected`)
3. Create a **containment reference** from `Class` to `Attribute`
   - Name: `attributes`
   - Multiplicity: `0..*`

### Step 1.5 — Define `Association`

1. Create a new class called `Association`
2. Add attributes:
   - `name: String`
   - `sourceMultiplicity: String`
   - `targetMultiplicity: String`
3. Create two **non-containment references**:
   - `source` → `Class` (multiplicity: `1..1`)
   - `target` → `Class` (multiplicity: `1..1`)
4. Create a **containment reference** from `ClassDiagram` to `Association`
   - Name: `associations`
   - Multiplicity: `0..*`

### Step 1.6 — Add Inheritance

1. Create a class called `Inheritance`
2. Create two **non-containment references**:
   - `parent` → `Class` (multiplicity: `1..1`)
   - `child` → `Class` (multiplicity: `1..1`)
3. Add a containment reference from `ClassDiagram` to `Inheritance`
   - Name: `inheritances`
   - Multiplicity: `0..*`

<!-- TODO: screenshot — complete metamodel in the editor (new UI) -->

Your metamodel is complete. It defines a language with class diagrams containing classes (with attributes), associations, and inheritance relationships.

---

## Part 2 — The Model

Now create a sample model using the language you just defined.

### Step 2.1 — Create a New Model

1. From the workspace, create a **New Model** conforming to your `UMLClassDiagram` metamodel
2. Create a `ClassDiagram` root instance

### Step 2.2 — Add Classes

Create the following classes:

**Person**
- `name: String`
- `age: Integer`
- `email: String`

**Student** (extends Person)
- `studentId: String`
- `enrollmentYear: Integer`

**Course**
- `title: String`
- `credits: Integer`

### Step 2.3 — Add Relationships

1. Create an **Association** named `enrolledIn`
   - Source: `Student`
   - Target: `Course`
   - Source multiplicity: `0..*`
   - Target multiplicity: `1..*`

2. Create an **Inheritance**
   - Parent: `Person`
   - Child: `Student`

<!-- TODO: screenshot — model with Person, Student, Course (new UI) -->

---

## Part 3 — The Viewpoint

Finally, create a visual viewpoint to render your model as a UML class diagram.

### Step 3.1 — Create a Viewpoint

1. Open the Viewpoint Editor
2. Create a new viewpoint named `ClassDiagramNotation`

### Step 3.2 — Define the Class View

Create a view for the `Class` metaclass:

1. **Shape**: Rectangle
2. **Header**: Display `self.name` in bold
3. **Compartment**: List `self.attributes` as `name: type` entries
4. **Style**: White fill, black border, if `self.isAbstract` then italic name

### Step 3.3 — Define the Association View

Create a view for `Association`:

1. **Shape**: Edge (line connecting source and target)
2. **Label**: Display `self.name` at the midpoint
3. **Source label**: `self.sourceMultiplicity`
4. **Target label**: `self.targetMultiplicity`

### Step 3.4 — Define the Inheritance View

Create a view for `Inheritance`:

1. **Shape**: Edge with a hollow triangle arrowhead at the parent end
2. **Line style**: Solid

### Step 3.5 — Apply and Enjoy

Apply the viewpoint to your model. You should see a proper UML class diagram with Person, Student, and Course rendered as boxes, connected by association lines and an inheritance arrow.

<!-- TODO: screenshot — rendered class diagram (new UI) -->

---

## What You Learned

In this tutorial you:

- Defined a complete metamodel for a class diagram language
- Created a model instance with classes, attributes, and relationships
- Built a visual viewpoint that renders the model as a UML class diagram
- Experienced Jjodel's live co-evolution — changes to the metamodel were immediately reflected in the model and viewpoint

## Next Steps

- [Tutorial 2: Custom Viewpoints](./tutorial-02-viewpoint) — explore advanced viewpoint features
- [Viewpoints Reference](../user-guide/viewpoints) — deep dive into viewpoint configuration
- [Anatomy of a Modeling Language](../concepts/modeling-language-anatomy) — understand the theoretical foundations
