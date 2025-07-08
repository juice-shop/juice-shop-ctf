/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import {it, describe, beforeEach} from 'node:test'
import assert from 'node:assert/strict'
import rewire from 'rewire'

const generateDataModule = rewire('../../lib/generators/rtb')
const generateData = generateDataModule.default || generateDataModule
import options from '../../lib/options'

interface Challenge {
  id: number
  key: string
  name: string
  description: string
  difficulty: number
  category: string
  hint?: string
  hintUrl?: string
}

interface Challenges {
  [key: string]: Challenge
}

const defaultOptions = { 
  insertHints: options.noTextHints, 
  insertHintUrls: options.noHintUrls, 
  ctfKey: '', 
  vulnSnippets: {} 
}

describe('Generated RTB data', () => {
  let challenges: Challenges

  beforeEach(() => {
    challenges = {
      c1: { id: 1, key: 'k1', name: 'c1', description: 'C1', difficulty: 1, category: '1' },
      c2: { id: 2, key: 'k2', name: 'c2', description: 'C2', difficulty: 2, category: '2' },
      c3: { id: 3, key: 'k3', name: 'c3', description: 'C3', difficulty: 3, category: '2' },
      c4: { id: 4, key: 'k4', name: 'c4', description: 'C4', difficulty: 4, category: '3' },
      c5: { id: 5, key: 'k5', name: 'c5', description: 'C5', difficulty: 5, category: '1' }
    }
  })

  it('should contain no boxes when given no challenges', async () => {
    const result = await generateData({}, defaultOptions)
    assert.ok(typeof result === 'string')
    assert.match(result, /<boxes count="0"\/>/)
  })

  it('should contain one <box> per given challenge category', async () => {
    const result = await generateData(challenges, defaultOptions)
    assert.ok(typeof result === 'string')
    assert.match(result, /<boxes count="3">/)
  })

  it('should contain one <category> per given challenge category', async () => {
    const result = await generateData(challenges, defaultOptions)
    assert.ok(typeof result === 'string')
    assert.match(result, /<categories count="3">/)
  })

  it('should put each given challenge as a <flag> into the matching category <box>', async () => {
    const result = await generateData(challenges, defaultOptions)
    assert.ok(typeof result === 'string')
    assert.match(result, /<box gamelevel="0">\s{11}<name>1<\/name>[^]*<flags count="2">/)
    assert.match(result, /<box gamelevel="0">\s{11}<name>2<\/name>[^]*<flags count="2">/)
    assert.match(result, /<box gamelevel="0">\s{11}<name>3<\/name>[^]*<flags count="1">/)
  })

  it('should add a <hint> for a text hint defined on a challenge', async () => {
    challenges.c3.hint = 'hint'
    const free = await generateData(challenges, { 
      insertHints: options.freeTextHints, 
      insertHintUrls: options.noHintUrls, 
      ctfKey: '', 
      vulnSnippets: {} 
    })
    assert.ok(typeof free === 'string')
    assert.match(free, /<flag type="static">\s{15}<name>c3<\/name>[^]*<hints count="1">\s{17}<hint>\s{19}<description>hint<\/description>\s{19}<price>0<\/price>/)

    const paid = await generateData(challenges, { 
      insertHints: options.paidTextHints, 
      insertHintUrls: options.noHintUrls, 
      ctfKey: '', 
      vulnSnippets: {} 
    })
    assert.ok(typeof paid === 'string')
    assert.match(paid, /<flag type="static">\s{15}<name>c3<\/name>[^]*<hints count="1">\s{17}<hint>\s{19}<description>hint<\/description>\s{19}<price>45<\/price>/)
  })

  it('should add a <hint> for a hint URL defined on a challenge', async () => {
    challenges.c3.hintUrl = 'hintUrl'
    const free = await generateData(challenges, { 
      insertHints: options.noTextHints, 
      insertHintUrls: options.freeHintUrls, 
      ctfKey: '', 
      vulnSnippets: {} 
    })
    assert.ok(typeof free === 'string')
    assert.match(free, /<flag type="static">\s{15}<name>c3<\/name>[^]*<hints count="1">\s{17}<hint>\s{19}<description>\[C3]\(hintUrl\)<\/description>\s{19}<price>0<\/price>/)

    const paid = await generateData(challenges, { 
      insertHints: options.noTextHints, 
      insertHintUrls: options.paidHintUrls, 
      ctfKey: '', 
      vulnSnippets: {} 
    })
    assert.ok(typeof paid === 'string')
    assert.match(paid, /<flag type="static">\s{15}<name>c3<\/name>[^]*<hints count="1">\s{17}<hint>\s{19}<description>\[C3]\(hintUrl\)<\/description>\s{19}<price>90<\/price>/)
  })

  it('should extract the link text for a hint URL from its anchor', async () => {
    challenges.c3.hintUrl = 'hintUrl#this-is-the-anchor-to-the-ebook-section'
    const result = await generateData(challenges, { 
      insertHints: options.noTextHints, 
      insertHintUrls: options.freeHintUrls, 
      ctfKey: '', 
      vulnSnippets: {} 
    })
    assert.ok(typeof result === 'string')
    assert.match(result, /<hint>\s{19}<description>\[This Is The Anchor To The Ebook Section]\(hintUrl#this-is-the-anchor-to-the-ebook-section\)<\/description>/)
  })
})