---
title: Dashboard
description: Your hub for managing projects and accessing recent work.
sidebar:
  order: 1
  label: Dashboard
---

The Dashboard is the first screen you see after logging in. It lists every project you have access to and gives you the entry points to create, import, and organize your work.

## Overview

![Dashboard overview](./images/dashboard-overview.png)

The Dashboard is organized into a sidebar and a main project list.

The sidebar gives you:

- **All projects** — the default view, listing everything you have access to
- **Filters** — jump straight to **Private**, **Public**, or **Collaborative** projects
- **Favorites** — projects you starred for quick access
- **Browse** — **Templates** to start a project from a predefined structure, and **Explore** to discover public projects from other users
- **Recently Modified** — a shortcut list of the last few projects you touched
- **Resources** — links to **Documentation**, **Tutorials**, the **API Reference**, and the **GitHub** repository

The main area lists your projects as cards (or as a table, see [List view](#grid-and-list-view) below), with **Import** and **New Project** buttons in the top-right corner, filter tabs (**All** / **Public** / **Private** / **Collaborative**), a sort dropdown, a grid/list toggle, and a search box.

## Creating a Project

You can start a new project in two equivalent ways:

- Click **+ New Project** in the top-right corner of the Dashboard
- Open the **File** menu (top-left) and select **New Project**

The same **File** menu also gives you:

- **Recent Projects** — a submenu listing the projects you opened most recently
- **Import Project** — upload a project file exported from Jjodel (or from another user)

If you have no projects yet, the Dashboard shows an empty state with a **New project** button and quick links to the getting started guide, video tutorials, and the documentation.

## Project Cards

Each card represents a self-contained project workspace. A project in Jjodel can contain:

- One or more **metamodels** defining the language structure
- One or more **models** conforming to those metamodels
- One or more **transformations** between metamodels
- One or more **viewpoints** defining visual representations

A card shows the project name, a colored status dot, a badge for its current revision (**Rev 1.0**), and how many metamodels and models it contains (**Models / Metamodels**). The **Active** badge marks the project you currently have open; every other project shows **Stale** until you open it. The **Modified** timestamp tells you when the project was last saved.

Click anywhere on a card to open that project.

### Managing a Project

Hover over a card to reveal a star icon and a **⋯** menu. The menu gives you:

- **Open** — enter the project workspace
- **Download** — export the project as a file
- **Repair & open** — attempt to fix a project that failed to load correctly, then open it
- **Add to favorites** — pin the project to the **Favorites** section of the sidebar
- **Delete** — permanently remove the project

:::caution
Deleting a project cannot be undone.
:::

## Grid and List View

Use the toggle next to the sort dropdown to switch between the card grid and a compact table (**Name**, **Type**, **Rev**, **Metamodels**, **Models**, **Modified**), where **Type** shows whether the project is **Private**, **Public**, or **Collaborative**. The table view also lets you select multiple projects with checkboxes for bulk actions.

## Sorting and Searching

The sort dropdown reorders your project list by **Last modified**, **Oldest modified**, **Recently created**, **Name (A to Z)**, or **Name (Z to A)**. The search box next to it filters the list as you type, matching against project names.

:::note
All projects are stored in the cloud. You can access them from any device by logging into your account.
:::
