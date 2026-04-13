---
title: Domain Analysis
description: How to analyze a domain, identify concepts, and formalize them into a metamodel.
sidebar:
  order: 2
---

Before you can build a metamodel, you need to understand the domain you are modeling. Domain analysis is the process of observing a real-world scenario, identifying the relevant concepts, and organizing them into a formal structure. This page explains how to do it.

## Domains Exist Independently of Software

A domain is the body of knowledge, activity, or expertise that a system addresses. Most domains have nothing to do with software: healthcare, logistics, manufacturing, finance. Software is just a tool you build to support, automate, or optimize a domain.

This distinction matters. When you analyze a domain and formalize it as a metamodel, you are not designing a software system. You are capturing knowledge. The software comes later, only if you need automation.

## The Process

Domain analysis is iterative. You work with domain experts through multiple rounds of observation, discussion, and refinement. Each iteration improves the metamodel by adding missing concepts, removing redundancies, and adjusting the level of abstraction.

The process follows two complementary activities:

**Classification** asks: "What kinds of things exist here, and how can we categorize them meaningfully?" You observe the real-world scenario, identify recurring entities, and group them into types. These types become classes in your metamodel. The actual things you observe become instances.

The idea of classification is deeply embedded in object-oriented thinking. Simula, the first OO language, was called that because it was built for simulation. Its need to represent real-world "things" in software led directly to the concepts of classes and instances that underpin all modern metamodeling.

**Abstraction** asks: "What matters about this thing for our purpose?" You focus on the essential characteristics of each concept and ignore details that are not relevant at this stage. This reduces complexity and makes the metamodel manageable.

### How They Relate

Classification and abstraction are complementary strategies. Classification organizes individual domain entities into types by identifying shared properties, behavior, or roles. Abstraction then decides which aspects of those types are relevant for the modeling purpose and discards the rest.

| Strategy | Role in Modeling | How It Relates to the Other |
|----------|-----------------|----------------------------|
| Classification | Organizes domain entities into types (e.g., Patient, Nurse, Sensor) | Enables abstraction by grouping individuals into categories with shared behavior |
| Abstraction | Omits details to focus on essential characteristics | Determines which aspects of classified types are important across instances |

When you do domain modeling, you are building a structural representation of a domain. This is where classification and abstraction meet: classification tells you what kinds of things exist, abstraction tells you what matters about them.

## Example: Intensive Care Unit

Consider the domain of an Intensive Care Unit (ICU). Patients are monitored with medical devices, sensors trigger alerts when values exceed thresholds, and medical staff responds according to clinical protocols. This domain is distant from software, which makes it a good exercise for domain analysis.

### Step 1: Identify Concepts (Classification)

Looking at an ICU room, you can immediately identify several concepts:

- **Patient** in the bed, connected to monitoring equipment
- **Nurse** attending to the patient
- **Doctor** responsible for medical decisions
- **Medical devices** of various types around the bed
- **Sensors** attached to the devices, measuring specific values

Each of these becomes a candidate class in the metamodel. So far this is straightforward observation.

### Step 2: Discover Problems

As you start formalizing, two problems emerge.

**Problem 1: Sensor-device relationship.** Each sensor type (heart rate, blood pressure, oxygen saturation) is connected to a specific device. If you create explicit relationships between each sensor type and each device type, the metamodel becomes unnecessarily complex. You need to abstract the sensor-device relationship into a single, generic connection.

**Problem 2: Duplicated relationships.** Nurses and doctors have the same kind of relationship with medical devices (they operate them, they respond to alerts). If you keep them as separate unrelated classes, you must define the same relationship twice. You need to introduce a hierarchy: a common superclass like `MedicalStaff` that captures what nurses and doctors share.

### Step 3: Apply Abstraction

With these problems identified, you restructure the metamodel:

- Create an abstract `Sensor` class with generic properties (unit, currentValue, timestamp). Specific sensor types (HeartRateSensor, BloodPressureSensor) extend this class with their own attributes.
- Create an abstract `MedicalStaff` class that generalizes Nurse and Doctor. The relationship with medical devices is defined once, on MedicalStaff.
- Optionally, create a higher-level abstract `Stakeholder` class that groups all individuals involved in the domain (patients, nurses, doctors).

