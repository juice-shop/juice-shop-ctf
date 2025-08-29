/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { it, describe } from 'node:test'
import assert from 'node:assert/strict'
import calculateScore from '../../lib/calculateScore'
import generateData from "../../lib/generators/fbctf"
import {options as juiceShopOptions} from '../../lib/options'
import {CountryMapping, Hint} from '../../lib/types/types'
import { Challenge , BaseExportSettings } from '../../lib/types/types'

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

const createChallenge = (key: string, name: string, difficulty: number): Challenge => ({
  key,
  name,
  description: name.toUpperCase(),
  difficulty,
  category: '1',
  hasCodingChallenge: false,
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
const defaultOptions: BaseExportSettings = {
  insertHints: juiceShopOptions.noHints,
  ctfKey: '',
  countryMapping,
  outputLocation: '',
  juiceShopUrl: ''
}

const createOptions = (overrides: Partial<BaseExportSettings> = {}): BaseExportSettings => ({
  ...defaultOptions,
  ...overrides
})

describe('Generated FBCTF data', () => {
  const challenge1 = createChallenge('key1', 'c1', 1)
  const challenge2 = createChallenge('key2', 'c2', 3)

  const hint1a = { ChallengeId: 1, text: 'h1a', id: 1, order: 1, unlocked: false }
  const hint1b = { ChallengeId: 1, text: 'h1b', id: 1, order: 2, unlocked: false }

  const mapping1 = createChallengeMapping('c1', 'CA', 1, '958c64658383140e7d08d5dee091009cc0eafc1f')
  const mapping2 = createChallengeMapping('c2', 'FR', 3, '49294e8b829f5b053f748facad22825ccb4bf420')

  it('should add levels for each challenge', async () => {
    const result = await generateData([challenge1, challenge2], [], createOptions())
    assert.deepEqual(result.levels.levels, [mapping1, mapping2])
  })

  it('should not add challenges without a country mapping', async () => {
    const unmapped = createChallenge('unmapped', 'c3', 2)

    const result = await generateData([challenge1, unmapped], [], createOptions())
    assert.deepEqual(result.levels.levels, [mapping1])
  })

  it('should respect hint insertion options', async () => {
    const result = await generateData([challenge1], [hint1a], createOptions({ insertHints: juiceShopOptions.freeHints }))
    assert.deepEqual(result.levels.levels, [
      { ...mapping1, hint: 'h1a' }
    ])
  })

  it('should respect hint penalty costs insertion options', async () => {
    const result = await generateData([challenge1], [hint1a], createOptions({ insertHints: juiceShopOptions.paidHints }))
    assert.deepEqual(result.levels.levels, [
      { ...mapping1, hint: 'h1a', penalty: 10 }
    ])
  })

  it('should merge hints together (considering hint text bur keeping single penalty)', async () => {
    const result = await generateData([challenge1], [hint1a, hint1b], createOptions({
      insertHints: juiceShopOptions.paidHints,
    }))

    assert.deepEqual(result.levels.levels, [
      {
        ...mapping1,
        hint: 'h1a\n\nh1b',
        penalty: 10
      }
    ])
  })

  it('should have users in the export', async () => {
    const report = await generateData([], [], createOptions())
    assert.equal(report.teams.teams.length >= 1, true)
  })
})
