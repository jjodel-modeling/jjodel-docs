# Metamodel vs Model

The distinction between a metamodel and a model is one of the most important
concepts in Model-Driven Engineering — and one of the most frequently confused.
This page clarifies the difference with concrete examples.

## The short version

| | Metamodel | Model |
|---|---|---|
| **Defines** | The language | An instance of the language |
| **Contains** | Classes, attributes, references | Objects, values, links |
| **Role** | Grammar | Sentence |
| **Conforms to** | A meta-metamodel (e.g. MOF) | Its metamodel |

A metamodel is to a model what a grammar is to a sentence, or what a database
schema is to a table row.

## A concrete example

Suppose you want to model a library system. You start by defining the
**metamodel** — the concepts and relationships that exist in this domain:

```
Metamodel: Library System Language
─────────────────────────────────
Class: Book
  - title : String
  - year  : Integer

Class: Author
  - name  : String

Class: Library
  - name  : String

Reference: Book → Author   (name: writtenBy, multiplicity: 1..*)
Reference: Library → Book  (name: collection, multiplicity: 0..*)
```

This metamodel says: "in this language, you can describe libraries that contain
books, and books that have authors."

Now you can create a **model** — a specific instance of this language:

```
Model: My Library
─────────────────
book1 : Book       { title: "Gödel, Escher, Bach", year: 1979 }
book2 : Book       { title: "The Society of Mind",  year: 1986 }

author1 : Author   { name: "Douglas Hofstadter" }
author2 : Author   { name: "Marvin Minsky" }

lib1 : Library     { name: "Room 101" }

book1.writtenBy    → author1
book2.writtenBy    → author2
lib1.collection    → book1, book2
```

The model conforms to the metamodel: every object is an instance of a class
defined in the metamodel, every link follows a reference defined there, and
every attribute has a value of the declared type.

## The same thing, one level up

The relationship between metamodel and model repeats at every level.

Your metamodel (the Library System Language) is itself a model — a model of the
language. It conforms to a *meta-metamodel* that defines what "Class",
"Attribute", and "Reference" mean. In most MDE tools, this meta-metamodel is
**MOF** (Meta-Object Facility) or its practical implementation **Ecore** (from
the Eclipse Modeling Framework).

```
MOF / Ecore          ← meta-metamodel  (M3)
       ↑ conforms to
Library System Language  ← metamodel   (M2)
       ↑ conforms to
My Library           ← model           (M1)
       ↑ represented by
Actual books on shelves  ← reality     (M0)
```

## Why the distinction matters

**Validation**: a model can be checked for correctness against its metamodel.
If your metamodel says `year` is an Integer, a model with `year: "nineteen
eighty"` is invalid.

**Reuse**: one metamodel can have many models. The Library System Language can
describe hundreds of different library collections — all sharing the same
structure.

**Evolution**: when the metamodel changes, all its models are potentially
affected. This is the problem of *co-evolution* — Jjodel handles it live, as
you edit.

**Transformation**: a transformation maps models from one metamodel to models
of another. "Convert a Library model into a Catalog model" is a well-defined
operation precisely because both metamodels exist explicitly.

## In Jjodel

In Jjodel, you work with both levels simultaneously:

- The **metamodel editor** (canvas in metamodel mode) is where you define
  classes, attributes, and references — you are working at M2.
- The **model editor** (canvas in model mode) is where you create instances —
  you are working at M1.

When you open the model canvas, the palette on the left shows the classes from
your metamodel. Dragging a class into the canvas creates an *instance* of that
class — a model object that conforms to the definition you wrote.

## Further reading

- [What is MDE?](./what-is-mde.md) — the broader context
- [The modeling layers](./modeling-layers.md) — M0 through M3 in depth
- [Classes and attributes](./classes-attributes.md) — how to define them in Jjodel
- [References](./references.md) — composition, association, multiplicity
