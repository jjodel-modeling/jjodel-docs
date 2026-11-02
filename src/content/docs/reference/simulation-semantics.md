---
title: Simulation semantics
description: The precise rules of a simulation run, covering configurations, the marking, the step, guards and actions.
sidebar:
  order: 6
  badge:
    text: "3.1"
    variant: default
    class: version-3-1
  label: Simulation semantics
---

This page states what the Jjodel simulator computes: the rules of a step, as the engine applies them. Available since Jjodel 3.1.

For how to set up and drive a simulation, read the [simulation guide](../../user-guide/simulation/).

## Configuration

A run moves through configurations. A configuration has three parts:

- **M**, the model. It is fixed for the whole run. No step creates, deletes or edits an element or a feature value. The engine freezes a snapshot of M at Reset and evaluates every guard and action on it. Editing the model during a run withdraws the run: the panel returns to `Not started` and says "Run interrupted: the model changed. Reset to run again.".
- **σ**, the state. The engine owns it, outside the model, so it is never saved, never undone and never shared. σ holds the marking, the stored semantic attributes and the stored presentation attributes. The derived attributes are recomputed from σ every time; they are never copied forward.
- **e**, the current event. It is an event instance of M, or ε when no event is given. Every step consumes it.

The initial configuration is the initial marking with every stored attribute at its declared initial value, and no event.

## The semantic type class

A metamodel becomes simulable through a **semantic type class** (STC): a set of roles bound to its metaclasses and features. A role that names a metaclass matches every instance of it or of a subclass, the same "is a" the views use.

A profile (State machine, Petri net, and the others) is a name plus a mode for each role. It carries no semantics: the engine reads the resolved roles, never the profile. A role the profile turns `off` is read as unbound, even when its key is set.

Some profiles also declare constraints on M: "a single token", "no ε transition", "deterministic". They are declared, not enforced: no check runs on them today, and a model that breaks them still simulates. They are planned as the rules of a validation viewpoint generated from the profile, not as part of the engine.

The STC has one of two shapes. It is a Petri net when the Arc role is bound, and control flow otherwise. A run starts only when the shape's required roles are bound:

| Shape | Required roles |
|---|---|
| Control flow | Next state; Source or Owned transitions; Initial or Initial marking |
| Petri net | Node, Transition, Arc, Arc source, Arc target, Initial marking |

Otherwise Reset is refused with "The simulation roles are incomplete.".

## Marking

Every place holds a natural number of tokens from 0 to k. The bound k is the Bound role, a whole number of at least 1, with default 1. A place is **marked** when it holds at least one token.

The initial marking comes from one of two rules:

- **Initial**, a metaclass: each instance gets one token.
- **Initial marking**, an integer feature of the node: each place gets its value. When both are bound, this one wins. A value that is not an integer in 0..k is the compile defect `initial-over-bound`, and that place starts empty.

A firing that would put more than k tokens on a place is **unsafe**. The engine does not saturate: choosing that firing halts the run, with the place, the value and the bound in the message. An unsafe firing still appears among the candidates, flagged "exceeds bound k", so you see it before you choose it.

Two read-only state attributes exist on every place: `x.[marked]`, a boolean, and `x.[tokens]`, the count. Guards, actions and watches read them; no action assigns them, and no declaration may use the two names.

## The Petri core

The engine has one kind of transition: a Petri transition. It has:

