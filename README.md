# Smite2dle

An unofficial, fan-made daily guessing game for SMITE 2, inspired by [smitedle.net](https://smitedle.net).

Four daily modes chained together, plus a summary page:

| Mode | Goal | Hints |
| --- | --- | --- |
| **God** | Guess the mystery god | Colour-coded grid: pantheon, role, range, damage, specialization, year |
| **Ability** | Guess the god, then the ability slot | Icon is rotated + greyscaled; filters lift with each guess |
| **Skin** | Guess the god, then the skin | Skin art starts blurred + greyscale, sharpens with each guess |
| **Item** | Guess the item | Icon starts heavily blurred + greyscale, sharpens over four stages |

Every mode has a **daily** answer (seeded by UTC date, identical for everyone, progress saved in
`localStorage`) and a **random** mode for free practice. Solving a mode reveals a Next button that
chains to the following mode; solving Item unlocks the hidden Summary page.

## Data sources

All game data is fetched live at runtime from public endpoints — there is no backend:

- **[wiki.smite2.com](https://wiki.smite2.com/)** (MediaWiki API) — god roster, roles and
  specializations (via category membership), skins (parsed from the `SkinViewer` template), and
  portrait/art image URLs. Primary source; most up to date.
- **[smite.fandom.com](https://smite.fandom.com/)** (MediaWiki API) — original SMITE release years.
- **`webcms.hirezstudios.com/smite2/api`** — official Hi-Rez CMS, used for ability icons.
- **`cdn.smitesource.com`** — item icons. Item metadata is a bundled snapshot in `src/items.ts`
  because SmiteSource sits behind Cloudflare and cannot be scraped from the browser.

Images are hotlinked rather than mirrored — deliberately, to avoid rehosting Hi-Rez artwork.

### Known limitation

The app currently fetches the full dataset (~24 requests, ~3 MB) on every page load. That is fine
for a handful of players, but would put unreasonable load on community-run wikis at scale. The plan
is to replace this with a periodically refreshed `data.json` snapshot (~30 KB) served from our own
storage.

## Local development

```powershell
npm install
npm run dev
```

Dev server runs at <http://127.0.0.1:5173/>.

```powershell
npm run lint    # oxlint
npm run build   # tsc -b && vite build -> dist/
```

## Deployment

Currently hosted as an **Azure Storage static website** in the `smite2dle_rg` resource group.

```powershell
.\deploy.ps1
```

Live at <https://smite2dle19696.z6.web.core.windows.net/>.

> **Note:** a tenant policy on this subscription has repeatedly reset `publicNetworkAccess` to
> `Disabled`, which silently takes the site offline. `deploy.ps1` detects this and re-enables it.
> Migrating to Azure Static Web Apps in a different tenant is the planned fix.

## Disclaimer

Unofficial fan-made prototype, built with AI assistance. Not affiliated with, endorsed by, or
associated with Hi-Rez Studios or Titan Forge Games. SMITE and SMITE 2, including all god names,
artwork, and related assets, are trademarks and copyright of Hi-Rez Studios. Content is used for
non-commercial, informational fan purposes.
