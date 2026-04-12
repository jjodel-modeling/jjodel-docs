---
title: "Tutorial 2: Custom Viewpoints"
description: Create multiple viewpoints for the same model — visual, validation, and code generation.
sidebar:
  order: 2
---

In this tutorial you will extend the class diagram language from Tutorial 1 by creating multiple viewpoints that offer different perspectives on the same model.

**Prerequisites:** Completed [Tutorial 1](./tutorial-01-basic).

**Time:** ~25 minutes

---

## Part 1 — A Compact Viewpoint

The viewpoint from Tutorial 1 shows full class details. Let's create a simplified viewpoint that shows only class names and relationships — useful for high-level architecture diagrams.

### Step 1.1 — Create a New Viewpoint

1. Open the Viewpoint Editor
2. Create a new viewpoint named `ArchitectureOverview`

### Step 1.2 — Define a Simplified Class View

1. **Shape**: Rounded rectangle
2. **Label**: Display only `self.name` (no attributes)
3. **Style**: Light blue fill (`#e0f2fe`), no compartments
4. **Size**: Smaller than the full class view

### Step 1.3 — Keep the Relationship Views

Reuse or recreate the Association and Inheritance views from Tutorial 1. The diagram now shows a clean, compact architecture overview.

<!-- TODO: screenshot — architecture overview viewpoint (new UI) -->

:::tip[Multi-view in action]
You can switch between the `ClassDiagramNotation` and `ArchitectureOverview` viewpoints at any time. The underlying model is the same — only the visual representation changes.
:::

---

## Part 2 — A Validation Viewpoint

Validation viewpoints check that models satisfy specific rules and highlight violations.

### Step 2.1 — Create a Validation Viewpoint

1. Create a new viewpoint named `ClassDiagramValidation`
2. Set its type to **Validation**

### Step 2.2 — Define Validation Rules

Add the following rules:

**Rule 1: Classes must have names**
```javascript
// Constraint: name must not be empty
self.name !== null && self.name.trim().length > 0
```
- Severity: **Error**
- Message: `"Class name must not be empty"`

**Rule 2: No duplicate class names**
```javascript
// Constraint: name must be unique within the diagram
Class.allInstances.filter(c => c.name === self.name).length === 1
```
- Severity: **Error**
- Message: `"Duplicate class name: " + self.name`

**Rule 3: Classes should have at least one attribute**
```javascript
self.attributes.length > 0
```
- Severity: **Warning**
- Message: `"Class '" + self.name + "' has no attributes"`

### Step 2.3 — Test the Validation

1. Apply the validation viewpoint to your model
2. Try creating a class without a name — you should see an error notification
3. Try creating two classes with the same name — another error
4. Remove all attributes from a class — a warning appears

<!-- TODO: screenshot — validation notifications (new UI) -->

---

## Part 3 — A Code Generation Viewpoint

Generation viewpoints transform model elements into text — source code, documentation, or configuration files.

### Step 3.1 — Create a Generation Viewpoint

1. Create a new viewpoint named `JavaCodeGen`
2. Set its type to **Generation**

### Step 3.2 — Define a Template for Classes

Create a template that generates Java class stubs from your model:

```jsx
{`public class ${self.name} {
${self.attributes.map(a => 
  `    private ${a.type} ${a.name};`
).join('\n')}

${self.attributes.map(a => 
  `    public ${a.type} get${a.name.charAt(0).toUpperCase() + a.name.slice(1)}() {
        return this.${a.name};
    }
    
    public void set${a.name.charAt(0).toUpperCase() + a.name.slice(1)}(${a.type} ${a.name}) {
        this.${a.name} = ${a.name};
    }`
).join('\n\n')}
}`}
```

### Step 3.3 — Generate Code

Apply the generation viewpoint. For the `Person` class with attributes `name: String` and `age: Integer`, the output would be:

```java
public class Person {
    private String name;
    private Integer age;

    public String getName() {
        return this.name;
    }
    
    public void setName(String name) {
        this.name = name;
    }

    public Integer getAge() {
        return this.age;
    }
    
    public void setAge(Integer age) {
        this.age = age;
    }
}
```

<!-- TODO: screenshot — generated code output (new UI) -->

---

## What You Learned

In this tutorial you:

- Created a **compact viewpoint** for architecture overviews
- Built a **validation viewpoint** with error and warning rules
- Implemented a **code generation viewpoint** that produces Java code from models
- Experienced **multi-view modeling** — three different perspectives on the same model

## Next Steps

- [Viewpoints Reference](../user-guide/viewpoints) — full viewpoint configuration options
- [JjOM API](../reference/jjom-api) — programmatic access for advanced expressions
- [Jjodel Events](../reference/jjodel-events) — add interactive behaviors to your viewpoints
