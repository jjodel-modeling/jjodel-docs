# Prompt Claude Code: badge di versione nella sidebar di docs.jjodel.io

**Data**: 2026-09-03 14:55
**Repo**: `jjodel-docs` (Astro 6 + Starlight 0.38)
**Tipo**: docs (stile), nessuna modifica ai contenuti delle pagine
**Salvare in**: `docs/prompts/claude_2026-09-03_1455_prompt_docs_sidebar_version_badges.md`

## COSA

La sidebar mostra oggi tre tipi di badge con lo stesso peso visivo: `3.0` (feature della
release corrente, su 11 voci), `1.5` (feature di una release precedente, su Viewpoints) e
`New` (contenuto nuovo dei docs, su Tutorial 5). I badge `3.0` e `1.5` sono entrambi navy
pieno, `New` è viola pieno. Il risultato è una sidebar rumorosa in cui la versione corrente
non si distingue dalle precedenti.

Obiettivo: tre classi di badge distinte, tutte più sobrie di ora, con una gerarchia di
salienza chiara. Nessun testo cambia, nessuna voce si sposta.

| Classe | Uso | Resa (light) |
|---|---|---|
| `version-latest` | numero della release corrente (`3.0`) | outline cyan: bordo `#0ea5e9`, testo `#0369a1`, fondo `#f0f9ff` |
| `version-legacy` | numero di una release precedente (`1.5`, futuri `2.x`) | outline neutro: bordo `#cbd5e1`, testo `#64748b`, fondo trasparente |
| `version-new` | contenuto nuovo dei docs (`New`) | pieno cyan: fondo `#0ea5e9`, testo bianco, bordo `#0ea5e9` |

Salienza decrescente: `New` > `3.0` > `1.5`. Le versioni precedenti restano leggibili ma
arretrano; la corrente resta un accento, non un blocco pieno.

Per tutte e tre: font mono già usato dai badge Starlight, `font-size: 0.6875rem` (11px),
`font-weight: 600`, `border: 1px solid`, `border-radius: 4px`, `padding: 0 0.375rem`,
`line-height: 1.25rem`. Niente ombre.

Dark mode (`:root[data-theme='dark']`): `version-latest` bordo `#0ea5e9`, testo `#7dd3fc`,
fondo `rgba(14, 165, 233, 0.12)`; `version-legacy` bordo `#475569`, testo `#94a3b8`, fondo
trasparente; `version-new` invariato (fondo `#0ea5e9`, testo `#0f172a`).

## DOVE

### Fase 1, discovery (read-only, hard stop)

Su `main` remoto i badge non esistono (né in `astro.config.mjs`, che usa `autogenerate` per le
sezioni, né nel frontmatter delle pagine pushate): vivono nel working tree locale. Prima di
toccare qualsiasi file:

1. `grep -rn "badge" astro.config.mjs src/content/docs src/components src/styles` e
   riportare ogni occorrenza con path e riga. Aspettativa: blocchi frontmatter del tipo
   `sidebar: { badge: { text: '3.0', variant: '...' } }` in circa 13 pagine, oppure
   entry esplicite in `astro.config.mjs` se qualche sezione non è più autogenerata.
2. Verificare in `node_modules/@astrojs/starlight/` (o nella documentazione della versione
   installata, `package.json` → `@astrojs/starlight`) che la config badge accetti la chiave
   `class` oltre a `text` e `variant`. Riportare la firma trovata.
3. Leggere per intero `src/styles/custom.css` e riportare se esistono già regole su
   `.sl-badge` o sui custom property `--sl-badge-*`.
4. Verificare che nessuna delle tre classi (`version-latest`, `version-legacy`, `version-new`)
   sia già in uso: `grep -rn "version-latest\|version-legacy\|version-new" src/`.

Scrivere il discovery report in `docs/discovery/discovery_2026-09-03_sidebar_version_badges.md`
(creare la cartella se manca) con: obiettivo, file letti con path completi, elenco delle
pagine con badge e il `variant` attuale di ciascuna, firma della config badge, stato di
`custom.css`, rischi, domande aperte. **Hard stop**: fermarsi qui e attendere il GO. Non
procedere alla Fase 2 nella stessa esecuzione.

### Fase 2, implementazione (solo dopo GO)

File toccati, tutti e soli:

- `src/styles/custom.css`: aggiunta delle tre regole (light + dark) in coda al file, sotto un
  commento `/* Sidebar version badges */`. Nessuna modifica alle regole esistenti.
- I file `.md`/`.mdx` che portano un badge nel frontmatter (elenco dal discovery report):
  aggiungere `class:` al blocco `badge` e impostare `variant: default`, così il colore viene
  solo dalla classe. Il `text` non cambia. Assegnazione: `3.0` → `version-latest`;
  `1.5` → `version-legacy`; `New` → `version-new`.
- Se il discovery mostra che qualche badge è definito in `astro.config.mjs` invece che nel
  frontmatter, stessa modifica lì.

Nessun altro file. Non toccare `SiteTitle` o altri override in `src/components/`.

## COME

Regole CSS di riferimento (adattare i selettori a quanto trovato al punto 2 del discovery;
Starlight applica la `class` del badge all'elemento `.sl-badge`):

```css
/* Sidebar version badges */
.sl-badge.version-latest,
.sl-badge.version-legacy,
.sl-badge.version-new {
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1.25rem;
  padding: 0 0.375rem;
  border: 1px solid;
  border-radius: 4px;
  box-shadow: none;
}

.sl-badge.version-latest {
  border-color: #0ea5e9;
  color: #0369a1;
  background-color: #f0f9ff;
}

.sl-badge.version-legacy {
  border-color: #cbd5e1;
  color: #64748b;
  background-color: transparent;
}

.sl-badge.version-new {
  border-color: #0ea5e9;
  color: #ffffff;
  background-color: #0ea5e9;
}

:root[data-theme='dark'] .sl-badge.version-latest {
  border-color: #0ea5e9;
  color: #7dd3fc;
  background-color: rgba(14, 165, 233, 0.12);
}

:root[data-theme='dark'] .sl-badge.version-legacy {
  border-color: #475569;
  color: #94a3b8;
  background-color: transparent;
}

:root[data-theme='dark'] .sl-badge.version-new {
  color: #0f172a;
}
```

Frontmatter atteso dopo la modifica (esempio, Data Manager):

```yaml
sidebar:
  order: 7
  badge:
    text: '3.0'
    variant: default
    class: version-latest
```

Se Starlight della versione installata non accetta `class` (punto 2 del discovery), fermarsi
e riportarlo nel report: la via alternativa (variant `note`/`caution`/`success` con override
dei `--sl-badge-*-*` in `custom.css`) va decisa in chat, non in autonomia.

Verifica: `npm run build` senza errori; `npm run dev` e controllo visivo della sidebar in
light e dark (Alfonso fa la verifica visiva; riportare solo l'esito del build).

Commit, solo i file elencati (`git add <path>` per ciascuno, mai `git add .`):
`docs: tone down sidebar version badges, distinguish latest release`

## RIFERIMENTI

- Design system Jjodel: slate `#334155` base, cyan `#0ea5e9` come accento; 11px per label e
  testo secondario. I badge sono label secondarie: 11px, nessun fondo saturo salvo `New`.
- Starlight sidebar badges: config `badge: { text, variant, class }` nel frontmatter
  `sidebar` o nelle entry di `astro.config.mjs`.
- Al termine: entry in `docs/claude-code-log.md` (formato standard: data, tipo `docs`,
  prompt, file toccati, esito, nome del documento prompt `2026-09-03 14:55`).
