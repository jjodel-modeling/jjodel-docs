---
title: JjEL Reference
description: Complete reference for the Jjodel Expression Language.
sidebar:
  badge:
    text: "3.0"
    variant: default
    class: version-3-0
  order: 2
---

JjEL (Jjodel Expression Language) is a declarative language for navigating models, querying elements, and computing values. You use it in the Console, in JjTL guards and mappings, and inside JjScript expressions.

Available since Jjodel 3.0.

JjEL is side-effect-free: expressions read data but never modify it. If you need to create or modify model elements, use JjScript.

## Where JjEL is used

| Context | Example |
|---------|---------|
| Console (JjEL mode) | `forall c in classes : c.name` |
| JjTL guards | `where { not isAbstract and attributes.isNotEmpty }` |
| JjTL mappings | `tableName := name.snakeCase()` |
| JjScript | `eval forall c in classes such that c.isAbstract : c.name` |

Line comments start with `--`:

```jjel title="JjEL"
-- names of all abstract classes
forall c in classes such that c.isAbstract : c.name
```

## Context identifiers

The identifiers available to an expression depend on where it runs. In the Console, the evaluation context binds the active metamodel and model:

| Identifier | Returns |
|------------|---------|
| `classes` | All classes in the active metamodel |
| `attributes` | All attributes in the active metamodel |
| `references` | All references in the active metamodel |
| `enumerations` | All enumerations in the active metamodel |
| `packages` | All packages in the active metamodel |
| `instances` | All instances in the active model(s) |
| `metamodel`, `project` | The active metamodel and the current project |
| `data`, `node` | The selected element and its layout node |

Classes are also bound by name (`Person.attributes`), and instance names resolve directly when unambiguous. In JjTL rules, the matched source element is the implicit context instead: its properties are accessed unqualified.

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

`forall` is the fundamental construct of JjEL. It has set-theoretic semantics: it selects and optionally transforms elements from a collection.

**Syntax:**
```
forall <variable> in <collection> [such that <filter>] [: <projection>]
```

The two separators have distinct roles: `such that` introduces a boolean filter, `:` introduces a value projection. They are not synonyms.

| Form | Returns |
|------|---------|
| `forall x in S such that P` | The elements where P is true |
| `forall x in S : expr` | Each element transformed by expr |
| `forall x in S such that P : expr` | Filter, then transform |

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

// Chain collection methods on the result
(forall a in attributes such that a.isPublic : a.salary).sum()
```

In JjTL context, `forall` also accepts a `do` clause that executes an imperative action per element. The `do` form does not exist in pure JjEL.

## Existence: exists

`exists` checks whether at least one element in a collection satisfies a condition. Returns a boolean.

**Syntax:**
```
exists <variable> in <collection> such that <predicate>
exists <variable> in <collection> | <predicate>
```

`|` is a shorthand for `such that`. The `:` separator is not accepted for `exists`; it is reserved for `forall` projections, which keeps nested expressions unambiguous:

```jjel title="JjEL"
// Does any class have attributes?
exists c in classes | c.attributes.size > 0

// Is there a class named "Person"?
exists c in classes such that c.name == "Person"

// Nested inside a forall
forall c in classes | (exists a in c.attributes | a.isPublic) : c.name
```

`exists x in S | P` is equivalent to `(forall x in S such that P).isNotEmpty`.

## Context binding: with...do

`with...do` establishes a context object whose properties are directly accessible in the body. It is the standard way to give a Console expression an explicit subject:

```jjel title="JjEL"
with data do name.pascalCase()

with data do forall a in attributes such that a.isPublic : a.name

-- nested
with data do
  with attributes.first do name + ": " + type
