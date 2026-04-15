---
title: JjScript Reference
description: Complete reference for the Jjodel Scripting Language.
sidebar:
  order: 4
---

JjScript is an imperative, command-based scripting language for direct metamodel manipulation. While JjEL evaluates expressions without side effects and JjTL produces new models declaratively, JjScript modifies the metamodel in place: it creates, renames, moves, and deletes elements as immediate operations.

## Command syntax

Every JjScript statement begins with a verb followed by its arguments:

```jjscript title="JjScript"
create class Person
create attribute name in Person type EString [1]
rename class Person to Customer
delete attribute age
```

All value expressions inside commands are delegated to JjEL. The same expression syntax works across all Jjodel languages.

## Structural commands

| Command | Syntax | Description |
|---------|--------|-------------|
| create | `create <type> <name> [in <parent>] [options]` | Create a metamodel element |
| delete | `delete [<type>] <target> [cascade\|force]` | Remove an element |
| rename | `rename [<type>] <target> to <name>` | Rename an element |
| set | `set <target>.<prop> [=\|+=\|-=] <value>` | Set a property |
| add | `add <type> <name> to <target>` | Create with parent context |
| remove | `remove <target> from <parent>` | Remove from a collection |
| move | `move <target> to <destination>` | Relocate an element |
| copy | `copy <target> to <dest> [as <name>] [deep]` | Duplicate an element |
| extends | `<Child> extends <Parent>` | Set inheritance |

### Element types

JjScript supports 15 element types: `class`, `abstract class`, `interface`, `attribute`, `reference`, `containment`, `composition`, `operation`, `parameter`, `package`, `enum`, `literal`, `annotation`, `model`, `metamodel`.

### Create options

The `create` command accepts element-specific options:

```jjscript title="JjScript"
create class Person
create abstract class BaseEntity
create interface Nameable
create attribute name in Person type EString [1]
create attribute age in Person type EInt default 0
create reference friends in Person type Person [*]
create enum VisibilityKind
create literal PUBLIC in VisibilityKind
```

### Set operators

The `set` command supports three operators:

- `=` replaces the value
- `+=` appends to a collection
- `-=` removes from a collection

```jjscript
set Person.isAbstract = true
set Person.attributes += newAttr
```

## Inspection commands

| Command | Syntax | Description |
|---------|--------|-------------|
| list | `list [<type>] [in <scope>]` | List elements |
| show | `show <target> [brief\|full\|tree]` | Display element details |
| validate | `validate [<target>\|all]` | Check model correctness |

```jjscript
list class
show Person full
validate all
```

## Control commands

| Command | Syntax | Description |
|---------|--------|-------------|
| undo / redo | `undo [n]` / `redo [n]` | Undo/redo up to 20 actions |
| clear | `clear [history\|console\|selection]` | Reset state |
| help | `help [<topic>]` | Context-sensitive help |

## Advanced commands

### eval

Evaluates a JjEL expression in the current metamodel context:

```jjscript
eval forall c in classes such that c.isAbstract: c.name
eval exists a in Person.attributes such that a.type == "EString"
```

If the input starts with a JjEL keyword (`forall`, `exists`, `with`), the `eval` prefix is optional.

### forall

Iterates over a collection and executes a command per element:

```jjscript
forall a in attributes such that a.type == "EString"
do set a.readonly = true
```

### let

Binds values to variables, including interactive prompts:

```jjscript
let $name = prompt('New class name', EString) in
rename class Person to $name

let $ok = confirm('Delete all derived attributes?') in
forall a in attributes such that a.isDerived
do delete a
```

## Element resolution

JjScript locates elements by qualified name using three strategies:

1. **Metamodel-scoped** (preferred): searches within the target metamodel
2. **Project-wide**: searches all metamodels in the project
3. **Name-only**: case-insensitive lookup by last segment

Qualified names use `::` for package paths (`com::model::Person`) and `.` for member access (`Person.name`).

## Autocompletion

JjScript provides context-sensitive suggestions as you type, combining:

- Command names and keywords
- Class and attribute names from the current metamodel
- Primitive types and user-defined types

## Integration with Jjodie

JjScript is the execution target for the Jjodie AI assistant. When you type a natural-language request in the chat ("add a name attribute of type String to Person"), Jjodie generates JjScript commands and executes them.

## Complete example

Building a metamodel from scratch:

```jjscript title="JjScript"
# Create types
create class Person
create abstract class BaseEntity
create interface Nameable

# Set inheritance
Person extends BaseEntity
Person extends Nameable

# Add features
create attribute name in Person type EString [1]
create attribute age in Person type EInt default 0
create reference friends in Person type Person [*]

# Create an enumeration
create enum VisibilityKind
create literal PUBLIC in VisibilityKind
create literal PRIVATE in VisibilityKind
create literal PROTECTED in VisibilityKind

# Create a package
create package com.example
move Person to com.example

# Validate
validate all
```

## Grammar summary

```text title="EBNF"
Command    = CreateCmd | DeleteCmd | RenameCmd | SetCmd
           | AddCmd | RemoveCmd | MoveCmd | CopyCmd
           | ExtendsCmd | ListCmd | ShowCmd | ValidateCmd
           | HelpCmd | UndoCmd | RedoCmd | ClearCmd
           | EvalCmd | LetCmd | ForallCmd

CreateCmd  = 'create' ElementType IDENTIFIER
             ('in' QualifiedName)? CreateOptions*

DeleteCmd  = 'delete' ElementType? QualifiedName
             ('cascade' | 'force')?

ForallCmd  = 'forall' IDENT 'in' JjELExpr
             ('such' 'that' JjELExpr)?
             'do' Command

LetCmd     = 'let' '$' IDENT '=' Expr
             (',' '$' IDENT '=' Expr)* 'in' Command
```
