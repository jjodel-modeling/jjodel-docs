---
title: Providers
description: Connect the language model you want to use, one provider and model per feature, with your own key.
sidebar:
  order: 5
  badge:
    text: "3.0"
    variant: default
    class: version-3-0
  label: Providers
---

Jjodel ships no language model. Every AI feature calls a provider you connect in **Settings > AI > Providers** with your own key, and each feature picks its provider and model independently. Until a provider is connected, the AI pickers read **Configure a provider** and the features are inactive; everything else in Jjodel works as usual.

<!-- TODO: screenshot — Settings > AI > Providers with one provider expanded and tested (new UI) -->

## Connecting a Provider

The Providers page lists one row per provider. Open a row, paste the API key, and press **Test Connection**. A provider whose test passes becomes available to every picker in the app; a provider whose key later stops working is flagged in the list.

| Provider | Kind | What you enter |
|----------|------|----------------|
| Claude, GPT, Gemini, DeepSeek, Mistral, Groq, Kimi | Cloud API | API key |
| Ollama | Local, on your machine | Nothing by default; it talks to `localhost:11434` |
| Custom | Any OpenAI-compatible endpoint | Base URL, API key, model name |

Each row has a link to the page where the provider issues keys. **Llama** and **Copilot** appear in the list but are not supported yet; selecting them fails at the first call.

Each provider comes with a list of models. The picker shows the current ones; older models are behind **Show legacy models**.

## One Provider per Feature

Every AI feature has its own picker, next to the feature itself: in the Console header for [Jjodie](../jjodie), in the **Suggested Mappings** panel for [mapping analysis](../mappings), in the Documentation tab toolbar for [documentation](../documentation). The choice is remembered per feature. A feature that has no explicit choice uses the first connected provider in the list.

This is how you keep costs where they matter: a fast, cheap model for chat and explanations, a stronger one for a mapping analysis you run once per transformation, a local Ollama model when the metamodel cannot leave your machine.

## Editing the Prompts

**Settings > AI > Prompts** exposes the system prompts that frame Jjodie and the mapping analysis. Each has a default, a global override, and a project override. They are the place to teach Jjodie your vocabulary, your conventions, or your language; see [System Prompts](../prompts).

## Privacy

Keys are stored in your browser only, in local storage, and the Settings page says so. They are never sent to Jjodel's servers and they do not travel with a `.jjodel` file.

Requests go from your browser to the provider directly. What leaves the browser is what the feature needs: for Jjodie the artifact in focus and fragments of the project; for mapping analysis the two metamodels in full; for documentation the whole project. What the provider does with it is governed by that provider's terms, not by Jjodel. For metamodels you cannot share, use Ollama or a Custom endpoint inside your network.

The one exception is the connection test for Claude, which passes through a small relay operated by the Jjodel project. The relay sees the test request only; chat and generation with Claude go directly to Anthropic.

## Limits

- The Stop and Cancel buttons of the AI features end the wait, not the request. The provider still completes the call.
- Keys in local storage are cleared with the browser's site data. Keep a copy.
- Provider, model, and prompt choices are per browser. They do not follow your account to another machine.
