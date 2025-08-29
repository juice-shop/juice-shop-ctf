/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import {it, describe, beforeEach} from 'node:test'
import assert from 'node:assert/strict'
import rewire from 'rewire'

const generateDataModule = rewire('../../lib/generators/rtb')
const generateData = generateDataModule.default || generateDataModule
import {options as juiceShopOptions} from '../../lib/options'
import {Challenge, Hint} from '../../lib/types/types'

interface Challenges {
  [key: string]: Challenge
}

const defaultOptions = {
  insertHints: juiceShopOptions.noHints,
  ctfKey: ''
}

describe('Generated RTB data', () => {
  let challenges: Challenges
  let hints: Hint[]

  beforeEach(() => {
    challenges = {
      c1: { id: 1, key: 'k1', name: 'c1', description: 'C1', difficulty: 1, category: '1', hasCodingChallenge: false },
      c2: { id: 2, key: 'k2', name: 'c2', description: 'C2', difficulty: 2, category: '2', hasCodingChallenge: false },
      c3: { id: 3, key: 'k3', name: 'c3', description: 'C3', difficulty: 3, category: '2', hasCodingChallenge: false },
      c4: { id: 4, key: 'k4', name: 'c4', description: 'C4', difficulty: 4, category: '3', hasCodingChallenge: false },
      c5: { id: 5, key: 'k5', name: 'c5', description: 'C5', difficulty: 5, category: '1', hasCodingChallenge: false }
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

  it('should contain no boxes when given no challenges', async () => {
    const result = await generateData({}, [], defaultOptions)
    assert.ok(typeof result === 'string')
    assert.match(result, /<boxes count="0"\/>/)
  })

  it('should contain one <box> per given challenge category', async () => {
    const result = await generateData(challenges, [], defaultOptions)
    assert.ok(typeof result === 'string')
    assert.match(result, /<boxes count="3">/)
  })

  it('should contain one <category> per given challenge category', async () => {
    const result = await generateData(challenges, [], defaultOptions)
    assert.ok(typeof result === 'string')
    assert.match(result, /<categories count="3">/)
  })

  it('should put each given challenge as a <flag> into the matching category <box>', async () => {
    const result = await generateData(challenges, [], defaultOptions)
    assert.ok(typeof result === 'string')
    assert.match(result, /<box gamelevel="0">\s{11}<name>1<\/name>[^]*<flags count="2">/)
    assert.match(result, /<box gamelevel="0">\s{11}<name>2<\/name>[^]*<flags count="2">/)
    assert.match(result, /<box gamelevel="0">\s{11}<name>3<\/name>[^]*<flags count="1">/)
  })

  it('should add a <hint> for a hint defined on a challenge', async () => {
    const free = await generateData(challenges, [{ id: 4, ChallengeId: 3, order: 1, text: 'h3a', unlocked: false}], {
      insertHints: juiceShopOptions.freeHints,
      ctfKey: ''
    })
    assert.ok(typeof free === 'string')
    assert.match(free, /<flag type="static">\s{15}<name>c3<\/name>[^]*<hints count="1">\s{17}<hint>\s{19}<description>h3a<\/description>\s{19}<price>0<\/price>/)

    const paid = await generateData(challenges, {
      insertHints: juiceShopOptions.paidHints,
      ctfKey: ''
    })
    assert.ok(typeof paid === 'string')
    assert.match(paid, /<flag type="static">\s{15}<name>c3<\/name>[^]*<hints count="1">\s{17}<hint>\s{19}<description>h3a<\/description>\s{19}<price>45<\/price>/)
  })
})
