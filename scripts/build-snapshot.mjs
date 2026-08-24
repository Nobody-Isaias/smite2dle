// Builds public/data/snapshot.json so the app can load its whole dataset from
// one small file instead of scraping the wikis on every page load.
//
// Requests are sequential with a delay between them - the weekly job has no
// deadline, so it stays deliberately slow and gentle on the upstream sites.
//
//   node scripts/build-snapshot.mjs
//   node scripts/build-snapshot.mjs --delay 5000
//   node scripts/build-snapshot.mjs --out some/other/path.json

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { parse } from 'node-html-parser'

const args = process.argv.slice(2)
const argValue = (name, fallback) => {
  const index = args.indexOf(`--${name}`)
  return index === -1 ? fallback : args[index + 1]
}

const DELAY_MS = Number(argValue('delay', 2500))
const OUT_PATH = argValue('out', 'public/data/snapshot.json')
const USER_AGENT =
  'Smite2dle-Snapshot/1.0 (+https://github.com/Nobody-Isaias/smite2dle) weekly dataset build'

const WIKI = 'https://wiki.smite2.com/api.php'
const FANDOM = 'https://smite.fandom.com/api.php'
const CMS = 'https://webcms.hirezstudios.com/smite2/api'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let requestCount = 0

// Sequential, delayed, and retried with backoff. Never hammers a host.
async function politeFetch(url, { retries = 4 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    if (requestCount > 0) {
      // small jitter so we never look like a metronome
      await sleep(DELAY_MS + Math.floor(Math.random() * 500))
    }
    requestCount += 1

    try {
      const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })

      if (response.ok) {
        return response
      }

      if (response.status === 429 || response.status >= 500) {
        const wait = DELAY_MS * 2 ** (attempt + 1)
        console.warn(`  ${response.status} - backing off ${Math.round(wait / 1000)}s`)
        await sleep(wait)
        continue
      }

      throw new Error(`${response.status} ${response.statusText} for ${url}`)
    } catch (error) {
      if (attempt === retries) {
        throw error
      }
      const wait = DELAY_MS * 2 ** (attempt + 1)
      console.warn(`  ${error.message} - retrying in ${Math.round(wait / 1000)}s`)
      await sleep(wait)
    }
  }

  throw new Error(`giving up on ${url}`)
}

const fetchJson = async (url) => (await politeFetch(url)).json()

const ROLE_CATEGORIES = ['Solo', 'Jungle', 'Mid', 'Support', 'Carry']

const SPECIALIZATION_CATEGORIES = [
  'Area Control', 'Brawler', 'Buffs', 'Burst Damage', 'Constant Damage',
  'Crowd Control', 'Execute', 'Global', 'Healing', 'Lockdown', 'Mobile',
  'Mobility', 'Nuker', 'Pressure', 'Sharpshooter', 'Shielding', 'Slayer',
  'Sniper', 'Stance-switching', 'Stealth', 'Sustain', 'Tank', 'Utility',
]

const SPECIALIZATION_ALIASES = { Mobility: 'Mobile' }
const SPECIALIZATION_ORDER = SPECIALIZATION_CATEGORIES.filter(
  (category) => !SPECIALIZATION_ALIASES[category],
)

const MASTERY_SKIN_NAMES = ['Shadow', 'Onyx', 'Opal', 'Radiant', 'Golden', 'Legendary', 'Diamond']

function inferClass(role) {
  return (
    { Carry: 'Hunter', Mid: 'Mage', Support: 'Guardian', Solo: 'Warrior', Jungle: 'Assassin' }[
      role
    ] ?? 'Unknown'
  )
}

async function loadGodCategories() {
  const byGod = new Map()
  let clcontinue
  let guard = 0

  do {
    const url =
      `${WIKI}?action=query&generator=categorymembers&gcmtitle=Category:SMITE%202%20gods` +
      '&gcmlimit=500&prop=categories&cllimit=max&format=json' +
      (clcontinue ? `&clcontinue=${encodeURIComponent(clcontinue)}` : '')

    const body = await fetchJson(url)

    Object.values(body.query?.pages ?? {}).forEach((page) => {
      const name = page.title?.trim()
      if (!name) return

      const bucket = byGod.get(name) ?? new Set()
      page.categories?.forEach((category) => {
        const label = category.title?.replace(/^Category:/, '').replace(/\s+gods$/i, '').trim()
        if (label) bucket.add(label)
      })
      byGod.set(name, bucket)
    })

    clcontinue = body.continue?.clcontinue
    guard += 1
  } while (clcontinue && guard < 12)

  return byGod
}

