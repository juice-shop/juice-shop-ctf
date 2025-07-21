/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { it, describe } from 'node:test'
import assert from 'node:assert/strict'
import calculateScore from '../../lib/calculateScore'
import generateData from "../../lib/generators/fbctf"
import { noTextHints, noHintUrls , noHintSnippets, freeTextHints, paidTextHints, paidHintUrls } from '../../lib/options'

interface Challenge {
  key: string
  name: string
  description: string
  difficulty: number
  category: string
  hint: string
  hintUrl: string
}

interface CountryMapping {
  [key: string]: { code: string }
}

interface FbctfOptions {
  insertHints: string
  insertHintUrls: string
  insertHintSnippets: string
  ctfKey: string
  countryMapping: CountryMapping
  vulnSnippets: Record<string, string>
}

interface ChallengeMapping {
  type: string
  title: string
  active: boolean
  description: string
  entity_iso_code: string
  category: string
  points: number
  bonus: number
  bonus_dec: number
  bonus_fix: number
  flag: string
  hint: string
  penalty: number
  links: any[]
  attachments: any[]
}

const createChallenge = (key: string, name: string, difficulty: number, hint: string = '', hintUrl: string = ''): Challenge => ({
  key,
  name,
  description: name.toUpperCase(),
  difficulty,
  category: '1',
  hint,
  hintUrl
})

const createChallengeMapping = (
  title: string,
  code: string,
  difficulty: number,
  flag: string,
  hint = '',
  penalty = 0
): ChallengeMapping => ({
  type: 'flag',
  title,
  active: true,
  description: title.toUpperCase(),
  entity_iso_code: code,
  category: `Difficulty ${difficulty}`,
  points: calculateScore(difficulty),
  bonus: 0,
  bonus_dec: 0,
  bonus_fix: 0,
  flag,
  hint,
  penalty,
  links: [],
  attachments: []
})

const countryMapping: CountryMapping = { 
  key1: { code: 'CA' }, 
  key2: { code: 'FR' } 
}

const defaultOptions: FbctfOptions = { 
  insertHints: noTextHints, 
  insertHintUrls: noHintUrls, 
  insertHintSnippets: noHintSnippets,
  ctfKey: '', 
  countryMapping, 
  vulnSnippets: {} 
}

const createOptions = (overrides: Partial<FbctfOptions> = {}): FbctfOptions => ({
  ...defaultOptions,
  ...overrides
})

describe('Generated FBCTF data', () => {
  const challenge1 = createChallenge('key1', 'c1', 1, 'hint1', 'https://hint1.com')
  const challenge2 = createChallenge('key2', 'c2', 3, 'hint2', 'https://hint2.com')

  const mapping1 = createChallengeMapping('c1', 'CA', 1, '958c64658383140e7d08d5dee091009cc0eafc1f')
  const mapping2 = createChallengeMapping('c2', 'FR', 3, '49294e8b829f5b053f748facad22825ccb4bf420')

  it('should add levels for each challenge', async () => {
    const result = await generateData([challenge1, challenge2], createOptions())
    assert.deepEqual(result.levels.levels, [mapping1, mapping2])
  })

  it('should not add challenges without a country mapping', async () => {
    const unmapped = createChallenge('unmapped', 'c3', 2)

    const result = await generateData([challenge1, unmapped], createOptions())
    assert.deepEqual(result.levels.levels, [mapping1])
  })

  it('should respect hint insertion options', async () => {
    const result = await generateData([challenge1], createOptions({ insertHints: freeTextHints }))
    assert.deepEqual(result.levels.levels, [
      { ...mapping1, hint: 'hint1' }
    ])
  })

  it('should respect hint penalty costs insertion options', async () => {
    const result = await generateData([challenge1], createOptions({ insertHints: paidTextHints }))
    assert.deepEqual(result.levels.levels, [
      { ...mapping1, hint: 'hint1', penalty: 10 }
    ])
  })

  it('should respect hintUrl penalty costs insertion options', async () => {
    const result = await generateData([challenge1], createOptions({ insertHintUrls: paidHintUrls }))
    assert.deepEqual(result.levels.levels, [
      { ...mapping1, hint: 'https://hint1.com', penalty: 20 }
    ])
  })

  it('should merge hint & hintUrl together (considering hint text and penalty)', async () => {
    const result = await generateData([challenge1], createOptions({ 
      insertHints: paidTextHints, 
      insertHintUrls: paidHintUrls 
    }))
    
    assert.deepEqual(result.levels.levels, [
      {
        ...mapping1,
        hint: 'hint1\n\nhttps://hint1.com',
        penalty: 30
      }
    ])
  })

  it('should add a dummy user to the export', async () => {
    const report = await generateData([], createOptions())
    assert.equal(report.teams.teams.length, 1)
  })
})