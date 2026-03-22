# The Modeling Layers

MDE organizes modeling artifacts into a stack of layers, each *conforming to*
the one above it. Understanding this stack clarifies what a metamodel is, why
meta-metamodels exist, and where Jjodel sits in the picture.

## The four layers

| Layer | Name | Role | Example |
|-------|------|------|---------|
| M3 | Meta-metamodel | Defines the language for writing metamodels | MOF, Ecore |
| M2 | Metamodel | Defines a modeling language | Library System Language |
| M1 | Model | A specific system described in that language | My Library |
| M0 | Reality | The actual running system or real-world entities | Books on a shelf |

Each layer answers a different question:

- **M3** — what concepts can a metamodel contain? (Class, Attribute, Reference…)
- **M2** — what concepts exist in this domain? (Book, Author, Library…)
- **M1** — what specific things exist in this instance? (book1, author1…)
- **M0** — what exists in the real world or running system?

## Conformance

The key relationship between layers is **conformsTo**: every model conforms to
its metamodel, and every metamodel conforms to the meta-metamodel.

```
Ecore (M3)
  ↑ conforms to
Library System Language (M2)   — your metamodel, defined in Jjodel
  ↑ conforms to
My Library (M1)                — your model, instances of the metamodel
  ↑ represents
Books on a shelf (M0)          — reality
```

Conformance means: every element at one level is an instance of some element
at the level above. A `book1 : Book` in your model (M1) is an instance of the
class `Book` defined in your metamodel (M2). The class `Book` in your metamodel
is itself an instance of `EClass` defined in Ecore (M3).

## MOF, EMOF, and Ecore

The theoretical foundation for this layering comes from the **Meta-Object
Facility (MOF)**, a standard defined by the Object Management Group (OMG).
MOF specifies how metamodels should be structured and how conformance works.

In practice, few tools implement full MOF. Most use simpler variants:

- **EMOF** (Essential MOF) — a lightweight subset of MOF, standardized by OMG,
  covering the core concepts without the more complex reflection mechanisms
- **Ecore** — the practical implementation of EMOF used by the Eclipse Modeling
  Framework (EMF). Ecore is the de facto standard for metamodeling in academic
  and industrial MDE tools

Jjodel uses **Ecore** as its meta-metamodel. When you define a class in Jjodel,
you are creating an instance of `EClass`. When you add an attribute, you create
an `EAttribute`. When you draw a reference, you create an `EReference`.

For everyday modeling work, the distinction between MOF, EMOF, and Ecore rarely
matters. What matters is the conformance relationship and the layering — those
are identical across all three.

## A self-describing system

One elegant property of this architecture: Ecore describes itself. The Ecore
metamodel is itself an Ecore model — it conforms to itself at M3. This
*reflexivity* is what allows the layer stack to close at the top without
requiring an infinite regression of meta-levels.

This is the same principle behind programming languages that are implemented
in themselves (a C compiler written in C, a Lisp interpreter written in Lisp).
For MDE tools, it means the meta-metamodel does not need special treatment —
it is just another model.

## In Jjodel

When you work in Jjodel:

- You operate primarily at **M2** (defining metamodels) and **M1** (creating
  models that conform to them)
- Jjodel itself operates at **M3** — it knows about `EClass`, `EAttribute`,
  `EReference` and uses them to interpret your metamodels
- The **Properties panel** shows you the Ecore properties of whatever you have
  selected — you are directly editing M2 artifacts

You do not need to think about M3 during normal use. But understanding that
it exists explains why the Properties panel shows specific fields (like
`eType`, `lowerBound`, `upperBound`) that come directly from the Ecore
specification.

## Further reading

- [What is MDE?](./what-is-mde.md) — the broader context
- [Metamodel vs Model](./metamodel-vs-model.md) — the M2/M1 distinction in depth
- [Classes and attributes](./classes-attributes.md) — EClass, EAttribute in Jjodel
- [References](./references.md) — EReference, composition, multiplicity
