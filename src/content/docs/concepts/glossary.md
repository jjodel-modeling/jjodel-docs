---
title: Glossary
description: Definitions of key terms used throughout the Jjodel documentation.
sidebar:
  order: 5
  label: Glossary
---

**Abstraction** -- The cognitive operation of removing irrelevant detail from a concept to focus on its essential properties. In metamodeling, abstraction produces metaclasses that capture only the domain-relevant aspects of real-world things.

**Abstract Syntax** -- The set of valid model structures defined by a metamodel. The abstract syntax specifies what elements exist and how they relate, independent of any visual or textual representation. In the language tuple, this is A.

**Classification** -- The cognitive operation of grouping individual things into categories based on shared properties. Classification produces metaclasses from observed instances. First formalized in Simula (1967).

**Compartment** -- The region of a node that lists the feature rows of an instance. A view decides whether the compartment renders inline, in a popover, or not at all, how many columns it uses, and what happens to empty slots.

**Concrete Syntax** -- The visual or textual representation of model elements. Boxes, arrows, labels, and colors are concrete syntax. The same abstract syntax can have multiple concrete syntaxes (e.g., Chen vs crow's foot for ER diagrams). In the language tuple, this is C.

**Conformance** -- The relationship between a model (M1) and its metamodel (M2). A model conforms to a metamodel if every element is a valid instance of a metaclass and all constraints are satisfied.

**Console** -- The floating window that runs Jjodie, JjScript, and JjEL from one prompt, plus a JavaScript flavor over the JjOM. The active mode is a chip in its header.

**Containment** -- A reference that owns its target. A contained element belongs to exactly one parent and cannot exist without it; in the metamodel editor this is the Composition flag on the reference, as opposed to Aggregation, which shares the target.

**Control** -- A JSX component available in the Model view template. Controls create workbench-level parameter panels with Slider and Toggle widgets. Control values are stored in the node and accessible to templates and ECA rules.

**Custom Event Action** -- A named JavaScript function defined in a view's Events tab. Custom actions can be called from template elements (e.g., button onClick handlers). They enable model manipulation logic triggered by user interaction, such as simulation step execution.

**Data Manager** -- The table and form view of a model. It lists the instances of one metaclass at a time and lets you create, edit, and delete them without a diagram and without a viewpoint.

**DAttribute** -- A JjOM construct representing a typed property of a DClass. Attributes hold values of primitive data types (EString, EInt, EBoolean, etc.) or enumerations.

**DClass** -- A JjOM construct representing a metaclass. DClasses define the structure of model elements: their attributes, references, and containment relationships.

**Decoration View** -- A view in an overlay viewpoint that modifies the visual appearance of elements without replacing their template. Typically style-only: the overlay's style layers on top of the active exclusive viewpoint's rendering.

**DEnumeration** -- A JjOM construct representing a fixed set of named values. Used for attributes with a closed set of options (e.g., Visibility: public, private, protected).

**DModel** -- The top-level container in the JjOM. A DModel holds the complete state of a project, including all metamodels, models, notations, and viewpoints.

**Domain** -- The area of knowledge a modeling language targets. The domain determines what concepts the metamodel captures. Examples: relational data modeling (ER diagrams), reactive behavior (state machines), software structure (class diagrams).

**Domain Modeling** -- The process of analyzing a domain, identifying its concepts and relationships, and encoding them as a metamodel.

**DReference** -- A JjOM construct representing a relationship between two DClasses. References have a name, a target type, and multiplicity bounds (lower and upper).

**DSL** (Domain-Specific Language) -- A formal, machine-processable interface to domain knowledge. A DSL restricts its vocabulary to a specific domain, making it more expressive and less error-prone within that domain than a general-purpose language.

**DValue** -- A JjOM construct representing a concrete value held by an attribute at the model level (M1). The runtime counterpart of a DAttribute definition.

**ECA** (Event-Condition-Action) -- The behavioral model used in Jjodel viewpoints. When an event occurs (e.g., `onDataUpdate`), a condition is evaluated, and if true, an action executes. Used for validation rules, computed attributes, and state machine simulation.

**Exclusive Viewpoint** -- A viewpoint of type Syntax. Only one exclusive viewpoint can be active at a time: activating one deactivates the previous. Exclusivity follows from the type chosen at creation, not from a separate flag. See also: Overlay Viewpoint.

**Instance** -- A model element (M1) that is an instanceOf a metaclass (M2). An instance has concrete attribute values and participates in references defined by its metaclass.

**IR Authoring** -- The declarative way of describing a view, introduced in 3.0. Instead of a JSX template, the view is a structured record (kind, symbol, structure, form) that Jjodel's interpreter renders. Enabling it on a view switches the rendering of the instances it matches.

**ISO/IEC/IEEE 42010** -- The international standard for architecture description. Defines viewpoints as specifications of concerns and views as their realization. Jjodel's multi-view modeling follows this framework.

**JjEL** (Jjodel Expression Language) -- The expression language used for predicates, conditions, and queries over models.

**Jjodie** -- The AI assistant. It answers questions about MDE, Jjodel, and your models, and turns editing requests into JjScript blocks you run yourself. The provider is configured in Settings. See [AI in Jjodel](../../ai/overview).

**JjOM** (Jjodel Object Model) -- The meta-metamodel (M3) that defines the constructs available for building metamodels in Jjodel. Consists of three submodels: data, node, and view.

**JjScript** -- The imperative command language for manipulating metamodels and models, runnable from the Console.

**JjTL** (Jjodel Transformation Language) -- The language for model-to-model transformations, written and executed in the Transformation Editor.

**Labeled Transition System** (LTS) -- The formal semantics model implied by a state machine metamodel. States correspond to graph nodes, transitions to labeled edges, and events to labels. Jjodel realizes LTS semantics through overlay viewpoints with state attributes and custom event actions.

**Layout-Sensitive Notation** -- A notation where the spatial arrangement of elements carries semantic meaning. Changing the position or nesting of an element changes its meaning. Contrast with Topological Notation.

**Megamodel** -- The root of the project tree, holding the metamodels, the models that conform to them, the viewpoints, and the transformations as one hierarchy.

**Meta-metamodel** -- The M3 level: the model that defines the constructs used to build metamodels. In Jjodel, this is the JjOM.

**Metaclass** -- A class definition at the M2 level. Metaclasses specify the structure (attributes, references) that their instances must have. In Jjodel, metaclasses are defined using DClass.

**Metamodel** -- A model at the M2 level that defines the abstract syntax of a modeling language. It specifies metaclasses, their attributes, references, and constraints.

**Model** -- A simplified representation of a system that captures relevant aspects for a given purpose. In Jjodel, models are instances (M1) that conform to a metamodel (M2).

**Node** -- The concrete syntax counterpart of a model instance. A node carries layout information (position, size) and state attributes (computed values, validation results). Nodes exist in the JjOM's node submodel.

**Notation** -- A definition of how abstract syntax elements are visually represented. In Jjodel, a notation is associated with one metamodel and contains viewpoints. Each viewpoint defines a different perspective on the same abstract syntax.

**Observed Properties** -- State attributes explicitly declared in a view configuration so that changes to their values trigger the `onDataUpdate` event. Without declaration, writing to a state attribute stores the value but does not fire reactive updates. Analogous to synthesized and inherited attributes in attribute grammars.

**Operational Semantics** -- The meaning of a language defined by how its constructs execute step by step. In Jjodel, operational semantics can be implemented through overlay viewpoints that use ECA rules and state attributes to simulate execution (e.g., state machine firing transitions).

**Overlay Viewpoint** -- A viewpoint of type Decoration, Validation, Semantics, or Editor behavior. Overlays can be active at the same time as an exclusive viewpoint and as each other, adding features on top of its rendering. See also: Exclusive Viewpoint.

**Panel** -- A JSX component available in the Model view template. Panels create floating titled containers on the canvas with custom content (buttons, text, dynamic queries). Used for simulation controls, legends, and model-level tools.

**Predicate** -- A boolean expression in a view that selects which model instances the view applies to. Written in OCL or JavaScript. Predicates define the syntactic mapping (σ) between abstract and concrete syntax.

**Primitive Data Types** -- The basic value types available for metamodel attributes: EString, EInt, ELong, EFloat, EDouble, EBoolean, EChar, EByte, EShort, EDate. Aligned with the Ecore type system.

**Query** -- A model navigation expression inside a JSX template. Jjodel uses JavaScript expressions (accessing `data` properties) instead of OCL for querying models within templates.

**Row View** -- A view of kind row: it draws a single value wherever that value appears, in the compartment of a node, in a Data Manager cell, or in a form. Renderers include swatches for colours, chips for enumeration literals, pills for references, and dashes for empty slots.

**Separation of Concerns** (SoC) -- The design principle of dividing a system into distinct parts, each addressing a separate concern. In Jjodel, SoC is realized through multi-view modeling: structural, behavioral, and validation perspectives are defined in separate viewpoints.

**Silent View** -- A view whose node is invisible (width: 0, height: 0). The view renders only an Edge component, drawing an arrow between two other nodes. Used for Transition-like metaclasses where the element itself should not appear as a box.

**State Attributes** -- Computed properties stored in `node.state`. Updated by ECA event rules, state attributes hold derived values like validation errors, aggregated counts, or simulation state. Analogous to attribute grammars in compiler theory.

**Symbol** -- The shape that draws a node: rectangle, stadium, diamond, ellipse, and the other presets of the catalogue, together with its fill, border, padding, and sizing. The symbol constrains what the structure of the view can offer.

**Syntactic Mapping** (σ) -- The function that maps concrete syntax representations to abstract syntax models. In Jjodel, σ is defined by the predicates in each view: they select which instances correspond to which visual representations. Part of the language tuple L = (A, C, S, σ, ⟦·⟧).

**Topological Notation** -- A notation where only connections matter, not spatial positions. Moving a class diagram element on the canvas does not change the model's meaning. Contrast with Layout-Sensitive Notation.

**Trace** -- The record a transformation leaves after running: which source elements produced which target elements, and whether each mapping is invertible.

**Validation View** -- A view in a validation overlay viewpoint. Contains an ECA rule that checks a constraint and writes error information to `node.state`. Does not need a template or style; validation feedback is rendered by the Generic error view.

**View** -- A component of a viewpoint that targets instances of a specific metaclass. Every view has a kind, which decides what it produces: a vertex draws a node, an edge draws a connection, a row draws a single value. How it draws is described either declaratively, through symbol, structure, and form, or with the 1.5 combination of a JSX template and an SCSS style. A predicate selects the instances it applies to, and ECA events give it behavior.

**View Designer** -- The properties panel of a view when the view is authored declaratively. Its tabs describe what the view applies to, the symbol, the structure of the node, and the form.

**Viewpoint** -- A perspective on a model, grouping related views. Its type, one of Syntax, Decoration, Validation, Semantics, and Editor behavior, decides whether it is exclusive or an overlay. In ISO 42010 terms, a viewpoint defines concerns; its views realize them.
