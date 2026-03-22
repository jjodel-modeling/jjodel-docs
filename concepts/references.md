# References

While attributes hold data values, **references** connect model objects to
other model objects. They are the backbone of any metamodel that describes
relationships between concepts.

## EReference

An **EReference** is a named directional link from one EClass to another.
Every reference has:

- **name** — the identifier used to navigate the link (`writtenBy`, `collection`)
- **eType** — the target EClass (the class being referenced)
- **lowerBound** / **upperBound** — how many target objects can be linked
- **containment** — whether this is a composition (true) or an association (false)

## Multiplicity

Multiplicity on a reference works the same way as on an attribute:

| lowerBound | upperBound | Meaning |
|------------|------------|---------|
| 0 | 1 | Optional link to at most one object |
| 1 | 1 | Required link to exactly one object |
| 0 | -1 | Link to zero or more objects (a collection) |
| 1 | -1 | Link to one or more objects |

A `writtenBy : Author [1..*]` reference on `Book` means every book must have
at least one author, and can have many.

## Composition vs Association

This is the most important distinction in Ecore references.

### Composition (containment)

A **containment reference** (`containment = true`) means the source object
*owns* the target objects. Contained objects:

- Cannot exist without their container
- Can only be contained by one parent at a time
- Are deleted when their container is deleted

```
Library ──contains──▶ Book   (containment)
```

A `Book` contained in a `Library` cannot simultaneously be contained in
another `Library`. If you delete the `Library`, all its `Book` instances
are deleted too.

Containment references form the **tree structure** of a model. Every
well-formed Ecore model is a tree of containment, with optional
cross-references layered on top.

### Association (non-containment)

A **non-containment reference** (`containment = false`) is a cross-reference
— it points to an object that is owned elsewhere in the containment tree.

```
Book ──writtenBy──▶ Author   (association)
```

Here `Author` objects are contained somewhere else (perhaps directly in a
`Library`), and `Book` simply holds a pointer to them. Deleting the `Book`
does not delete the `Author`.

### Practical rule

When modeling, ask: *"If I delete the source, should the target be deleted
too?"*

- Yes → containment
- No → association

A `Library` deleting its `Book`s: yes, containment.
A `Book` losing its `Author` when deleted: no, the `Author` still exists.

## Opposite references

Two references can be declared as **opposites** of each other. This creates
a bidirectional link that Ecore keeps synchronized automatically.

```
Book.writtenBy : Author [1..*]     opposite: authoredBooks
Author.authoredBooks : Book [0..*] opposite: writtenBy
```

When you add an `Author` to `book.writtenBy`, the system automatically adds
`book` to `author.authoredBooks`. You never have to maintain both sides
manually.

In Jjodel, you set the opposite in the Properties panel when a reference
is selected (Advanced mode).

## Derived references

Like attributes, references can be **derived** — computed from other
model elements rather than stored directly. A derived reference is read-only
and its value is defined via a JjEL expression.

For example, a derived reference `popularBooks : Book [0..*]` on `Library`
might return only books borrowed more than 10 times, computed from the
`Loan` objects in the model.

## In Jjodel

In the metamodel canvas:

- **Add a reference**: drag from the source class toward the target class,
  then choose the reference type from the menu that appears
- **Set multiplicity and containment**: select the reference edge and use
  the Properties panel
- **Set opposite**: Properties panel → Advanced mode → `eOpposite` field

Visual conventions in the canvas:

- **Containment references** are drawn with a filled diamond at the source end
- **Association references** are drawn with an open arrowhead
- **Derived references** are shown with a dashed line

In **Basic mode**, the Properties panel shows: name, target type, multiplicity
(as a friendly dropdown), and containment toggle.

In **Advanced mode**, the full Ecore properties are available: `eOpposite`,
`derived`, `transient`, `volatile`, `resolveProxies`, `changeable`.

## A complete example

```
Metamodel: Library System
─────────────────────────
Library
  └─ collection : Book [0..*]      containment ✓
  └─ staff : Librarian [0..*]      containment ✓

Book
  └─ writtenBy : Author [1..*]     containment ✗
  └─ loans : Loan [0..*]           containment ✓

Author
  └─ authoredBooks : Book [0..*]   containment ✗  (opposite of writtenBy)

Loan
  └─ borrower : Librarian [1]      containment ✗
```

The containment tree: `Library` owns `Book`s and `Librarian`s. `Book`s own
their `Loan`s. Authors exist independently (owned at the top level, not shown
here). Cross-references connect books to authors and loans to borrowers.

## Further reading

- [Classes and attributes](./classes-attributes.md) — the other half of metamodel structure
- [Metamodel vs Model](./metamodel-vs-model.md) — how references become links in models
- [Co-evolution](./co-evolution-theory.md) — what happens when references change
