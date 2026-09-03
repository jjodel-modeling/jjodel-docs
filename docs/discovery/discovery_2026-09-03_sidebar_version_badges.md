# Discovery — badge di versione nella sidebar di docs.jjodel.io

**Documento prompt**: 2026-09-03 14:55 (`docs/prompts/claude_2026-09-03_1455_prompt_docs_sidebar_version_badges.md`)
**Repo**: `jjodel-docs`, branch `docs/2026-09-update` (HEAD `2b52677`, ahead 1 su origin)
**Fase**: 1 di 2, read-only. Nessun file di progetto modificato.
**Esito**: la via `class` è praticabile. Due premesse del prompt sono smentite dalla misura.

## 1. Obiettivo

Distinguere in sidebar tre classi di badge — versione corrente (`3.0`), versione precedente
(`1.5`), contenuto nuovo (`New`) — con salienza decrescente `New` > `3.0` > `1.5` e una resa
complessivamente più sobria dell'attuale. Nessun testo cambia, nessuna voce si sposta.

## 2. File letti

| Path | Perché |
|---|---|
| `astro.config.mjs` | sidebar, customCss, override di componenti |
| `src/styles/custom.css` (105 righe, intero) | regole esistenti su badge |
| `src/content/docs/**` (11 file con `badge:` in frontmatter) | inventario e variant |
| `node_modules/@astrojs/starlight/schemas/badge.ts` | firma della config badge |
| `node_modules/@astrojs/starlight/user-components/Badge.astro` | resa in DOM e layer CSS |
| `node_modules/@astrojs/starlight/components/SidebarSublist.astro` | passaggio di `class` in sidebar |
| `node_modules/@astrojs/starlight/components/ThemeProvider.astro` | presenza di `data-theme` |

`@astrojs/starlight` installato: **0.38.3** (`package.json` chiede `^0.38.3`); Astro `^6.1.0`.

## 3. Inventario dei badge — 11 pagine, non 13

Tutti nel frontmatter `sidebar.badge`; **nessun badge in `astro.config.mjs`**, che usa solo
`autogenerate` per le sette sezioni a directory e `link` per le quattro voci singole.

| Pagina | `text` | `variant` attuale | Classe di destinazione |
|---|---|---|---|
| `user-guide/data-manager.md:6` | `"3.0"` | `note` | `version-latest` |
| `user-guide/view-designer.md:6` | `"3.0"` | `note` | `version-latest` |
| `user-guide/transformation-editor.md:5` | `"3.0"` | `note` | `version-latest` |
| `languages/overview.md:5` | `"3.0"` | `note` | `version-latest` |
| `languages/jjel.md:5` | `"3.0"` | `note` | `version-latest` |
| `languages/jjtl.md:5` | `"3.0"` | `note` | `version-latest` |
| `languages/jjscript.md:5` | `"3.0"` | `note` | `version-latest` |
| `reference/metamodel-annotations.md:5` | `"3.0"` | `note` | `version-latest` |
| `tutorials/tutorial-04-simulation.md:6` | `"3.0"` | `note` | `version-latest` |
| `user-guide/viewpoints.md:6` | `"1.5"` | `note` | `version-legacy` |
| `tutorials/tutorial-05-er-concrete-syntax.md:7` | `New` | `tip` | `version-new` |

**Divergenza (1) dal prompt**: le voci `3.0` sono **9**, non 11. Undici è il totale delle
pagine con un badge (9 + `1.5` + `New`). Il perimetro della Fase 2 è quindi 11 file `.md`
più `custom.css`, dodici in tutto.

**Divergenza (2) dal prompt**: «su `main` remoto i badge non esistono: vivono nel working
tree locale» è falso. I badge sono **committati** in `2bd30ec` («docs: version badges and
'Available since' lines on feature pages») sul branch `docs/2026-09-update`; il working tree
è **pulito** (`git status --porcelain` vuoto). Non esistono su `origin/main` perché il branch
non è ancora stato mergiato — `git show origin/main:src/content/docs/user-guide/data-manager.md`
non esiste affatto su `main`. Conseguenza operativa: la Fase 2 modifica file tracciati, non
lavoro in volo, e ogni modifica è revertibile con `git checkout HEAD -- <path>`.

Nota sui `variant`: `3.0` e `1.5` sono entrambi `note` (blu Starlight, non navy custom: il
tema non ridefinisce `--sl-color-blue`), `New` è `tip` (viola/porpora Starlight). Il «navy
pieno» descritto nel prompt è il `note` di Starlight su fondo `--sl-color-blue-low`.

## 4. Firma della config badge — `class` è supportata

`node_modules/@astrojs/starlight/schemas/badge.ts`:

```ts
const badgeBaseSchema = z.object({
  variant: z.enum(['note','danger','success','caution','tip','default']).default('default'),
  class: z.string().optional(),
});
const badgeSchema = z.object({ ...badgeBaseSchema.shape, text: z.string() });
```

La `class` arriva al DOM. `SidebarSublist.astro:26-33` la inoltra esplicitamente:

```astro
{entry.badge && (
  <Badge variant={entry.badge.variant} class={entry.badge.class} text={entry.badge.text} />
)}
```

