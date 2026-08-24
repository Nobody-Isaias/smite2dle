import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { ClueImage } from './ClueImage'
import { ITEMS, ITEM_CDN_BASE } from './items'
import './App.css'

type God = {
  name: string
  pantheon: string
  className: string
  damage: 'Magical' | 'Physical'
  range: 'Melee' | 'Ranged'
  role: string
  roles?: string[]
  specializations?: string[]
  year: number
  traits: string[]
  backdropUrl?: string
  portraitUrl?: string
}

type FieldKey = keyof Pick<
  God,
  'pantheon' | 'role' | 'range' | 'damage' | 'specializations' | 'year'
>

type Mode = 'classic' | 'splash' | 'skin' | 'item' | 'summary'
type PlayMode = 'daily' | 'random'

type AbilityClue = {
  godName: string
  abilityName: string
  slot: string
  icon: string
  iconUrl?: string
  tone: number
}

type SkinClue = {
  godName: string
  skinName: string
  imageUrl: string
  variant?: string
}

type PortraitMap = Record<string, string>

const ROSTER: God[] = [
  {
    name: 'Aladdin',
    pantheon: 'Arabian',
    className: 'Assassin',
    damage: 'Physical',
    range: 'Melee',
    role: 'Jungle',
    year: 2025,
    traits: ['Mobility', 'Burst'],
  },
  {
    name: 'Amaterasu',
    pantheon: 'Japanese',
    className: 'Warrior',
    damage: 'Physical',
    range: 'Melee',
    role: 'Solo',
    year: 2024,
    traits: ['Aura', 'Sustain'],
  },
  {
    name: 'Anhur',
    pantheon: 'Egyptian',
    className: 'Hunter',
    damage: 'Physical',
    range: 'Ranged',
    role: 'Carry',
    year: 2024,
    traits: ['Displacement', 'Poke'],
  },
  {
    name: 'Anubis',
    pantheon: 'Egyptian',
    className: 'Mage',
    damage: 'Magical',
    range: 'Ranged',
    role: 'Mid',
    year: 2024,
    traits: ['Lifesteal', 'Root'],
  },
  {
    name: 'Ares',
    pantheon: 'Greek',
    className: 'Guardian',
    damage: 'Magical',
    range: 'Melee',
    role: 'Support',
    year: 2024,
    traits: ['Chains', 'Burn'],
  },
  {
    name: 'Athena',
    pantheon: 'Greek',
    className: 'Guardian',
    damage: 'Magical',
    range: 'Melee',
    role: 'Support',
    year: 2024,
    traits: ['Taunt', 'Global'],
  },
  {
    name: 'Bacchus',
    pantheon: 'Roman',
    className: 'Guardian',
    damage: 'Magical',
    range: 'Melee',
    role: 'Support',
    year: 2024,
    traits: ['Intoxicate', 'Disruption'],
  },
  {
    name: 'Bellona',
    pantheon: 'Roman',
    className: 'Warrior',
    damage: 'Physical',
    range: 'Melee',
    role: 'Solo',
    year: 2024,
    traits: ['Weapon Swap', 'Block'],
  },
  {
    name: 'Cernunnos',
    pantheon: 'Celtic',
    className: 'Hunter',
    damage: 'Physical',
    range: 'Ranged',
    role: 'Carry',
    year: 2024,
    traits: ['Stance', 'Polymorph'],
  },
  {
    name: 'Chaac',
    pantheon: 'Maya',
    className: 'Warrior',
    damage: 'Physical',
    range: 'Melee',
    role: 'Solo',
    year: 2024,
    traits: ['Rain', 'Sustain'],
  },
  {
    name: 'Cupid',
    pantheon: 'Roman',
    className: 'Hunter',
    damage: 'Physical',
    range: 'Ranged',
    role: 'Carry',
    year: 2024,
    traits: ['Hearts', 'Cripple'],
  },
  {
    name: 'Fenrir',
    pantheon: 'Norse',
    className: 'Assassin',
    damage: 'Physical',
    range: 'Melee',
    role: 'Jungle',
    year: 2024,
    traits: ['Leap', 'Execute Setup'],
  },
  {
    name: 'Geb',
    pantheon: 'Egyptian',
    className: 'Guardian',
    damage: 'Magical',
    range: 'Melee',
    role: 'Support',
    year: 2024,
    traits: ['Shield', 'Knockup'],
  },
  {
    name: 'Hades',
    pantheon: 'Greek',
    className: 'Mage',
    damage: 'Magical',
    range: 'Ranged',
    role: 'Mid',
    year: 2024,
    traits: ['Fear', 'Vortex'],
  },
  {
    name: 'Hercules',
    pantheon: 'Roman',
    className: 'Warrior',
    damage: 'Physical',
    range: 'Melee',
    role: 'Solo',
    year: 2024,
    traits: ['Displacement', 'Mitigation'],
  },
  {
    name: 'Hun Batz',
    pantheon: 'Maya',
    className: 'Assassin',
    damage: 'Physical',
    range: 'Melee',
    role: 'Jungle',
    year: 2024,
    traits: ['Fear', 'Crit'],
  },
  {
    name: 'Jing Wei',
    pantheon: 'Chinese',
    className: 'Hunter',
    damage: 'Physical',
    range: 'Ranged',
    role: 'Carry',
    year: 2025,
    traits: ['Airborne', 'Safety'],
  },
  {
    name: 'Khepri',
    pantheon: 'Egyptian',
    className: 'Guardian',
    damage: 'Magical',
    range: 'Melee',
    role: 'Support',
    year: 2025,
    traits: ['Revive', 'Peel'],
  },
  {
    name: 'Kukulkan',
    pantheon: 'Maya',
    className: 'Mage',
    damage: 'Magical',
    range: 'Ranged',
    role: 'Mid',
    year: 2024,
    traits: ['Tornado', 'Burst'],
  },
  {
    name: 'Loki',
    pantheon: 'Norse',
    className: 'Assassin',
    damage: 'Physical',
    range: 'Melee',
    role: 'Jungle',
    year: 2024,
    traits: ['Stealth', 'Backstab'],
  },
  {
    name: 'Mordred',
    pantheon: 'Arthurian',
    className: 'Warrior',
    damage: 'Physical',
    range: 'Melee',
    role: 'Solo',
    year: 2024,
    traits: ['Pressure', 'Duel'],
  },
  {
    name: 'Neith',
    pantheon: 'Egyptian',
    className: 'Hunter',
    damage: 'Physical',
    range: 'Ranged',
    role: 'Carry',
    year: 2024,
    traits: ['Global', 'Root'],
  },
  {
    name: 'Nu Wa',
    pantheon: 'Chinese',
    className: 'Mage',
    damage: 'Magical',
    range: 'Ranged',
    role: 'Mid',
    year: 2024,
    traits: ['Minions', 'Global'],
  },
  {
    name: 'Odin',
    pantheon: 'Norse',
    className: 'Warrior',
    damage: 'Physical',
    range: 'Melee',
    role: 'Solo',
    year: 2024,
    traits: ['Cage', 'Leap'],
  },
  {
    name: 'Pele',
    pantheon: 'Polynesian',
    className: 'Assassin',
    damage: 'Physical',
    range: 'Melee',
    role: 'Jungle',
    year: 2024,
    traits: ['Volcano', 'Speed'],
  },
  {
    name: 'Ra',
    pantheon: 'Egyptian',
    className: 'Mage',
    damage: 'Magical',
    range: 'Ranged',
    role: 'Mid',
    year: 2024,
    traits: ['Heal', 'Beam'],
  },
  {
    name: 'Sol',
    pantheon: 'Norse',
    className: 'Mage',
    damage: 'Magical',
    range: 'Ranged',
    role: 'Carry',
    year: 2024,
    traits: ['Heat', 'Escape'],
  },
  {
    name: 'Susano',
    pantheon: 'Japanese',
    className: 'Assassin',
    damage: 'Physical',
    range: 'Melee',
    role: 'Jungle',
    year: 2025,
    traits: ['Pull', 'Mobility'],
  },
  {
    name: 'Thanatos',
    pantheon: 'Greek',
    className: 'Assassin',
    damage: 'Physical',
    range: 'Melee',
    role: 'Jungle',
    year: 2024,
    traits: ['Execute', 'Scythe'],
  },
  {
    name: 'The Morrigan',
    pantheon: 'Celtic',
    className: 'Mage',
    damage: 'Magical',
    range: 'Ranged',
    role: 'Mid',
    year: 2025,
    traits: ['Transform', 'Stealth'],
  },
  {
    name: 'Thor',
    pantheon: 'Norse',
    className: 'Assassin',
    damage: 'Physical',
    range: 'Melee',
    role: 'Jungle',
    year: 2024,
    traits: ['Wall', 'Global'],
  },
  {
    name: 'Yemoja',
    pantheon: 'Yoruba',
    className: 'Guardian',
    damage: 'Magical',
    range: 'Ranged',
    role: 'Support',
    year: 2025,
    traits: ['Omi', 'Control'],
  },
  {
    name: 'Ymir',
    pantheon: 'Norse',
    className: 'Guardian',
    damage: 'Magical',
    range: 'Melee',
    role: 'Support',
    year: 2024,
    traits: ['Wall', 'Freeze'],
  },
  {
    name: 'Zeus',
    pantheon: 'Greek',
    className: 'Mage',
    damage: 'Magical',
    range: 'Ranged',
    role: 'Mid',
    year: 2024,
    traits: ['Charges', 'Burst'],
  },
]