```

Property lookup in the body checks the `with` context first, then the enclosing scope.

## Conditional expressions

```
if <condition> then <value1> [else <value2>]
```

If `else` is omitted, the expression returns `null` when the condition is false.

```jjel title="JjEL"
if c.isAbstract then "abstract" else "concrete"
(if attributes.size > 5 then "tbl_" else "") + name.snakeCase()
```

## Lambdas

Anonymous functions, used with collection methods that need a function argument (`sortBy`, `groupBy`, `filter`, ...):

```jjel title="JjEL"
classes.filter(c => c.isAbstract)
classes.sortBy(c => c.name)
(forall a in attributes : a.type).groupBy(t => t)
```

The lambda body extends to the end of the expression:
```
a => a.name == "test" and a.isPublic
// Parses as: a => (a.name == "test" and a.isPublic)
```

For plain filtering and mapping, `forall` usually reads better than `filter`/`map`; the methods remain available for chaining.

## Operators

### Comparison

| Operator | Meaning |
|----------|---------|
| `==` | Equal (deep equality for arrays and objects) |
| `!=` | Not equal |
| `<`, `>` | Less than, greater than |
| `<=`, `>=` | Less or equal, greater or equal |
| `is` | Type check |

### Logical

| Operator | Meaning |
|----------|---------|
| `and` | Logical AND (short-circuit) |
| `or` | Logical OR (short-circuit) |
| `not` | Logical NOT |
| `implies` | Logical implication (`P implies Q` = `not P or Q`) |

`implies` reads like natural language and is the idiomatic form for constraints:

```jjel title="JjEL"
isAbstract implies subClasses.isNotEmpty
a.isPublic implies a.type != null
```

### Arithmetic

| Operator | Meaning |
|----------|---------|
| `+` | Addition, string concatenation, or array concatenation |
| `-` | Subtraction |
| `*` | Multiplication, or string repetition (`"ab" * 3` is `"ababab"`) |
| `/` | Division (`null` on division by zero) |
| `%` | Modulo |

### Null-safe navigation

| Operator | Behavior |
|----------|----------|
| `?.` | Returns `null` if the left side is null, instead of raising an error |
| `??` | Returns the right side if the left side is null |

```jjel title="JjEL"
parent?.name                     -- null if parent is null
parent?.name ?? "no parent"
element?.container?.package?.name ?? "default"
```

### Type checking

```jjel title="JjEL"
element is DClass
value is String
```

`is` checks type membership including subtypes. Primitive aliases are accepted (`EString`/`String`, `EInt`/`Integer`, `EBoolean`/`Boolean`, `Array`/`List`/`Collection`).

### Index access

```jjel title="JjEL"
attributes[0]                    -- first attribute
attributes[attributes.size - 1]  -- last attribute
```

Equivalent to `.at(index)`.

## Evaluation rules

**Truthiness.** `null`, `false`, `0`, `""`, and `[]` are falsy; everything else is truthy.

**Identifier resolution order:** built-in functions, then `with` context properties, then the implicit source (in JjTL), then scope variables. An undefined identifier evaluates to `null`.

**Error handling:**

| Situation | Behavior |
|-----------|----------|
| Undefined variable | `null` (silent) |
| Property not found | `null`, with a console warning and typo suggestions |
| Method not found | Error with suggestions |
| `.property` on `null` | Error (use `?.` instead) |
| `?.property` on `null` | `null` (silent) |
| Division by zero, type mismatch | `null` (silent) |

## Built-in method library

JjEL ships with more than one hundred built-in methods, organized in four groups. Autocompletion in the Console and in the editors shows signatures inline.

### Collection methods

| Group | Methods |
|-------|---------|
| Aggregation | `sum()`, `avg()`, `min()`, `max()`, `count()` |
| Access | `first`, `last`, `at(i)`, `indexOf(item)` |
| Info | `size`, `length`, `isEmpty`, `isNotEmpty`, `contains(item)` |
| Structure | `distinct()`, `distinctBy(fn)`, `sortBy(fn)`, `sortByDescending(fn)`, `reverse()`, `flatten()`, `flatMap(fn)`, `groupBy(fn)` |
| Slicing | `take(n)`, `skip(n)`, `takeWhile(fn)`, `skipWhile(fn)` |
| Boolean | `all(fn)`, `any(fn)`, `none(fn)` |
| Other | `join(separator)`, `filter(fn)`, `map(fn)` |

```jjel title="JjEL"
(forall c in classes : c.name).distinct().size == classes.size
(forall c in classes : c.attributes.size).avg()
classes.sortBy(c => c.name).take(5)
```

### String methods

| Group | Methods |
|-------|---------|
| Case | `toUpper()`, `toLower()`, `capitalize()`, `uncapitalize()` |
| Naming | `camelCase()`, `pascalCase()`, `snakeCase()`, `kebabCase()` |
| Whitespace | `trim()`, `trimStart()`, `trimEnd()`, `padStart(n, ch)`, `padEnd(n, ch)` |
| Search | `contains(s)`, `startsWith(s)`, `endsWith(s)`, `indexOf(s)`, `lastIndexOf(s)`, `matches(regex)` |
| Transform | `replace(a, b)`, `replaceAll(a, b)`, `substring(i, j?)`, `slice(i, j?)`, `split(sep)`, `repeat(n)`, `reverse()` |
| Info | `length`, `isEmpty`, `isNotEmpty`, `isBlank`, `isNotBlank`, `charAt(i)` |
| Conversion | `toNumber()`, `toInt()`, `quote()`, `format(pattern)` |

### Number methods

| Group | Methods |
|-------|---------|
| Math | `abs()`, `round()`, `floor()`, `ceil()`, `trunc()`, `sign()`, `sqrt()`, `pow(e)`, `exp()`, `log()`, `log10()`, `log2()` |
| Trigonometry | `sin()`, `cos()`, `tan()`, `asin()`, `acos()`, `atan()` |
| Format | `toFixed(d)`, `toPrecision(d)`, `toExponential(d)`, `toString()`, `toHex()`, `toBinary()`, `toOctal()` |
| Check | `isInteger()`, `isFinite()`, `isNaN()`, `isPositive()`, `isNegative()`, `isZero()` |
| Range | `clamp(min, max)`, `between(min, max)`, `mod(d)`, `div(d)` |

### Date methods

Dates are ISO 8601 strings. Constructors: `now()`, `today()`, `date(y, m, d)`, `datetime(y, m, d, h, min, s)`, `parseDate(str)`.

| Group | Methods |
|-------|---------|
| Accessors | `year()`, `month()`, `day()`, `hour()`, `minute()`, `second()`, `dayOfWeek()`, `dayOfYear()`, `weekOfYear()`, `quarter()` |
| Predicates | `isLeapYear()`, `daysInMonth()`, `isBefore(d)`, `isAfter(d)`, `isSameDay(d)` |
| Arithmetic | `addDays(n)`, `addMonths(n)`, `addYears(n)`, `addHours(n)`, `addMinutes(n)`, `addSeconds(n)` |
| Boundaries | `startOfDay()`, `endOfDay()`, `startOfMonth()`, `endOfMonth()`, `startOfYear()`, `endOfYear()` |
| Differences | `diffDays(d)`, `diffMonths(d)`, `diffYears(d)` |
| Format | `timestamp()`, `toISOString()`, `toDateString()`, `toTimeString()`, `format(pattern)` |

## Object and array literals

JjEL supports inline object construction for projections:

```
forall c in classes : {name: c.name, attrCount: c.attributes.size}
```

Array literals are also supported:

```
[1, 2, 3]
["a", "b", "c"]
```

## Literals

| Type | Syntax | Example |
|------|--------|---------|
| String | Double quotes | `"hello"` |
| Integer | Digits | `42` |
| Decimal | Digits with dot | `3.14` |
| Boolean | Keywords | `true`, `false` |
| Null | Keyword | `null` |

## Console usage

The Console's JjEL mode is the primary place to write and test expressions interactively (see [Console](../../user-guide/console) for modes and switching). The evaluation context follows the active artifact:

```jjel title="JjEL Console"
// With metamodel active:
> classes
[State, namedElement, Transition, Event]

// With a different metamodel active:
> classes
[Entity, Attribute, Relationship]
```

:::tip[Testing expressions]
Use the Console to prototype JjEL expressions before using them in JjTL guards or JjScript. The immediate feedback loop makes it the fastest way to explore your model structure.
:::
