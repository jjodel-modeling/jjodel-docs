# Classes and Attributes

In Jjodel — and in Ecore more generally — a metamodel is built from a small
set of core concepts. Classes and attributes are the two most fundamental.

## EClass

An **EClass** represents a concept in your domain. It is the metamodel
equivalent of a class in object-oriented programming, or a table in a
relational database.

Examples of EClasses in a library metamodel:

```
Book
Author
Library
Loan
```

Every object in a model that conforms to this metamodel will be an instance
of one of these classes.

### Abstract classes

An EClass can be marked **abstract**. An abstract class cannot be instantiated
directly — no model object can be of type `AbstractClass`. It exists only to
be extended by other classes, serving as a shared base that groups common
attributes and references.

```
AbstractNamedElement  (abstract)
  ↑ extends
  ├── Book
  └── Author
```

If `AbstractNamedElement` has a `name : String` attribute, both `Book` and
`Author` inherit it without you having to define it twice.

### Interfaces

EClass also supports an **interface** flag. An interface is like an abstract
class but intended for multiple inheritance — a class can implement multiple
interfaces but can only extend one concrete superclass. Interfaces carry no
implementation, only structure.

In Jjodel, abstract classes and interfaces are both available in the
Properties panel when a class is selected.

### Inheritance

One EClass can extend another using the **eSuperTypes** relationship. This
creates an inheritance hierarchy:

```
Animal (abstract)
  ↑ extends
  ├── Mammal (abstract)
  │     ↑ extends
  │     ├── Dog
  │     └── Cat
  └── Bird
```

A model object of type `Dog` is also a valid `Mammal` and a valid `Animal`.
This matters for references with a broad type — a reference typed `Animal`
can hold instances of `Dog`, `Cat`, or `Bird`.

## EAttribute

An **EAttribute** is a named property of an EClass that holds a data value.
Every attribute has:

- **name** — the identifier used to access the value (`title`, `year`, `price`)
- **eType** — the data type of the value
- **lowerBound** — minimum number of values (0 = optional, 1 = required)
- **upperBound** — maximum number of values (1 = single, -1 = many)

### Data types

Ecore provides a set of built-in data types for attributes:

| EDataType | Description | Example values |
|-----------|-------------|----------------|
| `EString` | Text | `"Jjodel"`, `"hello"` |
| `EInt` | Integer number | `42`, `-7`, `0` |
| `EDouble` | Floating point number | `3.14`, `-0.5` |
| `EBoolean` | True or false | `true`, `false` |
| `ELong` | Large integer | `9999999999` |
| `EFloat` | Single precision float | `1.5` |
| `EChar` | Single character | `'A'` |
| `EByte` | Byte value | `127` |
| `EDate` | Date and time | ISO date string |

You can also define custom data types (EDataType) for domain-specific values,
or use EEnum for attributes that accept a fixed set of named values.

### EEnum

An **EEnum** is a special data type that defines a fixed set of literals.
For example:

```
EEnum: Status
  literals: AVAILABLE, BORROWED, RESERVED, LOST
```

An attribute `status : Status` can only hold one of these four values.
EEnums are defined at the package level and reused across multiple classes.

### Multiplicity

By default, an attribute holds exactly one value (`lowerBound = 1`,
`upperBound = 1`). Changing the bounds allows:

| lowerBound | upperBound | Meaning |
|------------|------------|---------|
| 0 | 1 | Optional — zero or one value |
| 1 | 1 | Required — exactly one value (default) |
| 0 | -1 | Zero or more values (a list) |
| 1 | -1 | One or more values (a non-empty list) |

A `tags : EString [0..*]` attribute on `Book` would allow a book to have
zero or more string tags.

### Derived attributes

An attribute can be marked **derived**, meaning its value is computed from
other values rather than stored directly. Derived attributes are read-only
in the model and their computation is defined via JjEL expressions in Jjodel.

For example, a `fullName : EString` attribute on `Author` might be derived
as `firstName + " " + lastName`.

## In Jjodel

In the metamodel canvas:

- **Add a class**: drag from the palette or use the context menu on the canvas
- **Rename**: double-click the class name inline
- **Add an attribute**: drag from the palette onto a class, or use the context
  menu on the class node
- **Set type and multiplicity**: select the attribute and use the Properties
  panel

In **Basic mode**, the Properties panel shows the most common settings: name,
type, and whether the attribute is required or optional.

In **Advanced mode**, the full Ecore properties are exposed: `lowerBound`,
`upperBound`, `derived`, `transient`, `volatile`, `changeable`, and more.

## Further reading

- [References](./references.md) — EReference, composition, multiplicity
- [Modeling layers](./modeling-layers.md) — where EClass lives in the M2/M3 stack
- [JjEL](../reference/jjel/overview.md) — expressions for derived attributes