const FALLBACK_RELEASE_BY_GOD: Record<string, number> = {
  Achilles: 2018,
  Agni: 2012,
  'Ah Puch': 2015,
  Aladdin: 2025,
  Amaterasu: 2016,
  Anhur: 2012,
  Anubis: 2012,
  Aphrodite: 2013,
  Ares: 2012,
  Athena: 2013,
  Bacchus: 2012,
  'Baron Samedi': 2018,
  Bellona: 2015,
  Cabrakan: 2014,
  Cernunnos: 2017,
  Chaac: 2013,
  'Cu Chulainn': 2017,
  Cupid: 2012,
  Danzaburou: 2020,
  Fenrir: 2013,
  Geb: 2014,
  Hades: 2012,
  Hecate: 2024,
  Hercules: 2012,
  'Hua Mulan': 2020,
  'Hun Batz': 2012,
  Ishtar: 2022,
  'Ix Chel': 2023,
  Izanami: 2016,
  'Jing Wei': 2016,
  Khepri: 2015,
  Kukulkan: 2012,
  Loki: 2012,
  Medusa: 2015,
  Mordred: 2024,
  Neith: 2013,
  Nemesis: 2014,
  'Nu Wa': 2013,
  Odin: 2012,
  Pele: 2018,
  Poseidon: 2013,
  Ra: 2012,
  Sobek: 2012,
  Sol: 2015,
  Susano: 2016,
  Thanatos: 2013,
  'The Morrigan': 2017,
  Thor: 2012,
  Ullr: 2014,
  Vulcan: 2013,
  Yemoja: 2019,
  Ymir: 2012,
  Zeus: 2012,
}

const FALLBACK_ROSTER: God[] = ROSTER.map((god) => ({
  ...god,
  roles: [god.role],
  year: FALLBACK_RELEASE_BY_GOD[god.name] ?? god.year,
}))

const FIELDS: { key: FieldKey; label: string }[] = [
  { key: 'pantheon', label: 'Pantheon' },
  { key: 'role', label: 'Role' },
  { key: 'range', label: 'Range' },
  { key: 'damage', label: 'Damage' },
  { key: 'specializations', label: 'Specialization' },
  { key: 'year', label: 'Year' },
]

const MODES: {
  key: Mode
  label: string
  eyebrow: string
  description: string
  minGuesses: number
}[] = [
  {
    key: 'classic',
    label: 'God',
    eyebrow: 'Daily God Mode',
    minGuesses: 1,
    description:
      'Guess the mystery Smite 2 god. Every guess reveals color-coded hints for pantheon, role, attack range, damage type, specialization, and release year.',
  },
  {
    key: 'splash',
    label: 'Ability',
    eyebrow: 'Daily Ability',
    minGuesses: 2,
    description:
      'Guess the god from the official Smite 2 ability icon, then identify the ability slot.',
  },
  {
    key: 'skin',
    label: 'Skin',
    eyebrow: 'Daily Skin',
    minGuesses: 2,
    description:
      'Guess the god from an official Smite 2 skin card, then identify the skin name.',
  },
  {
    key: 'item',
    label: 'Item',
    eyebrow: 'Daily Item',
    minGuesses: 1,
    description: 'Guess the Smite 2 item from its icon. Each wrong guess makes the icon clearer.',
  },
]

const SUMMARY_MODE = {
  key: 'summary' as Mode,
  label: 'Summary',
  eyebrow: 'Daily Summary',
  minGuesses: 0,
  description: 'Your results across every Smite2dle mode today.',
}

const ALL_MODES = [...MODES, SUMMARY_MODE]

