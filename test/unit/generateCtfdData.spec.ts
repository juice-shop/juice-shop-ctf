/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { it, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import generateData from '../../lib/generators/ctfd'
import { options as juiceShopOptions } from '../../lib/options'
import { BaseExportSettings, CtfdChallengeData } from '../../lib/types/types'
import { Challenge } from '../../lib/types/types'

const defaultOptions: BaseExportSettings = { insertHints: juiceShopOptions.noTextHints, insertHintUrls: juiceShopOptions.noHintUrls, insertHintSnippets: juiceShopOptions.noHintSnippets, ctfKey: '', outputLocation: '', vulnSnippets: {}, juiceShopUrl: '', countryMapping: {} }

describe('Generated CTFd data', () => {
  let challenges: Record<string, Challenge>


  beforeEach(() => {
    challenges = {
      c1: { id: 1, key: 'k1', name: 'c1', description: 'C1', difficulty: 1, category: '1', tags: 'foo,bar', hasCodingChallenge: false },
      c2: { id: 2, key: 'k2', name: 'c2', description: 'C2', difficulty: 2, category: '2', tags: null, hasCodingChallenge: false },
      c3: { id: 3, key: 'k3', name: 'c3', description: 'C3', difficulty: 3, category: '2', tags: 'foo', hasCodingChallenge: false },
      c4: { id: 4, key: 'k4', name: 'c4', description: 'C4', difficulty: 4, category: '3', tags: null, hasCodingChallenge: false },
      c5: { id: 5, key: 'k5', name: 'c5', description: 'C5', difficulty: 5, category: '1', tags: 'foo,bar,baz', hasCodingChallenge: false }
    }
  })

  it('should consist of one object pushed into result per challenge', async () => {
    const result = await generateData(challenges, defaultOptions)
    assert.deepEqual(result, [
      { name: 'c1', description: '"C1 (Difficulty Level: 1)"', category: '1', value: 100, type: 'standard', state: 'visible', max_attempts: 0, flags: '958c64658383140e7d08d5dee091009cc0eafc1f', tags: '"foo,bar"', hints: '', type_data: '' },
      { name: 'c2', description: '"C2 (Difficulty Level: 2)"', category: '2', value: 250, type: 'standard', state: 'visible', max_attempts: 0, flags: '49294e8b829f5b053f748facad22825ccb4bf420', tags: '', hints: '', type_data: '' },
      { name: 'c3', description: '"C3 (Difficulty Level: 3)"', category: '2', value: 450, type: 'standard', state: 'visible', max_attempts: 0, flags: 'aae3acb6eff2000c0e12af0d0d875d0bdbf4ca81', tags: '"foo"', hints: '', type_data: '' },
      { name: 'c4', description: '"C4 (Difficulty Level: 4)"', category: '3', value: 700, type: 'standard', state: 'visible', max_attempts: 0, flags: '4e2b98db86cc32c56cba287db411198534af4ab6', tags: '', hints: '', type_data: '' },
      { name: 'c5', description: '"C5 (Difficulty Level: 5)"', category: '1', value: 1000, type: 'standard', state: 'visible', max_attempts: 0, flags: '554df67c6c0b6a99efecaec4fe2ced73b7b5be60', tags: '"foo,bar,baz"', hints: '', type_data: '' }
    ])
  })

  it('should be empty when given no challenges', async () => {
    const result = await generateData({}, defaultOptions)
    assert.deepEqual(result, [])
  })

  it('should log generator error to console', async () => {
    const invalidChallenge = { } as Challenge
    await assert.rejects(() => generateData({ c1: invalidChallenge }, defaultOptions), /Failed to generate challenge data!/  )})

  it('should fill the hint property for a single text hint defined on a challenge', async () => {
    challenges.c3.hint = 'hint'
    const free = await generateData(challenges, { insertHints: juiceShopOptions.freeTextHints, insertHintUrls: juiceShopOptions.noHintUrls, insertHintSnippets: juiceShopOptions.noHintSnippets, ctfKey: '', outputLocation: '', vulnSnippets: {}, juiceShopUrl: '', countryMapping: {} })
    assert.ok(free.some((c: CtfdChallengeData) => c.hints.includes('"hint"') && c.hints.includes('0')))

    const paid = await generateData(challenges, { insertHints: juiceShopOptions.paidTextHints, insertHintUrls: juiceShopOptions.noHintUrls, insertHintSnippets: juiceShopOptions.noHintSnippets, ctfKey: '', outputLocation: '', vulnSnippets: {}, juiceShopUrl: '', countryMapping: {} })
    assert.ok(paid.some((c: CtfdChallengeData) => c.hints.includes('"hint"') && c.hints.includes('45')))
  })

  it('should fill the hint property for a single hint URL defined on a challenge', async () => {
    challenges.c3.hintUrl = 'hintUrl'
    const free = await generateData(challenges, { insertHints: juiceShopOptions.noTextHints, insertHintUrls: juiceShopOptions.freeHintUrls, insertHintSnippets: juiceShopOptions.noHintSnippets, ctfKey: '', outputLocation: '', vulnSnippets: {}, juiceShopUrl: '', countryMapping: {} })
    assert.ok(free.some((c: CtfdChallengeData) => c.hints.includes('"hintUrl"') && c.hints.includes('0')))
    const paid = await generateData(challenges, { insertHints: juiceShopOptions.noTextHints, insertHintUrls: juiceShopOptions.paidHintUrls, insertHintSnippets: juiceShopOptions.noHintSnippets, ctfKey: '', outputLocation: '', vulnSnippets: {}, juiceShopUrl: '', countryMapping: {} })
    assert.ok(paid.some((c: CtfdChallengeData) => c.hints.includes('"hintUrl"') && c.hints.includes('90')))
  })

  it('should push an object each into hints for challenge with both text and URL hint with prerequisite relationship', async () => {
    challenges.c3.hint = 'hint'
    challenges.c3.hintUrl = 'hintUrl'

    const result1 = await generateData(challenges, { insertHints: juiceShopOptions.freeTextHints, insertHintUrls: juiceShopOptions.freeHintUrls, insertHintSnippets: juiceShopOptions.noHintSnippets, ctfKey: '', outputLocation: '', vulnSnippets: {}, juiceShopUrl: '', countryMapping: {} })
    const challenge1 = result1.find((c: CtfdChallengeData) => c.name === 'c3')
    assert.ok(challenge1, 'Challenge c3 should exist')
    assert.match(challenge1.hints, /hint.*hintUrl/)

    const result2 = await generateData(challenges, { insertHints: juiceShopOptions.paidTextHints, insertHintUrls: juiceShopOptions.freeHintUrls, insertHintSnippets: juiceShopOptions.noHintSnippets, ctfKey: '', outputLocation: '', vulnSnippets: {}, juiceShopUrl: '', countryMapping: {} })
    const challenge2 = result2.find((c: CtfdChallengeData) => c.name === 'c3')
    assert.ok(challenge2, 'Challenge c3 should exist')
    assert.match(challenge2.hints, /hint.*hintUrl/)
  })

  it('should not insert a text hint when corresponding hint option is not chosen', async () => {
    challenges.c1.hint = 'hint'
    challenges.c2.hint = 'hint'
    const result = await generateData(challenges, defaultOptions)
    const c1Result = result.find((c: CtfdChallengeData) => c.name === 'c1')
    const c2Result = result.find((c: CtfdChallengeData) => c.name === 'c2')
    assert.ok(c1Result, 'Challenge c1 should exist')
    assert.ok(c2Result, 'Challenge c2 should exist')
    assert.equal(c1Result.hints, '')
    assert.equal(c2Result.hints, '')
  })

  it('should not insert a hint URL when corresponding hint option is not chosen', async () => {
    challenges.c1.hintUrl = 'hintUrl'
    challenges.c2.hintUrl = 'hintUrl'
    const result = await generateData(challenges, defaultOptions)
    const c1Result = result.find((c: CtfdChallengeData) => c.name === 'c1')
    const c2Result = result.find((c: CtfdChallengeData) => c.name === 'c2')
    assert.ok(c1Result, 'Challenge c1 should exist')
    assert.ok(c2Result, 'Challenge c2 should exist')
    assert.equal(c1Result.hints, '')
    assert.equal(c2Result.hints, '')
  })
})