The result is a cleaner metamodel with fewer relationships, less duplication, and a clear inheritance hierarchy that can be extended without restructuring existing elements.

### Step 4: Add Domain-Specific Details

With the core structure in place, you add the details that capture domain-specific knowledge:

- Devices have a **status** (idle, active, out of service) modeled as an enumeration
- Alerts have a **type** (information, warning, critical) and a **timestamp**
- Alerts go through a lifecycle: triggered, acknowledged, resolved
- Medical staff has a **response time** that measures how quickly they react to an alert

These details emerge from conversations with domain experts. You would not know about alert lifecycles or response time tracking without talking to someone who works in an ICU.

## Why Build the Metamodel Yourself

With the advent of LLMs and generative AI, it can seem efficient to produce a metamodel automatically from a natural language description of a domain. Tools like ChatGPT or Claude can generate class hierarchies, attributes, and references in seconds.

But this misses the point.

Consider the difference between reading a book and writing one. Reading gives you second-hand knowledge: you learn what someone else has formalized. Writing gives you first-hand knowledge: you are the person who identifies the concepts, makes the trade-offs, and decides what matters.

Building a metamodel is like writing a book about the domain. By the time you finish, after multiple iterations with domain experts, experiments, and revisions, you have developed a deep understanding of the domain. You are approaching the level of a domain expert yourself.

An automatically generated metamodel skips this learning process. You receive a structure you did not build, and you must then spend time understanding what it represents and why it was structured that way. The effort you saved in construction, you spend in comprehension, without gaining the design intuition that comes from having made the decisions yourself.

AI can be valuable as a sparring partner during domain analysis: suggesting concepts you might have overlooked, proposing alternative decompositions, or checking consistency. But the decisions must remain yours.

## Choosing the Right Level of Abstraction

How abstract or concrete should your metamodel be? This depends on the questions you want your models to answer.

If you need to track which patient is in which bed and which devices are attached, you need concrete concepts like Bed and specific device types. If you need to analyze staffing patterns, you can stay at the abstract MedicalStaff level without distinguishing nurses from doctors.

Consider the Sensor class from the ICU example. The basic metamodel captures `unit`, `currentValue`, and `timestamp`. But what if you also need an alerting system for sensor battery levels, especially for vital monitoring? Then you would add properties like `batteryLevel` (Integer %), `signalQuality` (Float), `lastCalibrated` (DateTime), and threshold values. These properties are irrelevant for a patient monitoring model but essential for a device maintenance model. Same domain, different purpose, different level of abstraction.

Start abstract. Add detail when the models cannot answer the questions you care about. Removing unnecessary detail later is harder than adding necessary detail incrementally.

## Domain vs Notation

An important distinction: a **domain** is a real-world context or body of knowledge (library management, hospital staffing, smart homes). A **notation** is a formal language used to represent domains (ER diagrams, UML class diagrams, BPMN).

This distinction matters when you work in Jjodel. If you build an ER diagram language, you are formalizing a *notation*, not a domain. The notation itself becomes your domain of analysis: Entity, Attribute, and Relationship are the concepts you classify and abstract. But when you later *use* that ER notation to model a hospital database, you are modeling a domain.

In most practical scenarios, you build DSLs for domains, not for notations. The ER example in the [tutorials](../../tutorials/tutorial-03-erd) uses a notation as a learning exercise precisely because students already know the concepts and can focus on the metamodeling process.

## From Domain to Language

The metamodel you build through domain analysis becomes the abstract syntax of a Domain-Specific Language (DSL). A DSL is a formal, machine-processable interface to represent and manipulate domain knowledge. It provides structure, enforces consistency, and enables automation within the context it models.

Concretely, your metamodel gives the DSL:

- A **vocabulary** of domain concepts (the classes)
- **Rules** for how concepts relate (the references and constraints)
- A **structure** that enables automated processing (validation, transformation, code generation)

A DSL is defined using Jjodel's meta-metamodel, which provides the building blocks: Class, Attribute, Reference, Enumeration, Package. Your metamodel is an instance of this meta-metamodel.

The next step is to give this DSL a concrete syntax through viewpoints, so that domain experts can work with it visually rather than through the raw abstract syntax. See [Viewpoints](../../user-guide/viewpoints) for details on how to define visual representations.