const ABILITY_CLUES: AbilityClue[] = [
  { godName: 'Athena', abilityName: 'Confound', slot: 'Control', icon: 'Aegis', tone: 392 },
  { godName: 'Anhur', abilityName: 'Impale', slot: 'Line Shot', icon: 'Spear', tone: 330 },
  { godName: 'Anubis', abilityName: 'Mummify', slot: 'Root', icon: 'Wraps', tone: 247 },
  { godName: 'Ares', abilityName: 'No Escape', slot: 'Ultimate', icon: 'Chains', tone: 196 },
  { godName: 'Bellona', abilityName: 'Bludgeon', slot: 'Weapon', icon: 'Hammer', tone: 220 },
  { godName: 'Cernunnos', abilityName: 'Shifter of Seasons', slot: 'Stance', icon: 'Antlers', tone: 440 },
  { godName: 'Cupid', abilityName: 'Fields of Love', slot: 'Ultimate', icon: 'Heart', tone: 523 },
  { godName: 'Fenrir', abilityName: 'Ragnarok', slot: 'Ultimate', icon: 'Wolf', tone: 175 },
  { godName: 'Geb', abilityName: 'Stone Shield', slot: 'Protect', icon: 'Shield', tone: 262 },
  { godName: 'Hades', abilityName: 'Pillar of Agony', slot: 'Ultimate', icon: 'Vortex', tone: 147 },
  { godName: 'Khepri', abilityName: "Scarab's Blessing", slot: 'Ultimate', icon: 'Scarab', tone: 294 },
  { godName: 'Kukulkan', abilityName: 'Whirlwind', slot: 'Area', icon: 'Tornado', tone: 587 },
  { godName: 'Loki', abilityName: 'Vanish', slot: 'Stealth', icon: 'Dagger', tone: 659 },
  { godName: 'Neith', abilityName: 'World Weaver', slot: 'Ultimate', icon: 'Bow', tone: 494 },
  { godName: 'Nu Wa', abilityName: 'Fire Shards', slot: 'Ultimate', icon: 'Crystal', tone: 698 },
  { godName: 'Odin', abilityName: 'Ring of Spears', slot: 'Ultimate', icon: 'Cage', tone: 208 },
  { godName: 'Pele', abilityName: 'Volcanic Lightning', slot: 'Dash', icon: 'Flame', tone: 784 },
  { godName: 'Ra', abilityName: 'Searing Pain', slot: 'Beam', icon: 'Sun', tone: 880 },
  { godName: 'Thanatos', abilityName: 'Hovering Death', slot: 'Execute', icon: 'Scythe', tone: 165 },
  { godName: 'Thor', abilityName: 'Anvil of Dawn', slot: 'Ultimate', icon: 'Hammer', tone: 349 },
  { godName: 'Yemoja', abilityName: 'River Rebuke', slot: 'Wall', icon: 'Wave', tone: 415 },
  { godName: 'Ymir', abilityName: 'Ice Wall', slot: 'Wall', icon: 'Frost', tone: 233 },
  { godName: 'Zeus', abilityName: 'Detonate Charge', slot: 'Burst', icon: 'Bolt', tone: 740 },
]

const STORAGE_KEY_PREFIX = 'smite2dle:'
const ABILITY_SLOT_CHOICES = ['1', '2', '3', 'Ultimate', 'Passive']
const BACKDROP_URL = `${import.meta.env.BASE_URL}img/backdrop.webp`

function getUtcDayKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

// xmur3: string -> well-mixed 32-bit seed. A previous version summed character
// codes, which advances by exactly 1 per day and walked each pool in order.
function hashSeed(value: string) {
  let h = 1779033703 ^ value.length

  for (let i = 0; i < value.length; i += 1) {
    h = Math.imul(h ^ value.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }

  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return h >>> 0
  }
}

// mulberry32: small, fast, well-distributed seeded PRNG.
function seededRandom(seed: string) {
  let state = hashSeed(seed)()

  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Every daily answer derives from the date, so each mode draws from an
// independent stream and any past day can be reproduced from its date.
function daysSinceEpoch(dayKey: string) {
  return Math.floor(Date.parse(`${dayKey}T00:00:00Z`) / 86400000)
}

// Fisher-Yates driven by the seeded PRNG.
function seededShuffle<T>(items: T[], seed: string) {
  const deck = [...items]
  const random = seededRandom(seed)

  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }

  return deck
}

// Deals from a shuffled deck rather than picking independently at random, so a
// pool is fully exhausted before anything repeats. The deck is reshuffled each
// cycle, and everything still derives from the date, so past days stay
// reproducible.
function seededPick<T>(items: T[], scope: string, dayKey = getUtcDayKey()) {
  if (items.length === 0) {
    return undefined
  }

  const dayNumber = daysSinceEpoch(dayKey)
  const cycle = Math.floor(dayNumber / items.length)
  const position = ((dayNumber % items.length) + items.length) % items.length

  return seededShuffle(items, `${scope}:cycle:${cycle}`)[position]
}

function seededInt(scope: string, max: number, dayKey = getUtcDayKey()) {
  return Math.floor(seededRandom(`${dayKey}:${scope}`)() * max)
}

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function getDailyGod(mode: Mode, roster: God[], dayKey = getUtcDayKey()) {
  return seededPick(roster, `god:${mode}`, dayKey) ?? roster[0]
}

function getDailyAbilityFromList(mode: Mode, abilities: AbilityClue[], dayKey = getUtcDayKey()) {
  return seededPick(abilities, `ability:${mode}`, dayKey) ?? abilities[0]
}

function getDailySkinFromList(skins: SkinClue[], dayKey = getUtcDayKey()) {
  const eligibleSkins = getEligibleSkins(skins)
  return seededPick(eligibleSkins, 'skin', dayKey) ?? eligibleSkins[0]
}

function getEligibleSkins(skins: SkinClue[]) {
  const skinCountsByGod = skins.reduce<Record<string, number>>((counts, skin) => {
    counts[skin.godName] = (counts[skin.godName] ?? 0) + 1
    return counts
  }, {})
  const multiSkinPool = skins.filter((skin) => skinCountsByGod[skin.godName] > 1)
  return multiSkinPool.length > 0 ? multiSkinPool : skins
}

function getRandomItem<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

function getDailyItem(dayKey = getUtcDayKey()) {
  return seededPick(ITEMS, 'item', dayKey) ?? ITEMS[0]
}

function loadStoredGodGuesses(mode: Mode, dayKey: string, roster: God[] = FALLBACK_ROSTER) {
  try {
    const stored = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}${mode}:${dayKey}`)
    if (!stored) {
      return []
    }

    const names = JSON.parse(stored) as string[]
    return names
      .map((name) => roster.find((god) => god.name === name))
      .filter((god): god is God => Boolean(god))
  } catch {
    return []
  }
}

function saveGodGuesses(mode: Mode, dayKey: string, guesses: God[]) {
  window.localStorage.setItem(
    `${STORAGE_KEY_PREFIX}${mode}:${dayKey}`,
    JSON.stringify(guesses.map((guess) => guess.name)),
  )
}

function loadStoredTextGuesses(mode: string, dayKey: string) {
  try {
    const stored = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}${mode}:${dayKey}`)
    return stored ? (JSON.parse(stored) as string[]) : []
  } catch {
    return []
  }
}

function saveTextGuesses(mode: string, dayKey: string, guesses: string[]) {
  window.localStorage.setItem(`${STORAGE_KEY_PREFIX}${mode}:${dayKey}`, JSON.stringify(guesses))
}

function getGodRoles(god: God) {
  return god.roles && god.roles.length > 0 ? god.roles : [god.role]
}

function getGodSpecializations(god: God) {
  return god.specializations ?? []
}