async function loadGods() {
  console.log('gods: categories')
  const categoriesByGod = await loadGodCategories()

  console.log('gods: SMITE 2 roster')
  const s2Body = await fetchJson(`${WIKI}?action=parse&page=List_of_gods&prop=text&format=json`)

  console.log('gods: SMITE 1 release years')
  const s1Releases = new Map()
  try {
    const s1Body = await fetchJson(`${FANDOM}?action=parse&page=List_of_gods&prop=text&format=json`)
    parse(s1Body.parse?.text?.['*'] ?? '')
      .querySelectorAll('table tr')
      .forEach((row) => {
        const cells = row.querySelectorAll('td')
        const name = cells[1]?.text?.trim()
        const year = Number(cells[9]?.text?.trim().slice(0, 4))
        if (name && Number.isFinite(year)) s1Releases.set(name, year)
      })
  } catch (error) {
    console.warn(`  release years unavailable: ${error.message}`)
  }

  const document = parse(s2Body.parse?.text?.['*'] ?? '')

  return document
    .querySelectorAll('table.wikitable tr')
    .flatMap((row) => {
      const cells = row.querySelectorAll('td')
      const name = cells[1]?.text?.trim()
      if (!name) return []

      const attackText = cells[3]?.text ?? ''
      const listedRole = cells[4]?.text?.trim().split(/\s+/)[0] ?? 'Unknown'
      const categories = categoriesByGod.get(name)

      const roles = categories ? ROLE_CATEGORIES.filter((role) => categories.has(role)) : []

      const labels = categories
        ? new Set([...categories].map((c) => SPECIALIZATION_ALIASES[c] ?? c))
        : new Set()
      const specializations = SPECIALIZATION_ORDER.filter((label) => labels.has(label))

      const portraitSrc = cells[0]?.querySelector('img')?.getAttribute('src')
      const portraitUrl = portraitSrc?.startsWith('http')
        ? portraitSrc
        : portraitSrc
          ? `https://wiki.smite2.com${portraitSrc}`
          : undefined

      const s2Year = Number(cells[6]?.text?.trim().slice(0, 4))

      return {
        name,
        pantheon: cells[2]?.text?.trim() ?? 'Unknown',
        className: inferClass(listedRole),
        damage: attackText.includes('Magical') ? 'Magical' : 'Physical',
        range: attackText.includes('Ranged') ? 'Ranged' : 'Melee',
        role: roles[0] ?? listedRole,
        roles: roles.length > 0 ? roles : [listedRole],
        specializations,
        year: s1Releases.get(name) ?? (Number.isFinite(s2Year) ? s2Year : 2024),
        traits: [listedRole, inferClass(listedRole)],
        portraitUrl,
      }
    })
    .sort((left, right) => left.name.localeCompare(right.name))
}

async function loadAbilitiesAndPortraits() {
  console.log('abilities: Hi-Rez CMS')
  const abilityBody = await fetchJson(
    `${CMS}/gods/?lng=en-US&pagination%5Bpage%5D=1&pagination%5BpageSize%5D=100` +
      '&populate%5B0%5D=Ability&populate%5B1%5D=Ability.Icon',
  )

  const abilities = (abilityBody.data ?? []).flatMap((god) => {
    const godName = god.attributes?.Name
    if (!godName) return []

    return (god.attributes?.Ability ?? []).flatMap((ability) => {
      const abilityName = ability.Name
      const iconUrl = ability.Icon?.data?.attributes?.url
      if (!abilityName || !iconUrl) return []

      return [
        {
          godName,
          abilityName,
          slot: ability.Slot ?? 'Ability',
          icon: abilityName,
          iconUrl,
          tone: 440,
        },
      ]
    })
  })

  console.log('portraits: Hi-Rez CMS')
  const portraitBody = await fetchJson(
    `${CMS}/gods?fields%5B0%5D=Name&populate%5BPortrait%5D%5Bfields%5D%5B0%5D=url` +
      '&populate%5BPortrait%5D%5Bfields%5D%5B1%5D=formats&pagination%5BpageSize%5D=100',
  )

  const portraits = {}
  ;(portraitBody.data ?? []).forEach((god) => {
    const name = god.attributes?.Name
    const portrait = god.attributes?.Portrait?.data?.attributes
    const url = portrait?.formats?.thumbnail?.url ?? portrait?.url
    if (name && url) portraits[name] = url
  })

  return { abilities, portraits }
}

