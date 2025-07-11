/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import xmlBuilder from "xmlbuilder"
import TurndownService from 'turndown'
import calculateScore from "../calculateScore"
import calculateHintCost from "../calculateHintCost"
const turndownService = new TurndownService()
const hmacSha1 = require('../hmac')
import * as juiceShopOptions from '../options'

const { readFileSync } = require('fs')
const path = require('path')
let rtbTemplate: { categories: { [key: string]: any }, configuration?: any } = { categories: {} }

interface Challenge {
  key: string
  name: string
  description: string
  category: string
  difficulty: number
  hint?: string
  hintUrl?: string
}

interface RtbExportOptions {
    insertHints: string
    insertHintUrls: string
    insertHintSnippets: string
    ctfKey: string
    vulnSnippets: Record<string, string>
  }

function createRtbExport (
  challenges: Record<string, Challenge>,
  options: RtbExportOptions
) {
  const {
    insertHints,
    insertHintUrls,
    insertHintSnippets,
    ctfKey,
    vulnSnippets
  } = options

  function checkHints (challenge: Challenge): boolean {
    return (typeof challenge.hint === 'string' && challenge.hint.trim().length > 0 && insertHints !== juiceShopOptions.noTextHints)
  }

  interface ChallengeWithHintUrl extends Challenge {
    hintUrl?: string
  }

  function checkHintsURL (challenge: ChallengeWithHintUrl): boolean {
    return (typeof challenge.hintUrl === 'string' && challenge.hintUrl.trim().length > 0 && insertHintUrls !== juiceShopOptions.noHintUrls)
  }

  interface ChallengeWithKey {
    key: string
  }

  function checkHintsSnippet (challenge: ChallengeWithKey): boolean {
    return (typeof vulnSnippets[challenge.key] === 'string' && vulnSnippets[challenge.key].trim().length > 0 && insertHintSnippets !== juiceShopOptions.noHintSnippets)
  }

  interface CategoryTemplate {
    description: string
    image: string
  }

  function getDescription (category: string): string {
    if (!rtbTemplate.categories[category]) {
      return category
    }
    return (rtbTemplate.categories[category] as CategoryTemplate).description
  }

  interface Category {
    description: string
    image: string
  }

  function getImage (category: string): string {
    if (!rtbTemplate.categories[category]) {
      category = 'Miscellaneous'
    }
    return (rtbTemplate.categories[category] as Category).image
  }

  interface FlagElement {
    ele: (name: string, attributes?: Record<string, any>) => any
  }

  interface ChallengeWithAll extends Challenge {
    hint?: string
    hintUrl?: string
    key: string
    difficulty: number
    name: string
    description: string
    category: string
  }

  function insertHint (
    challenge: ChallengeWithAll,
    flag: FlagElement
  ): void {
    const includeHint: boolean = checkHints(challenge)
    const includeHintUrl: boolean = checkHintsURL(challenge)
    const includeHintSnippet: boolean = checkHintsSnippet(challenge)

    if (includeHint || includeHintUrl || includeHintSnippet) {
      const hints = flag.ele('hints')
      let count = 0
      if (includeHint) {
        const hint = hints.ele('hint')
        hint.ele('description', turndownService.turndown(challenge.hint as string))
        hint.ele('price', calculateHintCost(challenge, insertHints))
        count += 1
      }
      if (includeHintUrl) {
        const hint = hints.ele('hint')
        hint.ele('description', '[' + formatHintURL(challenge) +
          '](' + challenge.hintUrl + ')')
        hint.ele('price', calculateHintCost(challenge, insertHintUrls))
        count += 1
      }
      if (includeHintSnippet) {
        const hint = hints.ele('hint')
        hint.ele('description', turndownService.turndown(vulnSnippets[challenge.key]))
        hint.ele('price', calculateHintCost(challenge, insertHintSnippets))
        count += 1
      }
      hints.att({ count })
    }
  }

  function formatHintURL (challenge: ChallengeWithAll) {
    let hintText = challenge.description
    if (challenge.hintUrl && challenge.hintUrl.includes('#')) {
      const hintUrl = challenge.hintUrl
      hintText = hintUrl.substring(hintUrl.lastIndexOf('#') + 1, hintUrl.length).replace(/-/g, ' ')
      hintText = hintText.replace(/\b[a-z]|['_][a-z]|\B[A-Z]/g, function (x) {
        return x[0] === "'" || x[0] === '_' ? x : String.fromCharCode(x.charCodeAt(0) ^ 32)
      })
    }
    return hintText
  }

  interface BoxesElement {
    ele: (name: string, attributes?: Record<string, any>) => any
  }

  interface ChallengeWithCategory {
    category: string
    [key: string]: any
  }

  function insertBoxes (
      challenges: ChallengeWithCategory[],
      boxes: BoxesElement,
      category: string
    ): void {
      const box = boxes.ele('box', { gamelevel: '0' })
      box.ele('name', category)
      box.ele('category', category)
      box.ele('description', getDescription(category))
      box.ele('avatar', getImage(category))
      const flags = box.ele('flags')
      let i = 0
      for (const challenge of challenges) {
        if (category === challenge.category) {
          i += 1
          insertFlag(challenge as ChallengeForFlag, flags, i)
        }
      }
      flags.att({ count: i.toString() })
    }

  interface DifficultyText {
    (value: number): string
  }

  const difficultyText: DifficultyText = function (value: number): string {
    let difficulty = ''
    for (let i = 0; i < value; i++) {
      difficulty += '⭐️'
    }
    return difficulty
  }

  interface FlagElement {
    ele: (name: string, attributes?: Record<string, any>) => any
  }

  interface ChallengeForFlag {
    name: string
    description: string
    difficulty: number
    key: string
    hint?: string
    hintUrl?: string
    category: string
  }

function insertFlag(
  challenge: ChallengeForFlag,
  flags: FlagElement,
  order: number
): void {
  const flag = flags.ele("flag", { type: "static" });
  flag.ele("name", challenge.name);
  flag.ele(
    "description",
    turndownService.turndown(challenge.description) +
      " **Difficulty** " +
      difficultyText(challenge.difficulty)
  );
  flag.ele("token", hmacSha1(ctfKey, challenge.name));
  flag.ele("value", calculateScore(challenge.difficulty));
  flag.ele("order", order.toString());
  insertHint(challenge, flag);
}

  interface ChallengeCategory {
    category: string
    [key: string]: any
  }

  interface XmlElement {
    ele: (name: string, attributes?: Record<string, any>) => XmlElement
    up: () => XmlElement
  }

function insertCategories(
  challenges: Record<string, ChallengeCategory>,
  xmlRTB: XmlElement
): Set<string> {
  const categories = new Set<string>()
  for (const key in challenges) {
    categories.add(challenges[key].category)
  }
  if (categories.size > 0) {
    const categoriesXml = xmlRTB.ele('categories', { count: categories.size })
    // Convert to Array first
    Array.from(categories).forEach(category => {
      categoriesXml.ele('category').ele('category', category as any)
    })
    categoriesXml.up()
  }
  return categories
}

  interface XmlRTBElement {
    ele: (name: string, attributes?: Record<string, any>) => XmlRTBElement
    up: () => XmlRTBElement
  }

  interface CorporationElement {
    ele: (name: string, attributes?: Record<string, any>) => CorporationElement
  }

  interface BoxesElementReturn {
    ele: (name: string, attributes?: Record<string, any>) => BoxesElementReturn
  }

  function insertCorporation (
    categories: Set<string>,
    xmlRTB: XmlRTBElement
  ): BoxesElementReturn {
    const corporation: CorporationElement = xmlRTB.ele('corporations', { count: '1' }).ele('corporation')
    corporation.ele('name')
    return corporation.ele('boxes', { count: categories.size.toString() }) as BoxesElementReturn
  }

  interface Configuration {
    game_name: string
    org_footer: string
    ctf_tagline: string
    ctf_logo: string
    scoreboard_right_image: string
  }

  interface XmlRTBConfigElement {
    ele: (name: string, value?: any) => XmlRTBConfigElement
  }

  function insertConfiguration (xmlRTB: XmlRTBConfigElement): void {
    const config = xmlRTB.ele('configuration')
    const configuration: Configuration = rtbTemplate.configuration
    config.ele('game_name', configuration.game_name)
    config.ele('org_footer', configuration.org_footer)
    config.ele('ctf_tagline', configuration.ctf_tagline)
    config.ele('ctf_logo', configuration.ctf_logo)
    config.ele('scoreboard_right_image', configuration.scoreboard_right_image)
  }

  interface ChallengeWithDifficulty {
    difficulty: number
    category: string
    [key: string]: any
  }

  function sortByDifficulty (
    dict: Record<string, ChallengeWithDifficulty>
  ): ChallengeWithDifficulty[] {
    const sorted: ChallengeWithDifficulty[] = []
    let maxdifficulty: number = 5
    for (let i = 0; i <= maxdifficulty; i++) {
      for (const key in challenges) {
        if (Object.prototype.hasOwnProperty.call(challenges, key)) {
          const challenge: ChallengeWithDifficulty = challenges[key]
          if (challenge.difficulty === i) {
            sorted[sorted.length] = challenge
          }
          maxdifficulty = Math.max(challenge.difficulty, maxdifficulty)
        }
      }
    }
    return sorted
  }

  function loadTemplate() {
  const template = readFileSync(path.join(__dirname, '../../data/rtbImportTemplate.json'))
  return JSON.parse(template)
}

return new Promise((resolve, reject) => {
  try {
    rtbTemplate = loadTemplate()
    const xmlRTB = xmlBuilder.create('rootthebox', { version: '1.0', encoding: 'UTF-8' }).att('api', '1')
    insertConfiguration(xmlRTB)
    xmlRTB.ele('gamelevels', { count: '1' }).up()
    const categories = insertCategories(challenges, xmlRTB)
    const boxes = insertCorporation(categories, xmlRTB)
    const sortedChallenges = sortByDifficulty(challenges)
    
    // Convert Set to Array before iteration
    Array.from(categories).forEach(category => {
      insertBoxes(sortedChallenges, boxes, category)
    })
    
    resolve(xmlRTB.end({ pretty: true }))
  } catch (error) {
    if (error instanceof Error) {
      reject(new Error('Failed to generate challenge data! ' + error.message))
    } else {
      reject(new Error('Failed to generate challenge data!'))
    }
  }
})
}

export = createRtbExport
