---
title: Glossary
description: Definitions of key concepts in Model-Driven Engineering and Jjodel.
sidebar:
  order: 5
---

A reference of key terms used throughout the Jjodel documentation and in the broader field of Model-Driven Engineering (MDE).

---

**Abstract Syntax** — The formal structure of a modeling language, defining the valid element types, properties, and relationships independently of any visual or textual representation. In Jjodel, the abstract syntax is defined by the metamodel.

**Abstraction** — The process of reducing complexity by focusing on essential features and ignoring irrelevant details for a given purpose. Abstraction answers the question: "What matters about this thing for our purpose?"

**Blended Modeling** — An approach that combines visual (graphical) and textual representations of the same model, allowing users to switch between notations seamlessly.

**Classification** — The act of identifying and grouping domain concepts into types (classes) based on shared properties, behavior, or roles. Classification answers the question: "What kinds of things exist here?"

**Code Generation** — The automatic production of source code, configuration files, or documentation from model elements using generation viewpoints.

**Concrete Syntax** — The visual or textual notation used to represent abstract syntax elements. Defined in Jjodel through syntax viewpoints.

**Constraint** — A rule or condition that model elements must satisfy. Constraints are defined using JjEL or JavaScript and enforced through validation viewpoints.

**Containment Reference** — A reference between two classes where the target is *owned by* the source (composition semantics). Contained objects cannot exist independently of their container.

**DAttribute** — A typed property of a class in the metamodel. Examples: `name: String`, `age: Integer`.

**DClass** — A class definition in the Jjodel metamodel. Classes are the primary building blocks of any modeling language.

**DEnumeration** — A named set of symbolic values in the metamodel. Examples: `Status = {ON, OFF, STANDBY}`, `Cardinality = {OneToOne, OneToMany, ManyToMany}`.

**DModel** — The top-level container in the JjOM, holding packages or classes. Acts as the root of a model specification.

**Domain** — The body of knowledge, activity, or expertise that a system addresses. Domains exist independently of software.

**Domain Modeling** — The activity of capturing the structure and semantics of a specific domain through classification and abstraction. Domain modeling produces a metamodel.

**Domain-Specific Language (DSL)** — A formal, machine-processable interface to represent and manipulate domain knowledge. A DSL provides structure, enforces consistency, and enables automation within the context it models. Built using a meta-metamodel.

**DValue** — The concrete value assigned to an attribute or data field in the JjOM. Each DObject's DAttribute has one or more DValues (scalar or enumeration literal).

**DObject** — A runtime instance of a DClass. DObjects hold actual attribute values and reference targets.

**DPackage** — A container that groups related classes in the metamodel, similar to a namespace or module.

**DReference** — A relationship between two classes in the metamodel. Can be containment or non-containment, with configurable multiplicity.

**Edge** — A visual connection between two nodes in a diagram, typically representing a reference or association.

**EMF (Eclipse Modeling Framework)** — A widely-used Java-based metamodeling framework. Jjodel provides a cloud-native, reactive alternative to EMF.

**JjEL (Jjodel Expression Language)** — Jjodel's expression language for navigating models, accessing properties, and defining computed values.

**JjOM (Jjodel Object Model)** — The structured runtime framework that represents all modeling components in Jjodel, including models, metamodels, and viewpoints.

**JjTL (Jjodel Transformation Language)** — Jjodel's model-to-model transformation language for defining mappings between metamodels.

**Live Co-evolution** — Jjodel's ability to propagate metamodel changes instantly to all models, editors, and viewpoints without regeneration or redeployment.

**Metamodel** — A "model of models" that defines the structure, constraints, and rules of a modeling language. The metamodel is the abstract syntax.

**Meta-metamodel** — The language for building metamodels. It defines the available building blocks (Class, Attribute, Reference, Enumeration, Package) that you use to construct a metamodel. Jjodel's meta-metamodel is based on Ecore. Sits at level M3 in the MDE meta-level hierarchy.

**Model** — A structured representation of domain concepts, conforming to a metamodel.

**Model-Driven Engineering (MDE)** — A software development methodology that uses models as primary artifacts throughout the development lifecycle, emphasizing automation, abstraction, and separation of concerns.

**Multi-View Modeling** — The ability to visualize the same model through multiple viewpoints, each offering a different perspective.

**Node** — The visual representation of a model element on the canvas. Nodes have shape, position, size, color, and labels.

**Notation** — A formal language used to model domains. Examples: ER diagrams, UML class diagrams, BPMN. A notation is distinct from the domain it represents.

**Primitive Data Types** — The built-in types provided by Jjodel's meta-metamodel for attribute values: EString, EInt, EBoolean, EDouble, EFloat, ELong, EShort, EByte, EChar, EDate. Inherited from the Ecore type system.

**Projectional Editing** — An editing paradigm where the user manipulates a projection (view) of the abstract syntax tree, rather than text that is parsed into an AST.

**Reactive Architecture** — Jjodel's design principle where changes propagate automatically across all connected components in real time.

**Reflective Architecture** — The ability of a system to observe and modify its own structure at runtime. Jjodel uses reflection to synchronize metamodels, models, and viewpoints.

**State Attributes** — Computed states attached to JjOM nodes (data, node, view) that depend on the model structure and on other states. Analogous to synthesized and inherited attributes in classical attribute grammars. The Jjodel runtime evaluates them incrementally.

**Topological Notation** — A visual notation where meaning is encoded in connectivity (which elements are connected by edges). Layout is irrelevant; moving or resizing elements does not change the model's meaning. ER diagrams and UML class diagrams are topological.

**Layout-Sensitive Notation** — A visual notation where the spatial position of elements carries semantic meaning. Moving an element to a different position changes the model's semantics. Examples: railway track plans, PCB layouts, algebraic formulas. Jjodel supports these through its node submodel.

**Event-Condition-Action (ECA)** — The rule-based execution model used in Jjodel viewpoints. An event triggers the rule, a condition checks whether it should fire, and an action executes when the condition holds. ECA rules are attached to events in views.

**Viewpoint** — A configurable perspective on a model, defining how elements are rendered, validated, or transformed. Jjodel supports syntax, validation, and generation viewpoints.

**Workbench** — A complete environment for defining and using a modeling language, typically comprising a metamodel, concrete syntax definitions, validators, and code generators.