- a **preset**: places with a weight each;
- a **postset**: places with a weight each;
- **inhibitors**: places with a weight each;
- **triggers**: the event instances that accept it (none means ε only);
- **guard sites**: the elements whose guards apply, conjoined;
- **action sites**: where its actions come from (see [Actions](#actions)).

A transition is **enabled** when every preset place holds at least its weight, no inhibitor place holds its weight or more, and its guard is true. Firing it removes the preset weights and adds the postset weights: M′ = M − pre + post. An inhibitor arc is not an arc kind of the core: it compiles to the guard conjunct `tokens(p) < w`.

## Compilation onto the core

Reset compiles the model into a net. Each modelling language maps onto the core as follows.

### Petri nets

Places are the instances of Node and transitions the instances of Transition. An instance of Arc from a place to a transition adds that place to the preset; one from a transition to a place adds it to the postset. Arc weight gives the weight, default 1. An Inhibitor arc from a place to a transition adds an inhibitor. Several arcs between the same place and transition add up their weights.

### Flowcharts and state machines

A node is a place and an edge is a transition with one place in its preset and one in its postset. The edges are the elements owned through Owned transitions, the elements with a Source, and the instances of Transition. The preset of an edge is its Source, or, when Source is unbound, the element that owns it through Owned transitions. The postset is its Next state. Both references may hold several values.

### Fork and join

Fork and Join are compilation instructions, not core constructs. A fork or join node is never a place, and the engine never marks it. Its edges fuse into one transition:

- **Fork**: for each incoming edge, one transition from that edge's sources to the targets of every outgoing edge. A parallel fork thus marks several places at once.
- **Join**: for each outgoing edge, one transition from the sources of every incoming edge to that edge's targets. This is an AND-join: it waits for all branches.
- A node that is both: one transition from all incoming sources to all outgoing targets.

A non-deterministic split is just several transitions that share a preset place. A merge is several transitions into the same place.

### Decisions and `else`

A decision block with a boolean outcome is two edges: one with a guard, one whose guard is the literal text `else`. The `else` guard is the negation of the disjunction of its **siblings**' guards. Siblings are the transitions with the same preset, weights included, and the same triggers. The same rule holds in the Petri shape.

- A defective sibling guard makes the `else` defective too.
- Two `else` among the same siblings are the defect `else-twice`, and neither compiles.
- On a fused transition, `else` belongs on the choice edge: the edge into a fork, or an edge out of a join. Elsewhere it is the defect `else-position`.
- An `else` with no sibling is always true. Reset lists it as a defect, and the run keeps it true.
- When the `else` element carries other Guard attributes, their guards still hold, conjoined after the complement.

### Compile defects

An element the compiler cannot place in the net is left out and listed in the defects line after Reset. It never becomes a candidate. The codes are:

| Code | Meaning |
|---|---|
| `no-source`, `no-target` | An edge with no source or no target |
| `not-a-place` | An edge endpoint that is neither a place nor a fork/join node |
| `pseudo-chain` | An edge between two fork/join nodes, or a fork/join node that shares its side of an edge |
| `pseudo-open` | A fork/join node without both incoming and outgoing edges |
| `bad-arc` | An arc that does not join a place and a transition the right way |
| `bad-weight` | An arc weight that is not a whole number of at least 1 |
| `else-twice`, `else-position` | See [Decisions and `else`](#decisions-and-else) |
| `initial-over-bound` | An initial marking outside 0..k |

## Candidates

Given a configuration and an input, the **candidates** are the transitions that:

1. accept the input: under ε, a transition with no trigger; under an event, a transition whose triggers include that event instance, compared by identity. A transition with several triggers accepts any of them;
2. have an enabled preset;
3. are not blocked by an inhibitor;
4. have a true guard.

A terminated configuration has no candidates. The candidates keep the order of compilation.

## The step

A step has three inputs from the environment and one effect computed by the engine:

- the **event**, an event instance or ε;
- the **selector**, a candidate, or none;
- the **input valuation**, a value for each input variable the step reads (see [Input variables](#input-variables)).

The selector is admissible only when it names a candidate. "None" is admissible only when there is no candidate: this is the **progress constraint**. If anything is enabled, something fires. An inadmissible selector is refused: nothing is consumed and nothing is recorded.

One step fires at most one transition. Execution is interleaving, never several firings at once. The core never chooses among candidates: you choose, or the Random policy draws for you with a recorded seed.

When the selector names a transition, the step does, in order:

1. computes M′ = M − pre + post, and halts as unsafe if a postset place exceeds k;
2. evaluates every action of the step on σ and writes them together (see [Actions](#actions));
3. recomputes the derived attributes on the new σ.

The event is consumed: after any step the current event is ε again.

### Discard and quiescence

A step with selector "none" leaves σ unchanged:

- a **discard** when an event was given and no transition accepts it with a true guard;
- **quiescence** under ε, when nothing is enabled.

Both are steps: the trace records them and a scenario replays them. An event is never deferred or queued.

## Guards

A guard is a JjEL expression attached to an edge or a Petri transition through the Guard role. Its type is `Expression`; an `EString` attribute is accepted too. Guard is multi-valued: when several Guard attributes are bound, the guard of a transition is the conjunction of those its class carries. A fused transition conjoins the guards of all its edges.

A guard evaluates to one of three outcomes:

- **true**: the transition is a candidate;
- **false**: it is not;
- **defect**: it is not a candidate either, and the panel says why.

An absent guard, from an unbound role or an empty feature, is **true**.

A defect comes from a parse error, a construct outside the guard subset, an evaluation error, a name that does not exist, or a non-boolean result. A defective guard never halts the run: the transition stays out of the candidates and the run goes on.

### What a guard reads

A guard reads the configuration and never writes it. It is evaluated on the frozen snapshot of M, so a write on M is impossible. Its roots are:

- `self`, the element the guard is attached to;
- `model`, the model root, for global state: `model.[credit]`;
- `event`, the event instance that fired the step, `null` on an ε step;
- `x.[a]`, the state attribute `a` of element `x`. Plain dot navigation, `x.f`, always reads M; `.[a]` always reads σ.

`event.a` reads the attribute `a` of the event instance, as stored in M. It needs `a` to be a feature of the trigger's declared type or of an ancestor of it; the handle keys `name`, `id`, `instanceOf` and `parent` are always readable. An unset attribute reads what M holds: 0 for a mandatory integer, its default if it has one, otherwise `null`.

### The guard subset

The engine checks every guard before the run and rejects these constructs as defects:

| Code | Rejected construct |
|---|---|
| `E-NODE` | `node`: presentation state never drives the semantics |
| `E-DATA` | `data` as a root; use `self` |
| `E-CALL` | a function call; guards have no builtins such as `now()` |
| `E-SHADOW` | a local variable named after a root |
| `E-EAGER` | `x != null and x.p` or `x == null or x.p`: JjEL's `and` and `or` evaluate both sides, so the idiom throws on null |
| `E-NOELSE` | `if` without `else` |
| `E-FORALL` | `forall` used as a verdict; it builds a collection |
| `E-VALUE` | a lambda outside a method argument, or an object literal |
| `E-WITH` | `with … do` |

For `E-EAGER`, write `if x != null then x.p else false` instead of the `and` form, and `x == null implies x.p` instead of the `or` form. The checker also emits warnings (`W-NULLCMP`, `W-TRUTHY`, `W-IS`) and marks constructs a future model checker could not translate (`T-…`); neither stops the guard.

### Reset checks

Reset also lists guards that can be proven wrong before the run:

- a state read whose attribute no declaration has, or whose element does not carry it;
- a read of `marked` or `tokens` on an element that is not a place;
- a read of a presentation attribute;
- a guard that is a single read of a non-boolean attribute;
- a read of `event` on a transition without a trigger: `event` is `null` there;
- `event.a` on a name the trigger's type lacks.

## Actions

An action is an assignment with the form `<target>.[a] := <expression>`. Its type is `Action`. The `:=` token exists only in actions: an expression cannot contain it. The roles Action (on the edge or Petri transition), Entry and Exit (on the node) are lists of `Action` attributes, each a `[0..*]` feature.

### The action sites of a step

A step that fires transition t runs the actions of three kinds of site:

1. the **exit** actions of each place in t's preset;
2. t's own actions: an edge's, the edges of a fused fork or join, or a Petri transition's;
3. the **entry** actions of each place in t's postset.

In a Petri net, arcs carry no actions.

### Parallel assignment

All the assignments of a step form one parallel assignment:

- every right-hand side reads σ, the state **before** the step, never a value another action of the same step wrote;
- all writes land together, atomically;
- the order of the actions does not matter.

An attribute no action assigns keeps its value.

A consequence: assigning the same attribute twice in one step is a defect, even when both writes come from exit and entry of the same place in a self-loop. Reset reports it when both targets are known before the run; otherwise the run halts with `double-assignment` when it happens.

### Targets and locality

The target is a path to an element followed by `.[a]`. `self` is the site element: the place for entry and exit, the edge or transition otherwise. `node.[a]` is the presentation attribute `a` of the site element.

- `node.[a]` assigns presentation attributes only; any other target assigns semantic attributes only.
- A semantic assignment cannot read `node` (`E-NODE`): presentation never flows into σ.
- No action assigns `marked`, `tokens`, a derived attribute or an input variable.
- An entry or exit action that reads `event` is a defect: what a node does on entry or exit does not depend on the path that reached it.

### When an action fails

An action that does not parse is reported at Reset, but its transition **stays a candidate**: firing it halts the run. This differs from a guard, whose defect removes the transition.

The run halts, σ unchanged and the event consumed, when an action of the fired transition:

- fails to evaluate, or yields a value that is not a boolean, a number or a string (`action-defect`);
- assigns an attribute the element does not declare (`undeclared`);
- assigns a derived attribute or an input (`read-only`);
- assigns the same attribute twice (`double-assignment`);
- assigns a semantic value outside its domain (`domain`).

## State attributes

A state attribute is declared, as in an attribute grammar, never inferred. A declaration has:

- a **name**, other than `marked` and `tokens`;
- an **owner**: a metaclass, so every instance of it or of a subclass carries the attribute, or none, for a **global** read as `model.[name]`;
- a **space**: semantic (part of σ) or presentation (`node.[name]`, the look of an element);
- a **domain**, required for a semantic attribute;
- a **form**: stored, derived or input.

### Domains

A semantic attribute has a finite domain of one of three kinds:

| Domain | Values | Example of an initial value |
|---|---|---|
| boolean | `true`, `false` | `false` |
| enumeration | a list of literal names | `Idle` |
| range | the integers from min to max, both included | `0` |

There is no string, real or collection domain. A presentation attribute has no domain and takes any boolean, number or string. Every write of a semantic attribute is checked against its domain. A value outside it halts the run.

The initial value is the exception. An initial value outside its domain is a declaration defect that Reset reports, and the run still starts with that value.

### Where you declare them

Declarations bound to a metaclass live in the metamodel and are edited in the **State** page of the Simulation roles dialog. A model declares its own globals through **State…** on the model's simulation panel. A model's global overrides the metamodel's global of the same name.

### Derived attributes

A derived attribute has an equation, a JjEL expression with `self` its owner, and no initial value. It is read-only. The engine evaluates every derived attribute at Reset and after every firing, on the new σ, in dependency order. Guards and actions read it like a stored one.

- A derived equation cannot read `event`.
- A cycle among equations is a declaration defect. Dependencies are tracked per element and attribute over the frozen M, so a recursion well founded on containment or on a reference is accepted.
- A semantic derived value that fails, or falls outside its domain, after a firing halts the run with σ unchanged. A presentation failure leaves that value out and the step goes on.

### Input variables

An input variable has neither an initial value nor an equation. It is never in σ and never assigned. The environment chooses its value for the one step that reads it. Before a press, the panel collects the inputs read by the guards and actions of the structurally enabled transitions for that press, and asks them in one dialog. Cancelling leaves the run as it was.

### Declaration defects

Reset lists a declaration that is wrong, and the run still starts. A defective declaration applies where it can: the defects are reported, not enforced. The codes cover a record or a key that does not decode, an initial value outside its domain, a semantic attribute without a domain, range bounds that are not integers or are reversed, a reserved name, an unknown metaclass, a name declared twice or in both spaces on one element, both or neither of initial and equation, an equation that does not parse, breaks the subset, reads `event` or sits on a cycle, and an input declared on presentation or read by an equation.

## Run statuses

A run has five statuses:

| Status | Holds when |
|---|---|
| `Not started` | No run exists for the model, before Reset or after Stop or an interruption |
| `Halted` | A step halted; the status stays until Reset or Step back |
| `Terminated` | The configuration is terminated |
| `Running` | Some input, ε or an event of the alphabet, has a candidate |
| `Deadlock` | None of the above |

The panel reads one more case as `Running`: when the engine finds no candidate but some press would ask an input value, a transition may fire once the value is given.

### Termination

A configuration is **terminated** when:

- its marking is not empty and every marked place is an instance of Terminal; or
- some marked place is an instance of Activity final, whatever else is marked.

After a parallel fork, the first rule waits for every branch. Without either role, no configuration terminates: the run ends in `Deadlock` or never ends.

**Accepting** is a reading of the marking, not a stop: the panel shows `accepting` beside the status when a marked place is an instance of it, and the run goes on.

### Deadlock and halt

Deadlock means no input has a candidate, guards and inhibitors evaluated. Terminated and Deadlock are distinct: a run that reaches its final places terminates; one that gets stuck elsewhere deadlocks.

A halt is an error of the model, not of the run. The halt reasons are `unsafe`, `domain`, `double-assignment`, `action-defect`, `undeclared`, `read-only` and `derived`. A halted step leaves σ as it was and consumes the event.

> **Guard errors do not halt.** A guard that fails to evaluate removes its transition from the candidates, and the run goes on; this can turn a run into `Deadlock`.

## Outputs

Two optional roles read outputs from the frozen M:

- **State output**, an attribute of the node: the Moore output, the values of the marked places.
- **Transition output**, an attribute of the edge or transition: the Mealy output of the last firing.

Outputs never change the step. A computed output is a derived attribute; binding the output roles to a derived attribute is not implemented.

## Excluded by construction

These limits are deliberate:

- **Time.** No clocks, durations or timed automata, and no do-activities in states. A counter in σ is discrete, logical time. The I/O board's Clock is an environment device: it presses an event at a period, and the engine sees an ordinary event.
- **Dynamic structure.** No step creates or deletes elements. This is what keeps the state space finite.
- **True concurrency.** One firing per step, interleaving only.
- **Deferral and queues.** An event no transition takes is discarded.
- **Run-to-completion.** The engine does not require untriggered transitions to be exhausted before an event is accepted: ε and events are independent inputs.
- **Free event parameters.** An event's parameters are the frozen attributes of its instance; a value typed at the press exists only as an input variable.
- **Language features.** Hierarchical states, orthogonal regions, history, machine composition, object flow, OR-join, unbounded, coloured and timed nets.
- **Priorities.** The specification mentions explicit priorities as a run policy; none is implemented.

## nuXmv vocabulary

The engine names its concepts after nuXmv, so that a model can later be translated to it.

> **No exporter exists.** No `.smv` exporter is implemented. The table states how each concept would translate, not what Jjodel produces today.

| Simulator concept | nuXmv | Note |
|---|---|---|
| The model M | `FROZENVAR`, constants | Elements become enumerations and constants |
| Marking and stored semantic attributes | `VAR` with the declared domain | The UI labels stored attributes `VAR` |
| Derived attributes, enabling, guards, `terminated`, `accepting`, outputs | `DEFINE` | Stateless; the UI labels derived attributes `DEFINE` |
| Current event, selector, input variables | `IVAR` | Free for the model checker, chosen by the user in simulation; the UI labels inputs `IVAR` |
| `event.a` | `DEFINE event_a` by cases on the event `IVAR` | One per attribute read |
| Admissibility and progress | `TRANS` | Constraints on the `IVAR`s |
| Firing and actions | `ASSIGN next(x) := …` | Parallel, read on the current state, unassigned attributes kept |
| Initial configuration | `ASSIGN init(x) := …` | |
| Invariant watches | `INVARSPEC` | Same text, once an exporter exists |
| Trace and scenario | Counterexample | States plus inputs |
