---
title: JjEL Reference
description: Complete reference for the Jjodel Expression Language.
sidebar:
  order: 2
---

JjEL (Jjodel Expression Language) is a declarative language for navigating models, querying elements, and computing values. You use it in the Console, in JjTL guards and mappings, and inside JjScript expressions.

JjEL is side-effect-free: expressions read data but never modify it. If you need to create or modify model elements, use JjScript.

## Where JjEL is used

| Context | Example |
|---------|---------|
| Console | `forall c in classes : c.name` |
| JjTL guards | `when self.isAbstract` |
| JjTL mappings | `self.attributes.filter(a => a.type.name == "String")` |
| JjScript | Embedded in scripting commands for querying |

## Built-in collections

These identifiers are available in any JjEL context and return collections of metamodel elements:

| Identifier | Returns |
|------------|---------|
| `classes` | All classes in the active metamodel |
| `enumerations` | All enumerations in the active metamodel |
| `metamodels` | All metamodels in the current project |

```
> classes
SUCCESS — 4 results
State, namedElement, Transition, Event
```

## Property access

Use dot notation to access properties of a single element. User-defined attributes and references are accessed directly, without any prefix:

```jjel title="JjEL"
// Given p is an instance of a Person class
p.name               // returns "Alice"
p.age                // returns 25
p.sex                // returns "Male" (enum as string)
p.instanceof         // returns Person (the class)
p.instanceof.name    // returns "Person"
```

Metamodel elements are navigated the same way:

```jjel title="JjEL"
> myClass.name
"State"

> myClass.isAbstract
false

> myClass.attributes
[name, isInitial, isFinal]
```

Accessing a property on a **collection** is an error. Use `forall` instead:

```
> classes.name
ERROR — cannot access property 'name' on a collection.
Use 'forall c in classes : c.name'
```

When a user-defined feature has the same name as a built-in JjOM property, the user feature takes priority. To access the built-in property explicitly, use `data.id` or `data.className`.

## Iteration: forall

`forall` iterates over a collection, optionally filters, and projects each element.

**Syntax:**
```
forall <variable> in <collection> : <projection>
forall <variable> in <collection> such that <filter> : <projection>
forall <variable> in <collection> such that <filter>
```

**Examples:**

```jjel title="JjEL"
// Project: get all class names
forall c in classes : c.name

// Filter + project: names of abstract classes
forall c in classes such that c.isAbstract : c.name

// Filter only: abstract classes (returns the elements themselves)
forall c in classes such that c.isAbstract

// Nested: all attribute names across all classes
forall c in classes : forall a in c.attributes : a.name

// Cross-metamodel navigation
forall m in metamodels : {metamodel: m.name, classCount: m.classes.size}
```

## Existence: exists

`exists` checks whether at least one element in a collection satisfies a condition. Returns a boolean.

**Syntax:**
```
exists <variable> in <collection> : <predicate>
exists <variable> in <collection> such that <predicate>
```

**Examples:**

```jjel title="JjEL"
// Does any class have attributes?
exists c in classes : c.attributes.size > 0

// Is there a class named "Person"?
exists c in classes such that c.name == "Person"
```

`exists` has no projection form; it always returns `true` or `false`.

## Operators

### Comparison

| Operator | Meaning |
|----------|---------|
| `==` | Equal |
| `!=` | Not equal |
| `<`, `>` | Less than, greater than |
| `<=`, `>=` | Less or equal, greater or equal |
| `is` | Type check |

### Logical

| Operator | Meaning |
|----------|---------|
| `and` | Logical AND |
| `or` | Logical OR |
| `not` | Logical NOT |
| `implies` | Logical implication (A implies B = not A or B) |

### Arithmetic

| Operator | Meaning |
|----------|---------|
| `+` | Addition (numbers) or concatenation (strings) |
| `-` | Subtraction |
| `*` | Multiplication |
| `/` | Division |

### Null handling

| Operator | Meaning |
|----------|---------|
| `??` | Null coalescing: returns left side if not null, otherwise right side |

```jjel title="JjEL"
c.description ?? "No description"
```

## Lambdas

Anonymous functions for use with collection methods:

```jjel title="JjEL"
// Single parameter
a => a.name

// In a filter
classes.filter(c => c.isAbstract)

// In a map
classes.map(c => c.name.toUpper())
```

The lambda body extends to the end of the expression:
```
a => a.name == "test" and a.isPublic
// Parses as: a => (a.name == "test" and a.isPublic)
```

## Collection methods

These methods are available on any collection (array) value:

| Method | Returns | Description |
|--------|---------|-------------|
| `.size` | Number | Number of elements |
| `.length` | Number | Same as `.size` |
| `.isEmpty` | Boolean | True if collection has no elements |
| `.first` | Element | First element |
| `.last` | Element | Last element |
| `.filter(predicate)` | Collection | Elements matching the predicate |
| `.map(projection)` | Collection | Transformed elements |

```jjel title="JjEL"
classes.filter(c => c.isAbstract).map(c => c.name)
classes.size
classes.isEmpty
```

## String methods

| Method | Returns | Description |
|--------|---------|-------------|
| `.toUpper()` | String | Uppercase |
| `.toLower()` | String | Lowercase |
| `.pascalCase()` | String | PascalCase conversion |
| `.length` | Number | Character count |

```jjel title="JjEL"
forall c in classes : c.name.toUpper()
forall c in classes : c.name.pascalCase()
```

## Conditional expressions

```
if <condition> then <value1> else <value2>
```

```
if c.isAbstract then "abstract" else "concrete"
```

## Object literals

JjEL supports inline object construction for projections:

```
forall c in classes : {name: c.name, attrCount: c.attributes.size}
```

Array literals are also supported:

```
[1, 2, 3]
["a", "b", "c"]
```

## Name resolution order

When JjEL encounters an unqualified identifier, it resolves in this order:

1. **Local variables** bound by `forall`, `exists`, or lambda parameters
2. **Implicit context properties** of the selected element (in Console: the active metamodel/model)
3. **Helper functions** registered in the evaluation context (in JjTL mode)
4. **Error** with suggestions for similar names

## Literals

| Type | Syntax | Example |
|------|--------|---------|
| String | Double quotes | `"hello"` |
| Integer | Digits | `42` |
| Decimal | Digits with dot | `3.14` |
| Boolean | Keywords | `true`, `false` |
| Null | Keyword | `null` |

## Console usage

The Console is the primary place to write and test JjEL expressions interactively. The evaluation context depends on which artifact is active:

```jjel title="JjEL Console"
// With metamodel active:
> classes
[State, namedElement, Transition, Event]

// With a different metamodel active:
> classes
[Entity, Attribute, Relationship]
```

The Console respects the active metamodel/model. Switching artifacts changes what `classes`, `enumerations`, and other built-in identifiers return.

:::tip[Testing expressions]
Use the Console to prototype JjEL expressions before using them in JjTL guards or JjScript. The immediate feedback loop makes it the fastest way to explore your model structure.
:::
