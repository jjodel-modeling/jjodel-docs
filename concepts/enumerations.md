# Enumerations

An **enumeration** (EEnum in Ecore) defines a data type whose values are
restricted to a fixed set of named literals. Instead of using a free-form
`EString` attribute, an enumeration guarantees that only valid, predefined
values can appear in a model.

## When to use an enumeration

Use an enumeration when:

- The set of valid values is **known and finite** at metamodel design time
- Values have **domain meaning** beyond their string representation
- You want **validation** to reject any value outside the defined set

Examples:

```
EEnum: Status       → AVAILABLE, BORROWED, RESERVED, LOST
EEnum: Visibility   → PUBLIC, PRIVATE, PROTECTED, PACKAGE
EEnum: Direction    → NORTH, SOUTH, EAST, WEST
EEnum: Priority     → LOW, MEDIUM, HIGH, CRITICAL
```

## Structure

An enumeration has two parts:

**EEnum** — the enumeration type itself, defined at the package level.
It has a name and contains one or more literals.

**EEnumLiteral** — each individual value within the enumeration.
Every literal has:
- **name** — the identifier used in models and expressions (`AVAILABLE`)
- **value** — an optional integer code (0, 1, 2...) used for serialization
- **literal** — an optional alternative string representation

## Defining an enumeration in Jjodel

1. Drag **Enumeration** from the palette onto the canvas
2. Double-click the name to rename it (e.g. `Status`)
3. Drag **Literal** from the palette onto the enumeration node to add values
4. Double-click each literal to rename it (`AVAILABLE`, `BORROWED`, etc.)

The enumeration appears in the canvas as a separate node, visually distinct
from classes.

## Using an enumeration as an attribute type

Once defined, an enumeration can be used as the `eType` of any `EAttribute`:

```
Class: Book
  - status : Status    ← type is the EEnum, not EString
```

In the Properties panel, when you set the type of an attribute, your
enumerations appear in the type dropdown alongside the built-in Ecore
data types (`EString`, `EInt`, etc.).

## Enumerations vs EString

| | EEnum | EString |
|---|---|---|
| Valid values | Fixed set only | Any string |
| Validation | Automatic | Manual (via JjEL constraint) |
| Refactoring | Rename literal → all references update | Rename → find/replace manually |
| Readability | Self-documenting | Opaque |

Prefer EEnum whenever the valid values are known upfront. Reserve EString
for genuinely open-ended text.

## Enumerations vs boolean attributes

An `EBoolean` is essentially a two-literal enumeration (`true`/`false`).
When a concept has exactly two states, `EBoolean` is simpler. When the
states have domain-specific names or there are more than two, use EEnum:

```
// Instead of:
isActive : EBoolean

// Prefer:
EEnum: AccountStatus → ACTIVE, SUSPENDED, CLOSED
status : AccountStatus
```

## Default values

An `EEnumLiteral` can be set as the **default** for the attribute. If a
model object is created without explicitly setting the attribute, it will
have the default literal value. Set the default in the Properties panel
when the attribute is selected.

## In Jjodel

- Enumerations are defined at the **package level**, not inside a class
- They appear in the canvas as separate nodes alongside classes
- The palette shows `Enumeration` under **CLASSIFIERS** and
  `Literal` under **MEMBERS**
- An enumeration selected in the canvas shows its literals in the
  Properties panel — you can add, rename, and reorder them there

## Further reading

- [Classes and attributes](./classes-attributes.md) — EAttribute, types, multiplicity
- [References](./references.md) — when to use a reference instead of an enum
