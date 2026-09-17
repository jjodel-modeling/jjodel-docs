---
title: Validation
description: Write invariants on metamodel classes as JjEL rules, with your own messages, and check a model against them.
sidebar:
  order: 8
  badge:
    text: "3.0"
    variant: default
    class: version-3-0
  label: Validation
---

A metamodel says which elements exist and how they connect. It cannot say that a relationship joins two different entities, that every entity has a key, or that a state machine has exactly one initial state. Validation rules say it. A rule is an invariant attached to a class: a JjEL expression that must be true for every instance of that class, and a message that tells the modeler what is wrong when it is not.

Available since Jjodel 3.0.

## Rules are declarative

A rule states a condition; it does not describe how to check it. You write what must hold, in JjEL, and Jjodel evaluates it on each instance of the class. There is no event to hook, no state to write, and no error to clear by hand: when the model satisfies the condition again, the violation goes away at the next validation.

The body of a rule has the full expressiveness of [JjEL](../../languages/jjel): navigation along references, the collection library, quantifiers, `implies`, null-safe access, type checks. Inside the body, `self` is the instance being checked. A quantification such as `Entity.instances` ranges over the instances of the model being validated, not over the whole project, so a cardinality rule on one model is not confused by another model of the same language.

This replaces the validation of Jjodel 1.5, where a validation viewpoint held ECA rules that wrote error keys into `node.state` from an `onDataUpdate` handler. That mechanism has been removed.

## Writing a rule

Rules belong to the metamodel, because they predicate on its classes.

1. Open the metamodel and switch to **Advanced** mode.
2. Click the **Validation rules of this metamodel** button in the toolbar (the list-check icon). The **Validation rules** dialog opens.
3. Select a class in the **Classes** column. The middle column lists **Rules of** that class; a number next to a class name counts its rules.
4. Click **New rule**. The rule gets a generated name and opens on the right.

The rule editor has four parts:

- **Name**: an identifier for the rule, shown in the results next to each violation.
- **Active**: a switch. An inactive rule is kept but not evaluated, and the rule list marks it **off**.
- The **body**, under a line that reads `self: <class>`: the JjEL condition.
- **Message**: the text shown to the modeler when the rule is violated. Write it for the person fixing the model, not for the author of the rule.

Changes are saved when a field loses focus. The trash icon deletes the rule after a confirmation.

Rules apply along the class hierarchy. A rule on `NamedElement` checks every `Entity`, `Attribute` and `Relationship`, and a rule on a subclass adds to the inherited ones instead of replacing them. When you select a subclass, its inherited rules appear below its own under **Inherited**, read-only, with the class they come from.

## The body must return a boolean

A rule gives a verdict only when its body evaluates to `true` or `false`. Nothing is converted: a collection, a number or a string is not a verdict.

This matters with quantifiers. `self.ownedAttributes.any(a => a.isKey)` returns a boolean. `forall a in self.ownedAttributes : a.isKey` returns a set, one value per attribute, and produces no verdict. Use the collection methods `all`, `any` and `none` when a rule quantifies over a collection. The dialog repeats this under the editor.

## Examples

On the ER metamodel of [tutorial 1](../../tutorials/01-er-metamodel):

| Class | Body | Message |
|-------|------|---------|
| `Relationship` | `self.left != self.right` | A relationship must connect two different entities. |
| `Entity` | `self.ownedAttributes.any(a => a.isKey)` | Every entity needs at least one key attribute. |
| `NamedElement` | `self.name.isNotBlank` | Every element needs a name. |

The third rule sits on the abstract superclass and checks entities, attributes and relationships alike.

## Validating a model

Open a model and click **Validate the open model against the active rules** in the toolbar (the shield icon). Jjodel evaluates every active rule on every instance of its class and its subclasses, then opens the **Validation** dialog for that model.

The dialog always shows three numbers, even when they are zero:

- **violations**: instances for which a rule returned `false`
- **rules inactive**: rules switched off, so you know what was not checked
- **not evaluable**: evaluations that produced no verdict, because the body threw, used an identifier that does not exist, or returned something other than a boolean

Below the numbers, a line reports how many rules ran over how many instances and how long it took. Each violation lists the element, your message and the rule name; click it to select the element in the editor. Notes at the bottom report the rules that do not compile and did not run, and the rules that found no instance to apply to because their class has no instances in this model. Without those notes, a rule that never ran would look exactly like a rule that passed.

## Feedback in the editor

Violations also appear on the model. The nodes of violating instances carry a red marker, and the violations enter the problems of the model next to its conformance checks.

Next to the **Validate** button, one indicator says how current that feedback is:

- **Not validated**: no validation has run on this model in this session. No markers means nothing was checked, not that the model is valid.
- **No violations** or **N violations**: the result of the last run.
- **Changed since validation**: the model or the rules changed after the last run. The markers are withdrawn rather than left on screen, because they may no longer be true. Validate again.

Validation runs when you ask for it. It does not re-run on every edit.

## Where rules live

Rules are stored in a validation viewpoint of the project, which is created when you write the first rule and saved with the project. In the tree view, **Viewpoints** lists three concerns, **Syntax**, **Data Manager** and **Validation**; the **Validation** branch shows the validation viewpoint with its rules and their context class, and says so when the project has none.

Validation is separate from conformance. Conformance checks what the metamodel itself states (types, multiplicities, containment, names) and needs no rules. Validation checks what you add on top of it.

## Known limits

- A project has one validation viewpoint. Grouping rules into several viewpoints and switching them on and off as a set is planned; today each rule is activated on its own.
- Every violation is reported as an error. Severities are not available yet.
- A message is fixed text. It cannot yet include values from the violating instance.
- Validation checks the open model. Validating every model of a project in one run is not available yet.
- Deleting a class does not yet ask what to do with the rules written on it.
