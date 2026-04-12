# Jjodel Documentation

Official documentation for [Jjodel](https://jjodel.io) — a cloud-native, collaborative metamodeling platform for research and education.

## Structure

```
jjodel-docs/
├── index.mdx                    ← Landing page (Starlight splash)
├── getting-started/             ← Quick start (3 pages)
│   ├── index.md                 ← Overview
│   ├── sign-in.md               ← Account creation & login
│   └── first-project.md         ← Build your first language workbench
├── user-guide/                  ← Feature documentation (6 pages)
│   ├── dashboard.md
│   ├── metamodel-editor.md
│   ├── tree-views.md
│   ├── viewpoints.md
│   ├── nodes.md
│   └── console.md
├── concepts/                    ← Conceptual foundations (4 pages)
│   ├── basic-notions.md
│   ├── project-structure.md
│   ├── modeling-language-anatomy.md
│   └── glossary.md
├── tutorials/                   ← Step-by-step exercises (2 pages)
│   ├── tutorial-01-basic.md
│   └── tutorial-02-viewpoint.md
├── reference/                   ← Technical reference (4 pages)
│   ├── jjom.md
│   ├── jjom-api.md
│   ├── jjodel-events.md
│   └── jjodel-definition-language.md
├── installation/                ← Local setup (1 page)
│   └── install-jjodel.md
├── faq.md                       ← Frequently Asked Questions
└── video-pills.md               ← Video tutorial index
```

## Usage

This repository is the **single source of truth** for Jjodel documentation. It is consumed by:

1. **jjodel-website** — rendered as the `/docs/` section via Astro + Starlight
2. **Jjodel app** — used for in-app help and documentation

## Contributing

1. Fork the repository
2. Create a branch for your changes
3. Write or edit Markdown files following the existing conventions
4. Submit a Pull Request

### Conventions

- Use [Starlight frontmatter](https://starlight.astro.build/reference/frontmatter/) for page metadata
- Place screenshots in an `assets/` folder (not yet created — pending new UI screenshots)
- Mark pending work with `<!-- TODO: description -->` comments
- Write in English, using a direct and technically accessible tone

## License

MIT — see [LICENSE](LICENSE) for details.
