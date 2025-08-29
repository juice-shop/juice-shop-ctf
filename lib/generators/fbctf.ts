/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import 'colors'
import calculateHintCost from '../calculateHintCost'
import calculateScore from '../calculateScore'
import FBCTF_TEMPLATE from '../../data/fbctfImportTemplate.json'
import { hash } from 'bcryptjs'
import { options as juiceShopOptions } from '../options'
import hmacSha1 from '../hmac'
import type { BaseExportSettings, Challenge, FbctfTemplate, Hint } from '../types/types'

type GenerateRandomString = (length: number) => string

const generateRandomString: GenerateRandomString = function (length: number): string {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }

  return text
}

async function createDummyUser (): Promise<{
  name: string
  active: boolean
  admin: boolean
  protected: boolean
  visible: boolean
  password_hash: string
  points: number
  logo: string
  data: Record<string, unknown>
}> {
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

async function createFbctfExport (
  challenges: Challenge[],
  hints: Hint[],
  {
    insertHints,
    ctfKey,
    countryMapping
  }: BaseExportSettings
): Promise<FbctfTemplate> {
  const fbctfTemplate: FbctfTemplate = FBCTF_TEMPLATE

  fbctfTemplate.teams.teams.push(await createDummyUser())

  // Add all challenges
  fbctfTemplate.levels.levels = challenges.map(({ id, key, name, description, difficulty }) => {
    const country = countryMapping[key]
    if (country === undefined || country === null) {
      console.warn(`Challenge "${name}" does not have a country mapping and will not appear in the CTF game!`.yellow)
      return false
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
      flag: hmacSha1(ctfKey, name),
      hint: insertHints !== juiceShopOptions.noHints ? hints.filter(hint => hint.ChallengeId === id).join('\n\n') : '',
      penalty: calculateHintCost({ difficulty }, insertHints) * hints.filter(hint => hint.ChallengeId === id).length,
      links: [],
      attachments: []
    }
  }).filter(Boolean)// Filter out levels without a proper country mapping.

  return fbctfTemplate
}

export default createFbctfExport
