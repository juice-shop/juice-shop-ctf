/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { it, describe, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import generateData from '../../lib/generators/ctfd'
import { options as juiceShopOptions } from '../../lib/options'
import { BaseExportSettings, CtfdChallengeData } from '../../lib/types/types'
import { Challenge, Hint } from '../../lib/types/types'

const defaultOptions: BaseExportSettings = { insertHints: juiceShopOptions.noHints, ctfKey: '', outputLocation: '', juiceShopUrl: '', countryMapping: {} }

describe('Generated CTFd data', () => {
  let challenges: Record<string, Challenge>
  let hints: Hint[]


  beforeEach(() => {
    challenges = {
      c1: { id: 1, key: 'k1', name: 'c1', description: 'C1', difficulty: 1, category: '1', tags: 'foo,bar', hasCodingChallenge: false },
      c2: { id: 2, key: 'k2', name: 'c2', description: 'C2', difficulty: 2, category: '2', tags: null, hasCodingChallenge: false },
      c3: { id: 3, key: 'k3', name: 'c3', description: 'C3', difficulty: 3, category: '2', tags: 'foo', hasCodingChallenge: false },
      c4: { id: 4, key: 'k4', name: 'c4', description: 'C4', difficulty: 4, category: '3', tags: null, hasCodingChallenge: false },
      c5: { id: 5, key: 'k5', name: 'c5', description: 'C5', difficulty: 5, category: '1', tags: 'foo,bar,baz', hasCodingChallenge: false }
    }
    hints = [
      { id: 1, ChallengeId: 1, order: 1, text: 'h1', unlocked: false},
      { id: 2, ChallengeId: 2, order: 1, text: 'h2a', unlocked: false},
      { id: 3, ChallengeId: 2, order: 2, text: 'h2b', unlocked: false},
      { id: 4, ChallengeId: 3, order: 1, text: 'h3a', unlocked: false},
      { id: 5, ChallengeId: 3, order: 2, text: 'h3b', unlocked: false},
      { id: 6, ChallengeId: 3, order: 2, text: 'h3c', unlocked: true},
    ]
  })

  it('should consist of one object pushed into result per challenge', async () => {
    const result = await generateData(challenges, hints, defaultOptions)
    assert.deepEqual(result, [
      { name: 'c1', description: '"C1 (Difficulty Level: 1)"', category: '1', value: 100, type: 'standard', state: 'visible', max_attempts: 0, flags: '958c64658383140e7d08d5dee091009cc0eafc1f', tags: '"foo,bar"', hints: '', type_data: '' },
      { name: 'c2', description: '"C2 (Difficulty Level: 2)"', category: '2', value: 250, type: 'standard', state: 'visible', max_attempts: 0, flags: '49294e8b829f5b053f748facad22825ccb4bf420', tags: '', hints: '', type_data: '' },
      { name: 'c3', description: '"C3 (Difficulty Level: 3)"', category: '2', value: 450, type: 'standard', state: 'visible', max_attempts: 0, flags: 'aae3acb6eff2000c0e12af0d0d875d0bdbf4ca81', tags: '"foo"', hints: '', type_data: '' },
      { name: 'c4', description: '"C4 (Difficulty Level: 4)"', category: '3', value: 700, type: 'standard', state: 'visible', max_attempts: 0, flags: '4e2b98db86cc32c56cba287db411198534af4ab6', tags: '', hints: '', type_data: '' },
      { name: 'c5', description: '"C5 (Difficulty Level: 5)"', category: '1', value: 1000, type: 'standard', state: 'visible', max_attempts: 0, flags: '554df67c6c0b6a99efecaec4fe2ced73b7b5be60', tags: '"foo,bar,baz"', hints: '', type_data: '' }
    ])
  })

  it('should be empty when given no challenges', async () => {
    const result = await generateData({}, [], defaultOptions)
    assert.deepEqual(result, [])
  })

  it('should log generator error to console', async () => {
    const invalidChallenge = { } as Challenge
    await assert.rejects(() => generateData({ c1: invalidChallenge }, hints, defaultOptions), /Failed to generate challenge data!/  )})

  it('should fill the hint property for a single hint defined on a challenge', async () => {
    hints = [ { id: 3, ChallengeId: 3, order: 1, text: 'h3', unlocked: false} ]
    const free = await generateData(challenges, hints, { insertHints: juiceShopOptions.freeHints, ctfKey: '', outputLocation: '', juiceShopUrl: '', countryMapping: {} })
    assert.ok(free.some((c: CtfdChallengeData) => c.hints.includes('"h3"') && c.hints.includes('0')))

    const paid = await generateData(challenges, hints, { insertHints: juiceShopOptions.paidHints, ctfKey: '', outputLocation: '', juiceShopUrl: '', countryMapping: {} })
    assert.ok(paid.some((c: CtfdChallengeData) => c.hints.includes('"h3"') && c.hints.includes('45')))
  })

  it('should push an object each into hints for challenge with multiple hints', async () => {
    hints = [ { id: 3, ChallengeId: 3, order: 1, text: 'h3a', unlocked: false}, { id: 4, ChallengeId: 3, order: 2, text: 'h3b', unlocked: false} ]

    let result = await generateData(challenges, hints, { insertHints: juiceShopOptions.freeHints, ctfKey: '', outputLocation: '', juiceShopUrl: '', countryMapping: {} })
    let challenge = result.find((c: CtfdChallengeData) => c.name === 'c3')
    assert.ok(challenge, 'Challenge c3 should exist')
    assert.match(challenge.hints, /h3a.*h3b/)

    result = await generateData(challenges, hints, { insertHints: juiceShopOptions.paidHints, ctfKey: '', outputLocation: '', juiceShopUrl: '', countryMapping: {} })
    challenge = result.find((c: CtfdChallengeData) => c.name === 'c3')
    assert.ok(challenge, 'Challenge c3 should exist')
    assert.match(challenge.hints, /h3a.*h3b/)
  })

  it('should not insert any hints when corresponding hint option is not chosen', async () => {
    const result = await generateData(challenges, hints, defaultOptions)
    const c1Result = result.find((c: CtfdChallengeData) => c.name === 'c1')
    const c2Result = result.find((c: CtfdChallengeData) => c.name === 'c2')
    const c3Result = result.find((c: CtfdChallengeData) => c.name === 'c3')
    const c4Result = result.find((c: CtfdChallengeData) => c.name === 'c4')
    const c5Result = result.find((c: CtfdChallengeData) => c.name === 'c5')
    assert.ok(c1Result, 'Challenge c1 should exist')
    assert.ok(c2Result, 'Challenge c2 should exist')
    assert.ok(c3Result, 'Challenge c3 should exist')
    assert.ok(c4Result, 'Challenge c4 should exist')
    assert.ok(c5Result, 'Challenge c5 should exist')
    assert.equal(c1Result.hints, '')
    assert.equal(c2Result.hints, '')
    assert.equal(c3Result.hints, '')
    assert.equal(c4Result.hints, '')
    assert.equal(c5Result.hints, '')
  })
})
