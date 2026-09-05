# Jjodel Documentation

Official documentation for [Jjodel](https://jjodel.io) — a cloud-native, collaborative metamodeling platform for research and education.

Powered by [Astro](https://astro.build) + [Starlight](https://starlight.astro.build). Deployed at [docs.jjodel.io](https://docs.jjodel.io).

## Quick Start

```bash
npm install
npm run dev       # → http://localhost:4321
npm run build     # → generates static site in dist/
```

## Project Structure

```
jjodel-docs/
├── astro.config.mjs              ← Starlight configuration
├── package.json
├── public/
│   ├── CNAME                     ← custom domain for GitHub Pages
│   └── favicon.png
├── src/
│   ├── assets/
│   │   └── jjodel-logo.png
│   ├── components/
│   │   └── SiteTitle.astro       ← header with "Try Jjodel" button
│   ├── content/
│   │   └── docs/                 ← all documentation content
│   │       ├── getting-started/
│   │       ├── user-guide/
│   │       ├── concepts/
│   │       ├── tutorials/
│   │       ├── reference/
│   │       ├── installation/
│   │       ├── faq.md
│   │       └── index.mdx
│   └── styles/
│       └── custom.css            ← Jjodel brand colors
└── .github/
    └── workflows/
        └── deploy.yml            ← auto-deploy on push to main
```

## Deployment

Deployment is **automatic**: every push to `main` triggers a GitHub Action that builds the site and deploys it to GitHub Pages.

### First-time setup

1. Go to the repo **Settings → Pages**
2. Under "Build and deployment", select **GitHub Actions**
3. In your DNS provider (Aruba), add a CNAME record:
   - Host: `docs`
   - Points to: `jjodel-modeling.github.io`
4. In the repo **Settings → Pages → Custom domain**, enter `docs.jjodel.io`
5. Enable "Enforce HTTPS"

After these steps, every push to `main` will automatically build and deploy the docs.

## Writing Documentation

All documentation lives in `src/content/docs/` as Markdown files with Starlight frontmatter:

```markdown
---
title: Page Title
description: A brief description for SEO and link previews.
sidebar:
  order: 1
---

# Page Title

Your content here...
```

### Admonitions

```markdown
:::note
Informational note.
:::

:::tip[Custom title]
A helpful tip.
:::

:::caution
Something to be careful about.
:::
```

### Adding a new page

1. Create a `.md` file in the appropriate directory under `src/content/docs/`
2. Add frontmatter with `title`, `description`, and `sidebar.order`
3. Commit and push — the site rebuilds automatically

## License

MIT