function getListMatchClass(guessList: string[], answerList: string[]) {
  const shared = guessList.filter((entry) => answerList.includes(entry))

  if (
    shared.length > 0 &&
    shared.length === guessList.length &&
    shared.length === answerList.length
  ) {
    return 'correct'
  }

  return shared.length > 0 ? 'partial' : 'wrong'
}

function getMatchClass(guess: God, answer: God, key: FieldKey) {
  if (key === 'role') {
    return getListMatchClass(getGodRoles(guess), getGodRoles(answer))
  }

  if (key === 'specializations') {
    return getListMatchClass(getGodSpecializations(guess), getGodSpecializations(answer))
  }

  if (guess[key] === answer[key]) {
    return 'correct'
  }

  return 'wrong'
}

function formatValue(guess: God, answer: God, key: FieldKey) {
  if (key === 'role') {
    return getGodRoles(guess).join(', ')
  }

  if (key === 'specializations') {
    const specs = getGodSpecializations(guess)
    return specs.length > 0 ? specs.join(', ') : 'Unknown'
  }

  const value = guess[key]

  if (key !== 'year' || guess.year === answer.year) {
    return String(value ?? 'Unknown')
  }

  return `${value} ${guess.year < answer.year ? '▲' : '▼'}`
}

function renderCellValue(guess: God, answer: God, key: FieldKey) {
  if (key === 'year' && guess.year !== answer.year) {
    const isUp = guess.year < answer.year

    return (
      <>
        {guess.year}{' '}
        <span className={`yearArrow ${isUp ? 'up' : 'down'}`} aria-label={isUp ? 'higher' : 'lower'}>
          {isUp ? '▲' : '▼'}
        </span>
      </>
    )
  }

  if (key === 'specializations') {
    const list = getGodSpecializations(guess)

    if (list.length === 0) {
      return 'Unknown'
    }

    return (
      <span className="tagList">
        {list.map((entry) => (
          <span className="tag" key={entry}>
            {entry}
          </span>
        ))}
      </span>
    )
  }

  return formatValue(guess, answer, key)
}

function getGod(name: string, roster: God[]) {
  return roster.find((god) => normalize(god.name) === normalize(name))
}

function getAbilitySlotLabel(slot: string) {
  if (slot === 'Position 1') {
    return '1'
  }

  if (slot === 'Position 2') {
    return '2'
  }

  if (slot === 'Position 3') {
    return '3'
  }

  if (slot === 'Position 4') {
    return 'Ultimate'
  }

  return slot
}


type Snapshot = {
  version: number
  generatedAt: string
  gods: God[]
  abilities: AbilityClue[]
  skins: SkinClue[]
  portraits: PortraitMap
}