async function resolveImageUrls(fileNames) {
  const urls = new Map()
  const batchSize = 40
  const total = Math.ceil(fileNames.length / batchSize)

  for (let index = 0; index < fileNames.length; index += batchSize) {
    const batch = fileNames.slice(index, index + batchSize)
    console.log(`skins: images ${Math.floor(index / batchSize) + 1}/${total}`)

    const titles = batch.map((file) => `File:${file}`).join('|')
    const body = await fetchJson(
      `${WIKI}?action=query&titles=${encodeURIComponent(titles)}` +
        '&prop=imageinfo&iiprop=url&iiurlwidth=600&format=json',
    )

    Object.values(body.query?.pages ?? {}).forEach((page) => {
      const fileName = page.title?.replace(/^File:/, '')
      const url = page.imageinfo?.[0]?.thumburl ?? page.imageinfo?.[0]?.url
      if (fileName && url) urls.set(fileName, url)
    })
  }

  return urls
}

async function loadSkins(gods) {
  const godNames = gods.map((god) => god.name)
  const pending = []
  const batchSize = 20
  const total = Math.ceil(godNames.length / batchSize)

  for (let index = 0; index < godNames.length; index += batchSize) {
    const batch = godNames.slice(index, index + batchSize)
    console.log(`skins: wikitext ${Math.floor(index / batchSize) + 1}/${total}`)

    const body = await fetchJson(
      `${WIKI}?action=query&titles=${encodeURIComponent(batch.join('|'))}` +
        '&prop=revisions&rvprop=content&rvslots=main&format=json',
    )

    Object.values(body.query?.pages ?? {}).forEach((page) => {
      const godName = page.title
      const wikitext = page.revisions?.[0]?.slots?.main?.['*']
      if (!godName || !wikitext) return

      const skinNames = new Map()
      const skinImages = new Map()

      for (const match of wikitext.matchAll(/\|\s*(skin\d+)\s*=\s*([^\n|]+)/g)) {
        skinNames.set(match[1], match[2].trim())
      }
      for (const match of wikitext.matchAll(/\|\s*(skin\d+)_img\s*=\s*([^\n|]+)/g)) {
        skinImages.set(match[1], match[2].trim())
      }

      skinNames.forEach((skinName, key) => {
        const imageFile = skinImages.get(key)
        if (!skinName || !imageFile || MASTERY_SKIN_NAMES.includes(skinName)) return

        pending.push({
          godName,
          skinName: skinName === 'Default' ? `Standard ${godName}` : skinName,
          imageFile,
          cardFile: imageFile.replace(/\s*-\s*Full Art\.(png|jpg|jpeg)$/i, '.png'),
        })
      })
    })
  }

  const imageUrls = await resolveImageUrls([
    ...new Set(pending.flatMap((skin) => [skin.cardFile, skin.imageFile])),
  ])

  return pending.flatMap((skin) => {
    const imageUrl = imageUrls.get(skin.cardFile) ?? imageUrls.get(skin.imageFile)
    return imageUrl ? [{ godName: skin.godName, skinName: skin.skinName, imageUrl }] : []
  })
}

async function main() {
  const started = Date.now()
  console.log(`Building snapshot (${DELAY_MS}ms between requests)\n`)

  const gods = await loadGods()
  console.log(`  ${gods.length} gods\n`)

  const { abilities, portraits } = await loadAbilitiesAndPortraits()
  console.log(`  ${abilities.length} abilities, ${Object.keys(portraits).length} portraits\n`)

  const skins = await loadSkins(gods)
  console.log(`  ${skins.length} skins\n`)

  if (gods.length === 0 || abilities.length === 0 || skins.length === 0) {
    throw new Error('refusing to write an incomplete snapshot')
  }

  const snapshot = {
    version: 1,
    generatedAt: new Date().toISOString(),
    gods,
    abilities,
    skins,
    portraits,
  }

  await mkdir(dirname(OUT_PATH), { recursive: true })
  await writeFile(OUT_PATH, `${JSON.stringify(snapshot)}\n`, 'utf8')

  const seconds = Math.round((Date.now() - started) / 1000)
  const kb = Math.round(Buffer.byteLength(JSON.stringify(snapshot)) / 1024)
  console.log(`Wrote ${OUT_PATH} - ${kb} KB, ${requestCount} requests, ${seconds}s`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
