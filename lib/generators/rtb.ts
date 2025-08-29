/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import xmlBuilder from 'xmlbuilder'
import TurndownService from 'turndown'
import calculateScore from '../calculateScore'
import calculateHintCost from '../calculateHintCost'
import INITIAL_RTB_TEMPLATE from '../../data/rtbImportTemplate.json'
import { type Challenge, type Hint, type BaseExportSettings } from '../types/types'
import hmacSha1 from '../hmac'
import { options as juiceShopOptions } from '../options'
import { readFileSync } from 'node:fs'
import * as path from 'node:path'

const turndownService = new TurndownService()
let rtbTemplate: { categories: Record<string, any>, configuration?: any } = { ...INITIAL_RTB_TEMPLATE }

async function createRtbExport (
  challenges: Record<string, Challenge>,
  hints: Hint[],
  options: BaseExportSettings
): Promise<string> {
  const {
    insertHints,
    ctfKey
  } = options

  interface CategoryTemplate {
    description: string
    image: string
  }

  function getDescription (category: string): string {
    if (rtbTemplate.categories[category] === undefined || rtbTemplate.categories[category] === null) {
      return category
    }
    return (rtbTemplate.categories[category] as CategoryTemplate).description
  }

  interface Category {
    description: string
    image: string
  }

  function getImage (category: string): string {
    if (rtbTemplate.categories[category] === undefined || rtbTemplate.categories[category] === null) {
      category = 'Miscellaneous'
    }
    return (rtbTemplate.categories[category] as Category).image
  }

  interface FlagElement {
    ele: (name: string, attributes?: Record<string, any>) => any
    att: (name: string, value: string) => any
  }

  function insertHintsEle (
    challenge: Challenge,
    hints: Hint[],
    flag: FlagElement
  ): void {
    if (insertHints !== juiceShopOptions.noHints && hints.filter(h => h.ChallengeId === challenge.id).length > 0) {
      const hintsEle = flag.ele('hints')
      let count = 0
      hints.filter(h => h.ChallengeId === challenge.id).forEach(hint => {
        const hintEle = hintsEle.ele('hint')
        hintEle.ele('description', turndownService.turndown(hint.text))
        hintEle.ele('price', calculateHintCost(challenge, insertHints))
        count += 1
      })
      hintsEle.att({ count })
    }
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
    const flags = box.ele('flags') as FlagElement
    let i = 0
    for (const challenge of challenges) {
      if (category === challenge.category) {
        i += 1
        insertFlag(challenge as Challenge, flags, i)
      }
    }
    flags.att('count', i.toString())
  }

  type DifficultyText = (value: number) => string

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

  function insertFlag (
    challenge: Challenge,
    flags: FlagElement,
    order: number
  ): void {
    const flag = flags.ele('flag', { type: 'static' })
    flag.ele('name', challenge.name)
    flag.ele(
      'description',
      turndownService.turndown(challenge.description) +
      ' **Difficulty** ' +
      difficultyText(challenge.difficulty)
    )
    flag.ele('token', hmacSha1(ctfKey, challenge.name))
    flag.ele('value', calculateScore(challenge.difficulty))
    flag.ele('order', order.toString())
    insertHintsEle(challenge, hints, flag as FlagElement)
  }

  interface ChallengeCategory {
    category: string
    [key: string]: any
  }

  interface XmlElement {
    ele: (name: string, attributes?: Record<string, any>) => XmlElement
    up: () => XmlElement
  }

  function insertCategories (
    challenges: Record<string, ChallengeCategory>,
    xmlRTB: XmlElement
  ): Set<string> {
    const categories = new Set<string>()
    for (const key in challenges) {
      categories.add(challenges[key].category)
    }
    if (categories.size > 0) {
      const categoriesXml = xmlRTB.ele('categories', { count: categories.size })
      Array.from(categories).forEach(category => {
        categoriesXml.ele('category').ele('category', { name: category })
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

  function loadTemplate (): typeof rtbTemplate {
    const template = readFileSync(path.join(__dirname, '../../data/rtbImportTemplate.json'))
    return JSON.parse(template.toString())
  }

  return await new Promise((resolve, reject) => {
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

export default createRtbExport