// The whole dataset now arrives as one small file built by
// scripts/build-snapshot.mjs, instead of scraping the wikis on every page load.
async function loadSnapshot(): Promise<Snapshot | undefined> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/snapshot.json`)

  if (!response.ok) {
    throw new Error(`Failed to load snapshot: ${response.status}`)
  }

  const snapshot = (await response.json()) as Snapshot

  return snapshot.gods?.length > 0 ? snapshot : undefined
}

function App() {
  const dayKey = getUtcDayKey()
  const gameRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<Mode>('classic')
  const [playMode, setPlayMode] = useState<PlayMode>('daily')
  const [input, setInput] = useState('')
  const [message, setMessage] = useState('')
  const [suppressSuggestions, setSuppressSuggestions] = useState(false)
  const [roster, setRoster] = useState<God[]>(FALLBACK_ROSTER)
  const [portraits, setPortraits] = useState<PortraitMap>({})
  const [officialAbilities, setOfficialAbilities] = useState<AbilityClue[]>([])
  const [officialSkins, setOfficialSkins] = useState<SkinClue[]>([])
  const [randomClassicAnswer, setRandomClassicAnswer] = useState<God>(() => getRandomItem(FALLBACK_ROSTER))
  const [randomSplashAnswer, setRandomSplashAnswer] = useState<AbilityClue>(() =>
    getRandomItem(ABILITY_CLUES),
  )
  const [randomSkinAnswer, setRandomSkinAnswer] = useState<SkinClue | undefined>()
  const [randomItemAnswer, setRandomItemAnswer] = useState(() => getRandomItem(ITEMS))
  const [classicGuesses, setClassicGuesses] = useState<God[]>(() =>
    loadStoredGodGuesses('classic', dayKey),
  )
  const [splashLog, setSplashLog] = useState<string[]>(() =>
    loadStoredTextGuesses('splash-log', dayKey),
  )
  const [skinLog, setSkinLog] = useState<string[]>(() => loadStoredTextGuesses('skin-log', dayKey))
  const [itemGuesses, setItemGuesses] = useState<string[]>(() =>
    loadStoredTextGuesses('item-log', dayKey),
  )

  const splashGuesses = useMemo(
    () =>
      splashLog
        .filter((entry) => entry.startsWith('god:'))
        .map((entry) => getGod(entry.slice(4), roster))
        .filter((god): god is God => Boolean(god)),
    [splashLog, roster],
  )
  const splashAbilityGuesses = useMemo(
    () => splashLog.filter((entry) => entry.startsWith('slot:')).map((entry) => entry.slice(5)),
    [splashLog],
  )
  const skinGuesses = useMemo(
    () =>
      skinLog
        .filter((entry) => entry.startsWith('god:'))
        .map((entry) => getGod(entry.slice(4), roster))
        .filter((god): god is God => Boolean(god)),
    [skinLog, roster],
  )
  const skinNameGuesses = useMemo(
    () => skinLog.filter((entry) => entry.startsWith('skin:')).map((entry) => entry.slice(5)),
    [skinLog],
  )

  const dailyClassicAnswer = useMemo(() => getDailyGod('classic', roster), [roster])
  const abilityPool = officialAbilities.length > 0 ? officialAbilities : ABILITY_CLUES
  const dailySplashAnswer = useMemo(() => getDailyAbilityFromList('splash', abilityPool), [abilityPool])
  const skinPool = officialSkins
  const dailySkinAnswer = useMemo(
    () => (skinPool.length > 0 ? getDailySkinFromList(skinPool) : undefined),
    [skinPool],
  )
  const dailyItemAnswer = useMemo(() => getDailyItem(), [])
  const classicAnswer = playMode === 'daily' ? dailyClassicAnswer : randomClassicAnswer
  const splashAnswer = playMode === 'daily' ? dailySplashAnswer : randomSplashAnswer
  const skinAnswer = playMode === 'daily' ? dailySkinAnswer : randomSkinAnswer
  const itemAnswer = playMode === 'daily' ? dailyItemAnswer : randomItemAnswer
  const activeMode = ALL_MODES.find((modeConfig) => modeConfig.key === mode) ?? ALL_MODES[0]

  const scrollToGame = () => {
    window.setTimeout(() => {
      gameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  useEffect(() => {
    let isMounted = true

    loadSnapshot()
      .then((snapshot) => {
        if (!isMounted || !snapshot) {
          return
        }

        if (snapshot.gods.length > 0) {
          setRoster(snapshot.gods)
          setRandomClassicAnswer(getRandomItem(snapshot.gods))
          setClassicGuesses(loadStoredGodGuesses('classic', dayKey, snapshot.gods))
        }

        if (snapshot.abilities.length > 0) {
          setOfficialAbilities(snapshot.abilities)
        }

        if (snapshot.skins.length > 0) {
          setOfficialSkins(snapshot.skins)
        }

        if (snapshot.portraits) {
          setPortraits(snapshot.portraits)
        }
      })
      .catch((error: unknown) => {
        console.warn(error)
      })

    return () => {
      isMounted = false
    }
  }, [dayKey])

  useEffect(() => {
    if (officialAbilities.length > 0) {
      setRandomSplashAnswer(getRandomItem(officialAbilities))
    }
  }, [officialAbilities])

  useEffect(() => {
    if (officialSkins.length > 0) {
      setRandomSkinAnswer(getRandomItem(getEligibleSkins(officialSkins)))
    }
  }, [officialSkins])

  const activeGuesses =
    mode === 'classic'
      ? classicGuesses
      : mode === 'splash'
        ? [...splashGuesses, ...splashAbilityGuesses]
        : mode === 'skin'
          ? [...skinGuesses, ...skinNameGuesses]
          : mode === 'item'
            ? itemGuesses
            : []

  const hasWon =
    mode === 'classic'
      ? classicGuesses.some((guess) => guess.name === classicAnswer.name)
      : mode === 'splash'
          ? splashAbilityGuesses.includes(getAbilitySlotLabel(splashAnswer.slot))
        : mode === 'skin'
          ? Boolean(skinAnswer && skinNameGuesses.includes(skinAnswer.skinName))
          : mode === 'item'
            ? itemGuesses.includes(itemAnswer.name)
            : false
  const splashGodSolved = splashGuesses.some((guess) => guess.name === splashAnswer.godName)
  const skinGodSolved = Boolean(
    skinAnswer && skinGuesses.some((guess) => guess.name === skinAnswer.godName),
  )

  const godSuggestions = input
    ? roster.filter((god) => normalize(god.name).includes(normalize(input))).slice(0, 7)
    : []
  const skinNameSuggestions =
    input && skinAnswer
      ? skinPool
          .filter(
            (skin) =>
              skin.godName === skinAnswer.godName &&
              normalize(skin.skinName).includes(normalize(input)),
          )
          .slice(0, 7)
      : []

  const itemSuggestions = input
    ? ITEMS.filter((item) => normalize(item.name).includes(normalize(input))).slice(0, 7)
    : []

  const changeMode = (nextMode: Mode) => {
    setMode(nextMode)
    setInput('')
    setMessage('')
    setSuppressSuggestions(false)
    scrollToGame()
  }

  const currentModeIndex = MODES.findIndex((modeConfig) => modeConfig.key === mode)
  const nextMode = currentModeIndex >= 0 && currentModeIndex < MODES.length - 1
    ? MODES[currentModeIndex + 1]
    : SUMMARY_MODE

  const goToNextMode = () => {
    changeMode(nextMode.key)
  }

  const modeResults = MODES.map((modeConfig) => {
    if (modeConfig.key === 'classic') {
      const solved = classicGuesses.some((guess) => guess.name === classicAnswer.name)
      return {
        ...modeConfig,
        solved,
        guesses: classicGuesses.length,
        answer: solved ? classicAnswer.name : undefined,
      }
    }

    if (modeConfig.key === 'splash') {
      const solved = splashAbilityGuesses.includes(getAbilitySlotLabel(splashAnswer.slot))
      return {
        ...modeConfig,
        solved,
        guesses: splashLog.length,
        answer: solved
          ? `${splashAnswer.godName} - ${splashAnswer.abilityName}`
          : undefined,
      }
    }

    if (modeConfig.key === 'skin') {
      const solved = Boolean(skinAnswer && skinNameGuesses.includes(skinAnswer.skinName))
      return {
        ...modeConfig,
        solved,
        guesses: skinLog.length,
        answer: solved ? `${skinAnswer?.godName} - ${skinAnswer?.skinName}` : undefined,
      }
    }

    const solved = itemGuesses.includes(itemAnswer.name)
    return {
      ...modeConfig,
      solved,
      guesses: itemGuesses.length,
      answer: solved ? itemAnswer.name : undefined,
    }
  })

  const unsolvedModes = modeResults.filter((result) => !result.solved)
  const allModesSolved = unsolvedModes.length === 0
  const totalGuesses = modeResults.reduce((sum, result) => sum + result.guesses, 0)
  const totalPar = modeResults.reduce((sum, result) => sum + result.minGuesses, 0)
  const totalMisses = modeResults.reduce(
    (sum, result) => sum + Math.max(0, result.guesses - result.minGuesses),
    0,
  )

  const rollRandomAnswers = (targetMode?: Mode) => {
    if (!targetMode || targetMode === 'classic') {
      setRandomClassicAnswer(getRandomItem(roster))
    }

    if (!targetMode || targetMode === 'splash') {
      setRandomSplashAnswer(getRandomItem(abilityPool))
    }

    if ((!targetMode || targetMode === 'skin') && skinPool.length > 0) {
      setRandomSkinAnswer(getRandomItem(getEligibleSkins(skinPool)))
    }

    if (!targetMode || targetMode === 'item') {
      setRandomItemAnswer(getRandomItem(ITEMS))
    }
  }

  const setGuessesForPlayMode = (nextPlayMode: PlayMode) => {
    setClassicGuesses(nextPlayMode === 'daily' ? loadStoredGodGuesses('classic', dayKey, roster) : [])
    setSplashLog(nextPlayMode === 'daily' ? loadStoredTextGuesses('splash-log', dayKey) : [])
    setSkinLog(nextPlayMode === 'daily' ? loadStoredTextGuesses('skin-log', dayKey) : [])
    setItemGuesses(nextPlayMode === 'daily' ? loadStoredTextGuesses('item-log', dayKey) : [])
  }

  const changePlayMode = (nextPlayMode: PlayMode) => {
    setPlayMode(nextPlayMode)
    setInput('')
    setMessage('')
    setSuppressSuggestions(false)
    setGuessesForPlayMode(nextPlayMode)

    if (nextPlayMode === 'random') {
      rollRandomAnswers()
    }

    scrollToGame()
  }

  const submitClassicGuess = (selectedName?: string) => {
    const guess = getGod(selectedName ?? input, roster)

    if (!guess) {
      setMessage('Pick a Smite 2 god from the roster.')
      return
    }

    if (classicGuesses.some((existingGuess) => existingGuess.name === guess.name)) {
      setMessage(`${guess.name} is already on the board.`)
      return
    }

    const nextGuesses = [guess, ...classicGuesses]
    setClassicGuesses(nextGuesses)
    if (playMode === 'daily') {
      saveGodGuesses('classic', dayKey, nextGuesses)
    }
    setInput('')
    setSuppressSuggestions(false)
    setMessage(guess.name === classicAnswer.name ? `Correct - today's god is ${classicAnswer.name}.` : '')
    scrollToGame()
  }

  const submitSplashGuess = (selectedName?: string) => {
    const guess = getGod(selectedName ?? input, roster)

    if (!guess) {
      setMessage('Pick a Smite 2 god from the roster.')
      return
    }

    if (splashGuesses.some((existingGuess) => existingGuess.name === guess.name)) {
      setMessage(`${guess.name} is already on the board.`)
      return
    }

    const nextLog = [`god:${guess.name}`, ...splashLog]
    setSplashLog(nextLog)
    if (playMode === 'daily') {
      saveTextGuesses('splash-log', dayKey, nextLog)
    }
    setInput('')
    setSuppressSuggestions(false)
    setMessage(
      guess.name === splashAnswer.godName
        ? `Correct god - now name the ability.`
        : '',
    )
    scrollToGame()
  }

  const submitSplashAbilityGuess = (slotLabel: string) => {
    if (!ABILITY_SLOT_CHOICES.includes(slotLabel)) {
      setMessage('Pick one of the ability slot buttons.')
      return
    }

    if (splashAbilityGuesses.includes(slotLabel)) {
      setMessage(`${slotLabel} is already on the board.`)
      return
    }

    const nextLog = [`slot:${slotLabel}`, ...splashLog]
    setSplashLog(nextLog)
    if (playMode === 'daily') {
      saveTextGuesses('splash-log', dayKey, nextLog)
    }
    setInput('')
    setSuppressSuggestions(false)
    setMessage(
      slotLabel === getAbilitySlotLabel(splashAnswer.slot)
        ? `Correct - ${splashAnswer.abilityName} is ${slotLabel}.`
        : '',
    )
    scrollToGame()
  }

  const submitSkinGuess = (selectedName?: string) => {
    if (!skinAnswer) {
      setMessage('Skin data is still loading.')
      return
    }

    const guess = getGod(selectedName ?? input, roster)

    if (!guess) {
      setMessage('Pick a Smite 2 god from the roster.')
      return
    }

    if (skinGuesses.some((existingGuess) => existingGuess.name === guess.name)) {
      setMessage(`${guess.name} is already on the board.`)
      return
    }

    const nextLog = [`god:${guess.name}`, ...skinLog]
    setSkinLog(nextLog)
    if (playMode === 'daily') {
      saveTextGuesses('skin-log', dayKey, nextLog)
    }
    setInput('')
    setSuppressSuggestions(false)
    setMessage(guess.name === skinAnswer.godName ? `Correct god - now name the skin.` : '')
    scrollToGame()
  }

  const submitSkinNameGuess = (selectedName?: string) => {
    if (!skinAnswer) {
      setMessage('Skin data is still loading.')
      return
    }

    const guess = selectedName ?? input
    const validGuess = skinPool.find(
      (skin) =>
        skin.godName === skinAnswer.godName &&
        normalize(skin.skinName) === normalize(guess),
    )

    if (!validGuess) {
      setMessage(`Pick one of ${skinAnswer.godName}'s skins from the suggestions.`)
      return
    }

    if (skinNameGuesses.includes(validGuess.skinName)) {
      setMessage(`${validGuess.skinName} is already on the board.`)
      return
    }

    const nextLog = [`skin:${validGuess.skinName}`, ...skinLog]
    setSkinLog(nextLog)
    if (playMode === 'daily') {
      saveTextGuesses('skin-log', dayKey, nextLog)
    }
    setInput('')
    setSuppressSuggestions(false)
    setMessage(validGuess.skinName === skinAnswer.skinName ? `Correct - ${skinAnswer.skinName}.` : '')
    scrollToGame()
  }

  const submitItemGuess = (selectedName?: string) => {
    const guess = selectedName ?? input
    const validGuess = ITEMS.find((item) => normalize(item.name) === normalize(guess))

    if (!validGuess) {
      setMessage('Pick a Smite 2 item from the suggestions.')
      return
    }

    if (itemGuesses.includes(validGuess.name)) {
      setMessage(`${validGuess.name} is already on the board.`)
      return
    }

    const nextGuesses = [validGuess.name, ...itemGuesses]
    setItemGuesses(nextGuesses)
    if (playMode === 'daily') {
      saveTextGuesses('item-log', dayKey, nextGuesses)
    }
    setInput('')
    setSuppressSuggestions(false)
    setMessage(validGuess.name === itemAnswer.name ? `Correct - ${itemAnswer.name}.` : '')
    scrollToGame()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (mode === 'classic') {
      submitClassicGuess()
    } else if (mode === 'splash') {
      submitSplashGuess()
    } else if (mode === 'item') {
      submitItemGuess()
    } else if (mode === 'skin') {
      if (skinGodSolved) {
        submitSkinNameGuess()
      } else {
        submitSkinGuess()
      }
    }
  }

  const resetDay = () => {
    setInput('')
    setMessage('')
    setSuppressSuggestions(false)

    if (playMode === 'daily') {
      window.localStorage.removeItem(`${STORAGE_KEY_PREFIX}classic:${dayKey}`)
      window.localStorage.removeItem(`${STORAGE_KEY_PREFIX}splash-log:${dayKey}`)
      window.localStorage.removeItem(`${STORAGE_KEY_PREFIX}skin-log:${dayKey}`)
      window.localStorage.removeItem(`${STORAGE_KEY_PREFIX}item-log:${dayKey}`)
    } else {
      rollRandomAnswers(mode)
    }

    if (mode === 'classic') {
      setClassicGuesses([])
    } else if (mode === 'splash') {
      setSplashLog([])
    } else if (mode === 'skin') {
      setSkinLog([])
    } else if (mode === 'item') {
      setItemGuesses([])
    }

    scrollToGame()
  }

  const renderSuggestions = () => {
    if (!input || hasWon || suppressSuggestions) {
      return null
    }

    if (mode === 'item') {
      return (
        <div className="suggestions" role="listbox" aria-label="Item suggestions">
          {itemSuggestions.map((item) => (
            <button
              className="suggestion"
              key={item.name}
              type="button"
              onClick={() => {
                setInput(item.name)
                setSuppressSuggestions(true)
              }}
            >
              {item.name}
            </button>
          ))}
        </div>
      )
    }

    if (mode === 'skin' && skinGodSolved) {
      return (
        <div className="suggestions" role="listbox" aria-label="Skin suggestions">
          {skinNameSuggestions.map((skin) => (
            <button
              className="suggestion"
              key={`${skin.godName}-${skin.skinName}`}
              type="button"
              onClick={() => {
                setInput(skin.skinName)
                setSuppressSuggestions(true)
              }}
            >
              {skin.skinName}
            </button>
          ))}
        </div>
      )
    }

    return (
      <div className="suggestions" role="listbox" aria-label="God suggestions">
        {godSuggestions.map((god) => (
          <button
            className="suggestion"
            key={god.name}
            type="button"
            onClick={() => {
              setInput(god.name)
              setSuppressSuggestions(true)
            }}
          >
            {god.name}
          </button>
        ))}
      </div>
    )
  }

  const renderClue = () => {
    if (mode === 'splash') {
      const wrongGuesses = splashGuesses.filter((guess) => guess.name !== splashAnswer.godName).length
      const revealLevel = splashGodSolved ? 3 : Math.min(wrongGuesses + splashAbilityGuesses.length, 3)
      const rotation = revealLevel >= 1 ? 0 : (seededInt('ability-rotation', 3, dayKey) + 1) * 90
      const isGreyscale = revealLevel < 2
      const showName = revealLevel >= 3 || hasWon

      return (
        <div className="abilityClueStage">
          <div className="abilityClueFrame">
            {splashAnswer.iconUrl ? (
              <ClueImage
                className={`abilityClueIcon ${splashGodSolved ? 'revealed' : ''}`}
                src={splashAnswer.iconUrl}
                greyscale={isGreyscale}
                rotation={rotation}
              />
            ) : (
              <div
                className={`abilityClueIcon abilityClueFallback ${splashGodSolved ? 'revealed' : ''}`}
                style={{
                  filter: isGreyscale ? 'grayscale(1)' : 'none',
                  transform: `rotate(${rotation}deg)`,
                }}
              >
                {splashAnswer.icon.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <p className="abilityClueName">{showName ? splashAnswer.abilityName : '???'}</p>
        </div>
      )
    }

    if (mode === 'skin') {
      if (!skinAnswer) {
        return <div className="emptyState">Loading official Smite 2 skins...</div>
      }

      const wrongGodGuesses = skinGuesses.filter((guess) => guess.name !== skinAnswer.godName).length
      const wrongSkinGuesses = skinNameGuesses.filter((guess) => guess !== skinAnswer.skinName).length
      const revealLevel = skinGodSolved ? 4 : Math.min(wrongGodGuesses + wrongSkinGuesses, 4)
      const blur = revealLevel >= 2 ? 0 : 15 - revealLevel * 10
      const isGreyscale = revealLevel < 4

      return (
        <div className="skinStage">
          <ClueImage
            className="skinImage"
            src={skinAnswer.imageUrl}
            blur={blur}
            greyscale={isGreyscale}
          />
        </div>
      )
    }

    if (mode === 'item') {
      const wrongGuesses = itemGuesses.filter((guess) => guess !== itemAnswer.name).length
      const revealLevel = hasWon ? 3 : Math.min(wrongGuesses, 3)
      const blur = revealLevel >= 3 ? 0 : revealLevel >= 1 ? 6 : 14
      const isGreyscale = revealLevel < 2

      return (
        <div className="itemStage">
          <ClueImage
            className="itemImage"
            src={`${ITEM_CDN_BASE}${itemAnswer.path}`}
            blur={blur}
            greyscale={isGreyscale}
          />
        </div>
      )
    }

    return null
  }

  const renderBoard = () => {
    if (mode === 'classic') {
      return classicGuesses.length === 0 ? (
        <div className="emptyState">No guesses yet. Start with your best Smite 2 read.</div>
      ) : (
        <div className="guessTable">
          <div className="guessHeader" aria-hidden="true">
            <span>God</span>
            {FIELDS.map((field) => (
              <span key={field.key}>{field.label}</span>
            ))}
          </div>
          {classicGuesses.map((guess) => (
            <article className="guessCard" key={guess.name}>
              <div className={`cell godCell ${guess.name === classicAnswer.name ? 'correct' : 'wrong'}`}>
                {portraits[guess.name] || guess.portraitUrl ? (
                  <img className="godPortrait" src={portraits[guess.name] ?? guess.portraitUrl} alt="" />
                ) : (
                  <span className="godPortrait portraitFallback" aria-hidden="true">
                    {guess.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <span className="cellValue">{guess.name}</span>
              </div>
              {FIELDS.map((field) => (
                <div className={`cell ${getMatchClass(guess, classicAnswer, field.key)}`} key={field.key}>
                  <span className="cellValue">{renderCellValue(guess, classicAnswer, field.key)}</span>
                </div>
              ))}
            </article>
          ))}
        </div>
      )
    }

    if (mode === 'splash') {
      const correctSlot = getAbilitySlotLabel(splashAnswer.slot)

      return (
        <div className="compactBoard">
          {splashLog.map((entry) => {
            const isGodEntry = entry.startsWith('god:')
            const value = entry.slice(isGodEntry ? 4 : 5)
            const isCorrect = isGodEntry ? value === splashAnswer.godName : value === correctSlot

            return (
              <div className={`compactGuess ${isCorrect ? 'correct' : 'wrong'}`} key={entry}>
                <strong>{value}</strong>
                <span>
                  {isGodEntry
                    ? isCorrect
                      ? 'Correct god'
                      : 'Wrong god'
                    : isCorrect
                      ? 'Correct slot'
                      : 'Wrong slot'}
                </span>
              </div>
            )
          })}
        </div>
      )
    }

    if (mode === 'skin') {
      if (!skinAnswer) {
        return null
      }

      return (
        <div className="compactBoard">
          {skinLog.map((entry) => {
            const isGodEntry = entry.startsWith('god:')
            const value = entry.slice(isGodEntry ? 4 : 5)
            const isCorrect = isGodEntry
              ? value === skinAnswer.godName
              : value === skinAnswer.skinName

            return (
              <div className={`compactGuess ${isCorrect ? 'correct' : 'wrong'}`} key={entry}>
                <strong>{value}</strong>
                <span>
                  {isGodEntry
                    ? isCorrect
                      ? 'Correct god'
                      : 'Wrong god'
                    : isCorrect
                      ? 'Correct skin'
                      : 'Wrong skin'}
                </span>
              </div>
            )
          })}
        </div>
      )
    }

    if (mode === 'item') {
      return (
        <div className="compactBoard">
          {itemGuesses.map((guess) => {
            const guessedItem = ITEMS.find((item) => item.name === guess)

            return (
              <div className={`compactGuess ${guess === itemAnswer.name ? 'correct' : 'wrong'}`} key={guess}>
                <span className="compactGuessMain">
                  {guessedItem ? (
                    <img className="compactGuessIcon" src={`${ITEM_CDN_BASE}${guessedItem.path}`} alt="" />
                  ) : null}
                  <strong>{guess}</strong>
                </span>
                <span>{guess === itemAnswer.name ? 'Correct item' : 'Wrong item'}</span>
              </div>
            )
          })}
        </div>
      )
    }

    return null
  }

  return (
    <main className="app" style={{ '--backdrop-image': `url("${BACKDROP_URL}")` } as CSSProperties}>
      <div className="shell">
        <section className="hero" aria-labelledby="title">
          <div className="heroCard">
            <div className="playModeSwitch" aria-label="Play mode">
              {(['daily', 'random'] as PlayMode[]).map((nextPlayMode) => (
                <button
                  className={playMode === nextPlayMode ? 'active' : ''}
                  key={nextPlayMode}
                  type="button"
                  onClick={() => changePlayMode(nextPlayMode)}
                >
                  {nextPlayMode}
                </button>
              ))}
            </div>
            <p className="eyebrow">{activeMode.eyebrow}</p>
            <h1 id="title">Smite2dle</h1>
            <nav className="modeTabs" aria-label="Game modes">
              {MODES.map((modeConfig) => (
                <button
                  className={`modeTab ${mode === modeConfig.key ? 'active' : ''}`}
                  key={modeConfig.key}
                  type="button"
                  onClick={() => changeMode(modeConfig.key)}
                >
                  {modeConfig.label}
                </button>
              ))}
              {allModesSolved ? (
                <button
                  className={`modeTab summaryTab ${mode === 'summary' ? 'active' : ''}`}
                  type="button"
                  onClick={() => changeMode('summary')}
                >
                  {SUMMARY_MODE.label}
                </button>
              ) : null}
            </nav>
            <p className="lede">{activeMode.description}</p>
            {mode === 'summary' ? (
              <div className="heroActions">
                <button
                  className="secondaryButton"
                  type="button"
                  onClick={() => changeMode('classic')}
                >
                  Back to {MODES[0].label}
                </button>
              </div>
            ) : playMode === 'random' ? (
              <div className="heroActions">
                <button className="secondaryButton" type="button" onClick={resetDay}>
                  Reroll {activeMode.label}
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <section className="layout">
          <div className="panel game" ref={gameRef}>
            {mode === 'summary' ? (
              <div className="summaryPanel">
                {allModesSolved ? (
                  <>
                    <p className="summaryHeadline">
                      {totalMisses === 0 ? 'Perfect round' : 'All modes complete'}
                    </p>
                    <p className="summarySub">
                      {totalGuesses} {totalGuesses === 1 ? 'guess' : 'guesses'}
                      {totalMisses === 0
                        ? ` - a perfect round, no wrong answers.`
                        : ` - ${totalMisses} wrong (${totalPar} is perfect).`}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="summaryHeadline">Not done yet</p>
                    <p className="summarySub">
                      Complete today's {unsolvedModes.map((result) => result.label).join(', ')}{' '}
                      {unsolvedModes.length === 1 ? 'quiz' : 'quizzes'} and come back here.
                    </p>
                  </>
                )}

                <div className="summaryList">
                  {modeResults.map((result) => (
                    <button
                      className={`summaryRow ${result.solved ? 'correct' : 'wrong'}`}
                      key={result.key}
                      type="button"
                      onClick={() => changeMode(result.key)}
                    >
                      <span className="summaryRowMain">
                        <span className="summaryIcon" aria-hidden="true">
                          {result.solved ? '✓' : '•'}
                        </span>
                        <span>
                          <strong>{result.label}</strong>
                          {result.answer ? <em>{result.answer}</em> : <em>Not solved yet</em>}
                        </span>
                      </span>
                      <span className="summaryScore">
                        {result.solved ? (
                          <>
                            <span className="summaryScoreValue">
                              {result.guesses}
                              <span className="summaryScorePar">/{result.minGuesses}</span>
                            </span>
                            <span className="summaryScoreNote">
                              {result.guesses <= result.minGuesses
                                ? 'perfect'
                                : `${result.guesses - result.minGuesses} wrong`}
                            </span>
                          </>
                        ) : (
                          <span className="summaryScoreValue">Open</span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>

                <p className="summaryFoot">
                  {playMode === 'daily'
                    ? 'New puzzles every day at midnight UTC.'
                    : 'Random mode - reroll any puzzle for more practice.'}
                </p>
              </div>
            ) : (
              <>
                {renderClue()}

                {hasWon ? (
              <div className="nextPanel">
                <span className="metaLabel">
                  Solved in {activeGuesses.length} {activeGuesses.length === 1 ? 'guess' : 'guesses'}
                </span>
                <button className="primaryButton nextButton" type="button" onClick={goToNextMode}>
                  Next: {nextMode.label} →
                </button>
              </div>
            ) : mode === 'splash' && splashGodSolved ? (
              <div className="slotChoicePanel">
                <span className="metaLabel">Pick {splashAnswer.godName}'s ability slot</span>
                <div className="slotChoices">
                  {ABILITY_SLOT_CHOICES.map((slotLabel) => (
                    <button
                      className="slotButton"
                      disabled={splashAbilityGuesses.includes(slotLabel)}
                      key={slotLabel}
                      type="button"
                      onClick={() => submitSplashAbilityGuess(slotLabel)}
                    >
                      {slotLabel}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <form className="inputRow" onSubmit={handleSubmit}>
                <label className="metaLabel" htmlFor="god-search">
                  {mode === 'item'
                    ? 'Guess the item'
                    : mode === 'skin' && skinGodSolved
                      ? `Guess ${skinAnswer?.godName}'s skin`
                      : 'Guess a god'}
                </label>
                <input
                  id="god-search"
                  className="guessInput"
                  autoComplete="off"
                  disabled={hasWon}
                  placeholder={
                    mode === 'item'
                      ? 'Enter Item Name'
                      : mode === 'skin' && skinGodSolved
                        ? 'Enter Skin Name'
                        : 'Enter God Name'
                  }
                  value={input}
                  onChange={(event) => {
                    setInput(event.target.value)
                    setSuppressSuggestions(false)
                  }}
                />
                <button className="primaryButton" disabled={hasWon} type="submit">
                  Guess
                </button>
                {renderSuggestions()}
              </form>
            )}

            <p className={`message ${hasWon || message.startsWith('Correct') ? 'win' : message ? 'error' : ''}`}>
              {message ||
                (hasWon
                  ? `Solved in ${activeGuesses.length} guesses.`
                  : playMode === 'daily'
                    ? 'Daily answer resets at midnight UTC.'
                    : 'Random mode: reroll anytime.')}
            </p>

            <div className="board" aria-live="polite">
              {renderBoard()}
            </div>
              </>
            )}
          </div>

        </section>

        <p className="footerNote">
          Unofficial fan-made prototype, built with AI assistance. Not affiliated with, endorsed by,
          or associated with Hi-Rez Studios or Titan Forge Games. SMITE and SMITE 2, including all
          god names, artwork, and related assets, are trademarks and copyright of Hi-Rez Studios.
          Game data and images are loaded from the community-run{' '}
          <a href="https://wiki.smite2.com/" rel="noreferrer" target="_blank">
            SMITE 2 Wiki
          </a>
          , the{' '}
          <a href="https://smite.fandom.com/" rel="noreferrer" target="_blank">
            SMITE Wiki
          </a>
          ,{' '}
          <a href="https://smitesource.com/" rel="noreferrer" target="_blank">
            SmiteSource
          </a>
          , and public Hi-Rez web endpoints, and may be incomplete or out of date. No affiliation is
          implied. Content is used for non-commercial, informational fan purposes.
        </p>
      </div>
    </main>
  )
}

export default App
