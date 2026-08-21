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

Hosted on **Azure Static Web Apps** (Free tier), app `smite2dle` in the `smite2dle_rg`
resource group. Live at <https://proud-forest-0ae525d03.7.azurestaticapps.net/>.

Pushes to `main` build and deploy automatically via GitHub Actions. Pull requests
deploy to a `pr-<number>` preview environment. To publish by hand:

```powershell
.\deploy.ps1
```

### Note on the deployment token

`StaticSitesClient` copies the deployment token straight into an HTTP
`Authorization` header, so **any trailing whitespace in the
`AZURE_STATIC_WEB_APPS_API_TOKEN` secret makes every deployment fail**:

```
System.FormatException: The format of value 'token ***\n' is invalid.
  at System.Net.Http.Headers.HttpHeaderParser.ParseValue(...)
  at StaticSitesClient.Helpers.ContentDistributionClient.InitializeClient(...)
```

Only the newest build of `StaticSitesClient` prints that detail; the stable and
backup builds report just `An unknown exception has occurred`, which makes the
failure look environmental. The workflow trims the token before use, so it no
longer matters how the secret was pasted.

## Disclaimer

Unofficial fan-made prototype, built with AI assistance. Not affiliated with, endorsed by, or
associated with Hi-Rez Studios or Titan Forge Games. SMITE and SMITE 2, including all god names,
artwork, and related assets, are trademarks and copyright of Hi-Rez Studios. Content is used for
non-commercial, informational fan purposes.
