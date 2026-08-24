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

Game data is built into a single snapshot file rather than fetched from the wikis on
every page load. `scripts/build-snapshot.mjs` collects it and writes
`public/data/snapshot.json` (~119 KB raw, ~17 KB gzipped), which the app reads once at
startup.

- **[wiki.smite2.com](https://wiki.smite2.com/)** (MediaWiki API) — god roster, roles and
  specializations (via category membership), skins (parsed from the `SkinViewer` template),
  and skin art URLs. Primary source; most up to date.
- **[smite.fandom.com](https://smite.fandom.com/)** (MediaWiki API) — original SMITE release years.
- **`webcms.hirezstudios.com/smite2/api`** — official Hi-Rez CMS, used for ability icons and
  god portraits.
- **`cdn.smitesource.com`** — item icons. Item metadata is a bundled snapshot in `src/items.ts`
  because SmiteSource sits behind Cloudflare and cannot be scraped from the browser.

Images are hotlinked from the wiki and from Hi-Rez's own CDN rather than mirrored —
deliberately, to avoid rehosting their artwork. Both sit behind Cloudflare with long
cache lifetimes, so a player costs them a handful of already-cached requests. The one
image we do host is the site backdrop (`public/img/backdrop.webp`), because it loads on
every page view and never changes.

### Refreshing the snapshot

```powershell
npm run snapshot
```

The script is deliberately slow: requests are sequential with a delay (default 2.5s,
plus jitter) and it backs off on 429 or 5xx. A full rebuild is about 24 requests over
roughly a minute.

`.github/workflows/refresh-snapshot.yml` runs it every **Thursday at 04:00 UTC** — patches
land on Tuesday, so this gives the wiki community time to document the changes first. It
commits only when the data actually changed, and that commit triggers a redeploy. You can
also run it by hand from the Actions tab.

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
