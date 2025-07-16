/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import 'colors'
import calculateHintCost from '../calculateHintCost'
import calculateScore from '../calculateScore'
const { hash } = require('bcryptjs')
const { readFile } = require('fs')
const path = require('path')
const fbctfOptions = require('../options')
const hmac = require('../hmac')

interface GenerateRandomString {
  (length: number): string
}

const generateRandomString: GenerateRandomString = function (length: number): string {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }

  return text
}

function loadTemplate () {
  return new Promise((resolve, reject) => {
    const filename = path.join(__dirname, '../../data/fbctfImportTemplate.json')

    readFile(filename, { encoding: 'utf8' }, (err: NodeJS.ErrnoException | null, text: string) => {
      if (err) {
      reject(err)
      }
      resolve(JSON.parse(text))
    })
  })
}

async function createDummyUser () {
  const SALT_ROUNDS = 12
  return {
    name: generateRandomString(32),
    active: false,
    admin: false,
    protected: false,
    visible: false,
    password_hash: await hash(generateRandomString(32), SALT_ROUNDS),
    points: 0,
    logo: '4chan-2',
    data: {}
  }
}

interface Challenge {
  key: string
  name: string
  description: string
  difficulty: number
  hint: string
  hintUrl: string
}

interface Country {
  code: string
}

interface FbctfExportOptions {
  insertHints: string
  insertHintUrls: string
  insertHintSnippets: string
  ctfKey: string
  countryMapping: Record<string, Country>
  vulnSnippets: Record<string, string>
}

interface FbctfTemplate {
  teams: {
    teams: any[]
  }
  levels: {
    levels: any[]
  }
}

async function createFbctfExport (
  challenges: Challenge[],
  {
    insertHints,
    insertHintUrls,
    insertHintSnippets,
    ctfKey,
    countryMapping,
    vulnSnippets
  }: FbctfExportOptions
): Promise<FbctfTemplate> {
  const fbctfTemplate = await loadTemplate() as FbctfTemplate

  fbctfTemplate.teams.teams.push(await createDummyUser())

  // Add all challenges
  fbctfTemplate.levels.levels = challenges.map(({ key, name, description, difficulty, hint, hintUrl }) => {
    const country = countryMapping[key]
    if (!country) {
      console.warn(`Challenge "${name}" does not have a country mapping and will not appear in the CTF game!`.yellow)
      return false
    }

    const hintText: string[] = []
    if (insertHints !== fbctfOptions.noTextHints) {
      hintText.push(hint)
    }
    if (insertHintUrls !== fbctfOptions.noHintUrls) {
      hintText.push(hintUrl)
    }
    if (insertHintSnippets !== fbctfOptions.noHintSnippets && vulnSnippets[key]) {
      hintText.push(vulnSnippets[key])
    }

    return {
      type: 'flag',
      title: name,
      active: true,
      description,
      entity_iso_code: country.code,
      category: `Difficulty ${difficulty}`,
      points: calculateScore(difficulty),
      bonus: 0,
      bonus_dec: 0,
      bonus_fix: 0,
      flag: hmac(ctfKey, name),
      hint: hintText.join('\n\n'),
      penalty: calculateHintCost({ difficulty }, insertHints) + calculateHintCost({ difficulty }, insertHintUrls) + calculateHintCost({ difficulty }, insertHintSnippets),
      links: [],
      attachments: []
    }
  }).filter(Boolean)// Filter out levels without a proper country mapping.

  return fbctfTemplate
}

export = createFbctfExport
