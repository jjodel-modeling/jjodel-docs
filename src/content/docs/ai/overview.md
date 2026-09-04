---
title: AI in Jjodel
description: Where Jjodel uses language models, what they can do for your metamodels, and how you stay in control.
sidebar:
  order: 1
  badge:
    text: "3.0"
    variant: default
    class: version-3-0
  label: Overview
---

Jjodel uses large language models in four places, all under the name **Jjodie**: a chat that answers questions about Model-Driven Engineering and about Jjodel, script-mediated generation of metamodels and models, mapping suggestions between the source and target metamodels of a transformation, and documentation generation for a whole project. Each one is a separate feature with its own entry point and its own provider setting. None of them runs without a provider you configure yourself.

## The Four Uses

| Use | Where | What the model produces |
|-----|-------|-------------------------|
| [Chat and generation](../jjodie) | The Console, in Jjodie mode | Answers, and [JjScript](../../languages/jjscript) blocks you run yourself |
| [Mapping suggestions](../mappings) | The transformation editor, **Suggested Mappings** panel | Candidate mappings with a confidence level, inserted as JjTL on request |
| [Documentation](../documentation) | The **Documentation** tab of a project | A Markdown document describing the domain, the metamodels, and every feature |
| [Explain this](../jjodie#explain-this) | The context menu of a canvas element | A short explanation of the selected element |

## Script-Mediated Generation

Jjodie never edits a metamodel or a model directly. When you ask for a change, it answers with a JjScript block; the block opens as a script panel in the chat, and nothing happens until you press **Run** there. You can also run it line by line with **Step**. The same holds for mappings, which reach the editor only when you check them and press **Insert**, and for documentation, which you review and edit before you keep it.

This is a design choice, not a limitation. JjScript is a language you can read, and every command it contains is one you could have typed yourself. The model proposes; the script is the contract; you decide. It also means that everything the model does is reproducible: keep the script, and you can replay the change on another project.

This approach is the subject of *Jjodie: A Conversational Modeling Assistant with Script-Mediated (Meta)Model Manipulation*, presented in the Tools & Demonstrations track of MODELS 2026 (Málaga, October 2026).

## Your Provider, Your Key

Jjodel has no built-in model. You bring your own provider, from a cloud API (Claude, GPT, Gemini, DeepSeek, Mistral, Groq, Kimi) to a local one (Ollama) or any OpenAI-compatible endpoint. Keys stay in your browser, and requests go from your browser to the provider you chose; Jjodel's servers never see your prompts. Each feature can use a different provider and model, so you can keep a small local model for chat and a stronger one for mapping analysis.

See [Providers](../providers). The system prompts behind the chat and the mapping analysis are editable too, per project or globally, which is how you teach Jjodie the vocabulary of a domain or the conventions of a course; see [System Prompts](../prompts).

## What You Should Expect

A language model reads your metamodel as text and answers in text. It is good at naming, at spotting correspondences between two structures, and at explaining a concept in plain words. It is not a validator: JjScript it produces can fail, mappings can be wrong, and generated descriptions can be confident and mistaken. Every AI feature in Jjodel is built so that its output is inspected before it changes anything, and each page in this chapter says where to look.
