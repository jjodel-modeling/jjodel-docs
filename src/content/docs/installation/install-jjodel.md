---
title: Install Jjodel Locally
description: Run Jjodel on your machine using Docker or building from source.
sidebar:
  order: 1
---

While Jjodel is designed as a cloud-native platform accessible at [app.jjodel.io](https://app.jjodel.io), you can also run it locally for offline use, development, or research purposes.

## Option 1 — Docker (Recommended)

Docker is the fastest way to run Jjodel locally.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine
- [Docker Compose](https://docs.docker.com/compose/install/) (included with Docker Desktop)

### Steps

1. Clone the Jjodel repository:
   ```bash
   git clone https://github.com/jjodel-modeling/jjodel.git
   cd jjodel
   ```

2. Start Jjodel with Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Open your browser and navigate to `http://localhost:3000` (or the port specified in the configuration)

4. To stop Jjodel:
   ```bash
   docker-compose down
   ```

<!-- TODO: verify exact Docker commands and ports with current repo -->

### What's Included

The Docker setup includes all Jjodel components: the web application, the backend services, and the database. It provides the same full-featured environment as the cloud version, except for shared storage and real-time cross-network synchronization.

## Option 2 — Build from Source

For developers who want to contribute to Jjodel or customize it.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/jjodel-modeling/jjodel.git
   cd jjodel
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

<!-- TODO: verify build commands with current package.json -->

### Development Notes

- Jjodel uses **React 18 + TypeScript** with **Vite** as the bundler
- Styling is done with **SCSS**
- Icon library: **Bootstrap Icons** (the only permitted icon library)
- Code editor: **Monaco Editor**

For development conventions and guidelines, see the `CLAUDE.md` file in the repository root.

:::caution[Local vs Cloud]
The local installation does not include cloud storage or real-time collaboration features. Projects created locally are stored on your machine and are not accessible from [app.jjodel.io](https://app.jjodel.io).
:::
