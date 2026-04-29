# SJC AI Starter Kit

A lightweight internal static website supporting SJC Media's AI literacy program.
Built for the May 6, 2026 AI Show & Tell and designed for ongoing use as the team's shared AI playbook.

## What's inside

| Page | Purpose |
|---|---|
| `index.html` | Homepage with hero, value cards, how-to steps, and featured recipes |
| `recipes.html` | Full recipe library with search and filters |
| `prompts.html` | 50+ copy-ready prompts with search and filters |
| `tools.html` | Tool chooser (task-first selector) + full tool directory |
| `aha-archive.html` | Team learning examples — small wins and useful failures |
| `submit.html` | Copy-paste templates for contributing recipes, ahas, and tool notes |
| `responsible-use.html` | SJC's responsible AI use guidelines |

## How to run locally

Because `fetch()` does not work from `file://` in most browsers, use a local server:

```bash
cd sjc-ai-starter-kit
python3 -m http.server 8000
```

Then open: **http://localhost:8000**

Alternatively, any local server works (VS Code Live Server extension, Node's `http-server`, etc.).

## How to update content

All content lives in `data/` as plain JSON files. No build step needed.

| File | What it controls |
|---|---|
| `data/recipes.json` | All recipes — add a new object to the array |
| `data/prompts.json` | All prompts — add a new object to the array |
| `data/tools.json` | Tool directory — add or update tool entries |
| `data/aha-examples.json` | Aha archive entries |

### Adding a recipe

Copy an existing entry in `recipes.json` and fill in all fields. Required fields:
`id`, `title`, `pillar`, `team`, `tools`, `status`, `difficulty`, `timeSaved`, `useWhen`, `inputsNeeded`, `steps`, `prompt`, `humanCheck`

Set `"featured": true` to show on the homepage (limit to 6 featured recipes).

### Adding a prompt

Copy an existing entry in `prompts.json`. Required fields:
`id`, `title`, `category`, `tools`, `difficulty`, `bestFor`, `promptText`, `howToUse`, `humanCheck`

`followUp` is optional but recommended.

## Hosting options

### Option A — Google Sites embed (recommended)
Host the static files on an approved internal location (Google Drive public folder, shared hosting, or internal server), then embed the URL in a Google Sites page using the **Embed** feature.

**Note:** Google Sites does not natively serve multi-file static sites. The files need to be hosted externally and embedded.

### Option B — Link from Google Sites
Host files externally and link directly from your Google Site navigation or page sections. Simple and low-maintenance.

### Option C — Recreate in Google Sites
Use the JSON data files as the source of truth and manually recreate the recipe and prompt content in Google Sites using:
- Page sections with collapsible groups
- Buttons for navigation
- Embedded Google Sheets for the recipe/prompt library (with filtering via Sheets)

This is more manual but keeps everything inside Google's ecosystem.

### Low-budget hosting options
- **Google Drive** — Upload the folder, make it publicly accessible, and link directly (note: Google Drive does not serve HTML as web pages by default)
- **GitHub Pages** — Free static hosting if SJC has a GitHub org
- **Netlify / Vercel** — Free tier static hosting; drag-and-drop deploy
- **Internal web server** — If SJC has any internal hosting, this is the cleanest option

## Content governance

**Who can submit:** Anyone at SJC can submit a recipe, aha, or tool note via the Submit page templates.

**Who reviews:** Data & Analytics Team reviews submissions weekly and adds approved entries to the JSON files.

**Review criteria:**
- Prompt is copy-ready with bracketed variables
- Human check steps are included
- No confidential client data or sensitive information
- Meets responsible-use guidelines

## Versioning

- Current version: **0.1 — May 2026**
- Update the version string in the footer of each HTML file when releasing a new version
- Consider tagging git releases when significant content batches are added
- Major content additions (e.g. new team sections, new tool integrations) warrant a minor version bump

## No external dependencies

This site uses no CDNs, external fonts, tracking scripts, or analytics. It works fully offline once the files are downloaded.
