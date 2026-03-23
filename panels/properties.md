# Properties Panel

The Properties panel shows the editable properties of the element currently
selected in the canvas. Its content changes depending on what is selected —
a class, an attribute, a reference, or a model object.

## Class properties

When a class is selected, the panel is organized into three sections.

### General

**Name** (required) — the identifier of the class within the metamodel.
Must be unique within the package. By convention, class names use
UpperCamelCase (`Book`, `LibraryMember`, `AbstractVehicle`).

### Inheritance

**Abstract** — when enabled, the class cannot be instantiated directly.
Use abstract classes to define shared structure that other classes extend.
A model cannot contain objects of an abstract class — only of its concrete
subclasses.

**Interface** — marks the class as an interface. Interfaces define structure
without implementation and support multiple inheritance. A class can implement
multiple interfaces but extend only one superclass.

> **Abstract vs Interface**: use Abstract when you have shared behavior to
> inherit; use Interface when you want to define a contract that multiple
> unrelated classes can satisfy.

### Flags

**Final** — prevents other classes from extending this class. Use when the
class is a leaf in the hierarchy and should not be subclassed.

**Singleton** — only one instance of this class can exist in a model.
Useful for system-wide concepts like a `Configuration` or `Registry` object.

**Rootable** — this class can be the root of the containment tree.
In a well-formed model, exactly one object is the root — typically enabled
on the top-level container class (e.g. `Library`, `System`, `Project`).
Rootable is on by default for new classes.

**Partial** — the class is incomplete by design. Partial classes can have
missing required values without triggering validation errors. Useful during
incremental model construction.

---

## Advanced mode

In Advanced mode, two additional options appear:

**Allow cross-extend** *(Inheritance section)* — enables the class to be
extended by classes defined in other packages. Off by default; enable when
building extensible metamodels intended to be composed with others.

**Advanced State** *(collapsed section)* — exposes low-level Ecore properties
for expert users: `instanceClassName`, `instanceTypeName`, and serialization
settings. These are rarely needed in normal metamodeling work.

---

## Other elements

The Properties panel adapts to whatever is selected:

- **Attribute selected** → shows name, type, multiplicity, default value,
  derived flag, and (in Advanced mode) full Ecore structural feature properties
- **Reference selected** → shows name, target type, multiplicity, containment
  toggle, opposite reference, and (in Advanced mode) `resolveProxies`,
  `transient`, `volatile`
- **Model object selected** → shows the object's attribute values, editable
  inline
- **Nothing selected** → the panel shows package-level properties

---

## Tips

- The **breadcrumb** at the top of the panel (`metamodel_1 › package › Person`)
  shows where the selected element lives in the model tree. Click any segment
  to navigate up.
- The **CLASS badge** in the top-right corner shows the element type at a glance.
- Sections can be **collapsed** by clicking their header — useful when working
  on a small screen.

---

## Further reading

- [Classes and attributes](../concepts/classes-attributes.md) — what Abstract,
  Interface, and EClass mean in Ecore
- [References](../concepts/references.md) — containment, multiplicity, opposite
