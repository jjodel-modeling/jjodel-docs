---
title: System Prompts
description: What the system prompts behind Jjodie do, and how to adapt them to your domain, your language, and your teaching.
sidebar:
  order: 6
  badge:
    text: "3.0"
    variant: default
    class: version-3-0
  label: System Prompts
---

Every call to a language model carries two texts: what you typed, and a system prompt the model reads first. The system prompt is where Jjodel tells the model who it is, what it knows, what it must produce, and how to write. It is the reason Jjodie answers as a metamodeling assistant rather than a generic chatbot, and the reason it answers with JjScript instead of prose. Jjodel lets you read and edit these prompts in **Settings > AI > Prompts**.

<!-- TODO: screenshot — Settings > AI > Prompts, the Chat Assistant prompt open in the editor with the Project Override badge (new UI) -->

## What a Prompt Controls

Two prompts are in use today.

**Chat Assistant** frames [Jjodie](../jjodie). It declares the role (an assistant specialized in metamodeling and in Jjodel), the areas of expertise, the JjScript syntax the model must use, with a reference of the commands and a list of rules such as "declare an enumeration before using it as a type", the routing between metamodel and model requests, and the response style. The context of your project is injected into it at the `{{projectContext}}` placeholder before each call.

**Analyze Metamodels** drives the [mapping analysis](../mappings). It asks the model to find semantic correspondences between two metamodels and to answer as a JSON array with a confidence level and a reason for each match. The two metamodels are injected at `{{sourceMetamodel}}` and `{{targetMetamodel}}`, their names at `{{sourceName}}` and `{{targetName}}`.

The other prompts on the page, **Documentation Generation**, **Validation Assistant**, **Refactoring Suggestions**, **OCL Generation**, and **Import Assistant**, are placeholders for features that do not read them yet. Editing them has no effect for now.

## Why Edit Them

The defaults are written for the general case: any domain, any user, English. Your case is narrower, and a sentence in the right prompt is often worth more than repeating the same instruction in every message.

- **Domain vocabulary.** A prompt that says "in this project, a `Node` is a network device and a `Link` is a physical cable, never a hyperlink" keeps Jjodie from guessing. The same goes for mapping analysis on metamodels whose class names are abbreviations or domain jargon.
- **Conventions.** If your metamodels name classes in the singular, prefix enumerations with `E`, or never use aggregation, say it once in the prompt and the generated JjScript follows.
- **Language.** Add "answer in Italian" and Jjodie does. The JjScript stays JjScript.
- **Teaching.** For a course, a prompt can ask Jjodie to explain the modeling choice before the script, to name the concept behind each command, or to refuse to write the script until the student has stated the classes involved. The default prompt is the assistant's persona; a classroom prompt can be a tutor's.
- **Depth.** For expert use, the opposite: "no explanations, script only".

Keep the parts that make the feature work. The JjScript reference and the mandatory rules in the Chat Assistant prompt are what makes Jjodie's blocks run without corrections; the JSON format in the Analyze Metamodels prompt is what the panel parses. Add to them rather than replacing them, and keep the `{{placeholders}}`: without them the model never sees your project.

## How the Levels Work

A prompt has three levels, and the most specific one wins:

1. **Default**, shipped with Jjodel, versioned.
2. **Global override**, yours, for every project in this browser.
3. **Project override**, for the project that is open.

The badge on each prompt shows which level is active: **Default** with its version number, **Global**, or **Project**. Open a prompt to see the full text; **Edit** unlocks it, **Save** writes the override at the level you are editing, **Reset** deletes it and returns to the level below. A project override also has **Use Global**, which drops the project text and keeps the global one.

Use the project level for what belongs to one language: its vocabulary, its conventions. Use the global level for what is about you: the answer language, the explanation depth, the tone.

## When a Default Changes

Defaults evolve with Jjodel: a new JjScript command, a corrected rule, a better example. An override freezes the text it was built on, so it would silently miss those changes. Jjodel keeps the version number of the default each override was based on, and when a newer default ships, the prompt gets a **Default updated** badge. Open it, read the changes listed since the version you started from, and decide: merge them into your override, or **Reset** and rebuild the override on the new text.

## Where They Live

Overrides are stored in your browser, next to the provider keys. They do not travel with the `.jjodel` file and do not follow your account to another machine. To share a prompt with a colleague or a class, copy its text from the editor and paste it on the other side.

## Limits

- An edited prompt applies from the next message. The answers already in the transcript were produced under the old one.
- The prompt is sent with every call, so its length is paid on every call. Keep additions short and specific.
- A prompt cannot make the model see more than the feature sends it. To give Jjodie a document, paste it in the chat.