e `user-components/Badge.astro` la stampa sull'elemento:

```astro
<span class:list={['sl-badge', variant, size, customClass]} {...attrs}>{text}</span>
```

Quindi il selettore `.sl-badge.version-latest` del prompt è corretto così com'è. La via
alternativa (override dei `--sl-badge-*`) **non serve**.

Due dettagli che il prompt non nomina e che valgono per la Fase 2:

- `size` ha default `small` e aggiunge la classe `small`, che porta un `font-size` proprio.
  Le regole nuove devono dichiarare `font-size` esplicito — il prompt già lo fa (0.6875rem).
- Gli stili di `Badge.astro` stanno in `@layer starlight.components`. `custom.css` è caricato
  da `customCss` **senza layer**, e il CSS non-layerizzato batte quello layerizzato a
  prescindere dalla specificità: le regole nuove vincono senza bisogno di `!important`.

## 5. Stato di `custom.css`

105 righe. **Nessuna regola su `.sl-badge`, nessun `--sl-badge-*`.** Contiene: token di tema
(`:root` con i valori scuri, `:root[data-theme='light']` con quelli chiari), il bottone
`.try-jjodel-btn`, e quattro blocchi di admonition (`note`, `tip`, `caution`, `danger`).

Convenzione dark-mode del file: i blocchi di admonition usano **base = light** più override
`:root[data-theme='dark']`, esattamente la forma chiesta dal prompt. `ThemeProvider.astro:13`
imposta sempre `document.documentElement.dataset.theme` a `'light'` o `'dark'` (script inline,
pre-paint): non esiste lo stato «nessun `data-theme`», quindi la forma base + override dark è
sicura.

Coerenza col design system: cyan `#0ea5e9` è già l'accento Jjodel; il file oggi non lo usa mai
(usa slate). I tre badge nuovi sarebbero la prima occorrenza di cyan in `custom.css` — è
voluto dal prompt, si segnala e basta.

## 6. Le tre classi sono libere

`command grep -rn "version-latest\|version-legacy\|version-new" src/` → nessun match,
exit status 1. Controllo positivo sullo stesso comando e sullo stesso albero:
`command grep -rc "variant" src/content/docs/languages/jjel.md` → 1. La ricerca ha segnale.

(`command grep` e non `grep`: in shell interattiva `grep` è un wrapper su `ugrep --ignore-files`
e salta i path ignorati — vedi `CLAUDE.md` §5 del repo `jjodel`.)

## 7. Rischi

1. **Basso** — `variant: default` cambia anche il colore *fuori* dalla sidebar? No: questi
   badge esistono solo nella voce di sidebar (il frontmatter `sidebar.badge` non è reso in
   pagina). Nessun altro consumo.
2. **Basso** — regressione visiva sugli altri badge: non ce ne sono. Le `.sl-badge` in pagina
   nascono solo dal componente `<Badge>` in MDX, e nessun `.mdx` lo usa (nessun match).
3. **Nullo sul build** — `class` è nello schema Zod di 0.38.3: nessun errore di validazione
   del content collection.
4. **Da verificare a occhio** — il contrasto di `version-legacy` (testo `#64748b` su
   trasparente, bordo `#cbd5e1`) è volutamente arretrato: su fondo chiaro sta intorno a
   4.5:1, al limite AA per testo piccolo. È una scelta di salienza, si segnala.

## 8. Domande aperte

1. **Dove va la traccia harness.** Il prompt cita `docs/prompts/`, `docs/discovery/` e
   `docs/claude-code-log.md`, che sono convenzioni del repo `jjodel`. `jjodel-docs` **non
   aveva** una `docs/`: è stata creata qui (`docs/discovery/`, `docs/prompts/`) seguendo alla
   lettera «creare la cartella se manca». Da decidere: la traccia di questa corsia resta in
   `jjodel-docs`, oppure prompt, referto ed entry di log vanno tutti in `~/jjodel/docs/`?
   La entry di log in particolare non ha una destinazione in questo repo.
2. **`version-legacy` è una classe o una convenzione?** Oggi la porta solo `1.5`. Quando `3.0`
   diventerà legacy servirà riscrivere 9 frontmatter. Alternativa non richiesta, si segnala e
   basta: una sola classe `version` più un attributo, con la corrente marcata a parte.
3. **Il branch è ahead 1** su `origin/docs/2026-09-update` (`2b52677`, untrack di
   `_to_delete`). Nessun impatto, ma il push finale porterà due commit.

## 9. Perimetro proposto per la Fase 2

Dodici file, tutti tracciati:

- `src/styles/custom.css` — le tre regole light + le tre dark, in coda, sotto
  `/* Sidebar version badges */`. Nessuna regola esistente toccata.
- I nove `.md` con `text: "3.0"` — `variant: note` → `variant: default`, più
  `class: version-latest`.
- `src/content/docs/user-guide/viewpoints.md` — `variant: default`, `class: version-legacy`.
- `src/content/docs/tutorials/tutorial-05-er-concrete-syntax.md` — `variant: tip` →
  `variant: default`, più `class: version-new`.

Il `text` non cambia in nessun file. `git add` per path, mai `git add .`.

**HARD STOP.** In attesa del GO per la Fase 2.
