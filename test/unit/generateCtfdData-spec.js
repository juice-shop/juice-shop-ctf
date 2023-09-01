/*
 * Copyright (c) 2016-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const Promise = require('bluebird')
const chai = require('chai')
chai.use(require('chai-things'))
chai.use(require('chai-subset'))
chai.use(require('chai-as-promised'))
const expect = chai.expect
const generateData = require('../../lib/generators/ctfd')
const options = require('../../lib/options')

const defaultOptions = { insertHints: options.noTextHints, insertHintUrls: options.noHintUrls, ctfKey: '', vulnSnippets: {} }

describe('Generated CTFd data', () => {
  let challenges
  beforeEach(() => {
    challenges = {
      c1: { id: 1, key: 'k1', name: 'c1', description: 'C1', difficulty: 1, category: '1', tags: 'foo,bar' },
      c2: { id: 2, key: 'k2', name: 'c2', description: 'C2', difficulty: 2, category: '2', tags: null },
      c3: { id: 3, key: 'k3', name: 'c3', description: 'C3', difficulty: 3, category: '2', tags: 'foo' },
      c4: { id: 4, key: 'k4', name: 'c4', description: 'C4', difficulty: 4, category: '3', tags: null },
      c5: { id: 5, key: 'k5', name: 'c5', description: 'C5', difficulty: 5, category: '1', tags: 'foo,bar,baz' }
    }
  })

  it('should consist of one object pushed into result per challenge', function () {
    return expect(generateData(challenges, defaultOptions)).to.eventually.deep.include.members([
      { name: 'c1', description: '"C1 (Difficulty Level: 1)"', category: '1', value: 100, type: 'standard', state: 'visible', max_attempts: 0, flags: '958c64658383140e7d08d5dee091009cc0eafc1f', tags: '"foo,bar"', hints: '', type_data: '' },
      { name: 'c2', description: '"C2 (Difficulty Level: 2)"', category: '2', value: 250, type: 'standard', state: 'visible', max_attempts: 0, flags: '49294e8b829f5b053f748facad22825ccb4bf420', tags: '', hints: '', type_data: '' },
      { name: 'c3', description: '"C3 (Difficulty Level: 3)"', category: '2', value: 450, type: 'standard', state: 'visible', max_attempts: 0, flags: 'aae3acb6eff2000c0e12af0d0d875d0bdbf4ca81', tags: '"foo"', hints: '', type_data: '' },
      { name: 'c4', description: '"C4 (Difficulty Level: 4)"', category: '3', value: 700, type: 'standard', state: 'visible', max_attempts: 0, flags: '4e2b98db86cc32c56cba287db411198534af4ab6', tags: '', hints: '', type_data: '' },
      { name: 'c5', description: '"C5 (Difficulty Level: 5)"', category: '1', value: 1000, type: 'standard', state: 'visible', max_attempts: 0, flags: '554df67c6c0b6a99efecaec4fe2ced73b7b5be60', tags: '"foo,bar,baz"', hints: '', type_data: '' }
    ]
    )
  })

  it('should be empty when given no challenges', () =>
    expect(generateData({}, defaultOptions)).to.eventually.deep.equal([])
  )

  it('should log generator error to console', () =>
    expect(generateData({ c1: undefined }, defaultOptions)).to.be.rejectedWith('Failed to generate challenge data! Cannot read properties of undefined (reading \'difficulty\')')
  )

  it('should fill the hint property for a single text hint defined on a challenge', () => {
    challenges.c3.hint = 'hint'
    return Promise.all([
      expect(generateData(challenges, { insertHints: options.freeTextHints, insertHintUrls: options.noHintUrls, ctfKey: '', vulnSnippets: {} })).to.eventually.deep.include(
        { name: 'c3', description: '"C3 (Difficulty Level: 3)"', category: '2', value: 450, type: 'standard', state: 'visible', max_attempts: 0, flags: 'aae3acb6eff2000c0e12af0d0d875d0bdbf4ca81', tags: '"foo"', hints: '"hint"', type_data: '' }
      ),
      expect(generateData(challenges, { insertHints: options.paidTextHints, insertHintUrls: options.noHintUrls, ctfKey: '', vulnSnippets: {} })).to.eventually.deep.include(
        { name: 'c3', description: '"C3 (Difficulty Level: 3)"', category: '2', value: 450, type: 'standard', state: 'visible', max_attempts: 0, flags: 'aae3acb6eff2000c0e12af0d0d875d0bdbf4ca81', tags: '"foo"', hints: '"hint"', type_data: '' }
      )
    ])
  })

  it('should fill the hint property for a single hint URL defined on a challenge', () => {
    challenges.c3.hintUrl = 'hintUrl'
    return Promise.all([
      expect(generateData(challenges, { insertHints: options.noTextHints, insertHintUrls: options.freeHintUrls, ctfKey: '', vulnSnippets: {} })).to.eventually.deep.include(
        { name: 'c3', description: '"C3 (Difficulty Level: 3)"', category: '2', value: 450, type: 'standard', state: 'visible', max_attempts: 0, flags: 'aae3acb6eff2000c0e12af0d0d875d0bdbf4ca81', tags: '"foo"', hints: '"hintUrl"', type_data: '' }
      ),
      expect(generateData(challenges, { insertHints: options.noTextHints, insertHintUrls: options.paidHintUrls, ctfKey: '', vulnSnippets: {} })).to.eventually.deep.include(
        { name: 'c3', description: '"C3 (Difficulty Level: 3)"', category: '2', value: 450, type: 'standard', state: 'visible', max_attempts: 0, flags: 'aae3acb6eff2000c0e12af0d0d875d0bdbf4ca81', tags: '"foo"', hints: '"hintUrl"', type_data: '' }
      )
    ])
  })

  it('should push an object each into hints.results for a challenge with text hint and hint URL defined with prerequisite relationship', () => {
    challenges.c3.hint = 'hint'
    challenges.c3.hintUrl = 'hintUrl'
    return Promise.all([
      expect(generateData(challenges, { insertHints: options.freeTextHints, insertHintUrls: options.freeHintUrls, ctfKey: '', vulnSnippets: {} })).to.eventually.deep.include(
        { name: 'c3', description: '"C3 (Difficulty Level: 3)"', value: 450, category: '2', state: 'visible', max_attempts: 0, type: 'standard', type_data: '', flags: 'aae3acb6eff2000c0e12af0d0d875d0bdbf4ca81', tags: '"foo"', hints: '"hint,hintUrl"' }
      ),
      expect(generateData(challenges, { insertHints: options.paidTextHints, insertHintUrls: options.freeHintUrls, ctfKey: '', vulnSnippets: {} })).to.eventually.deep.include(
        { name: 'c3', description: '"C3 (Difficulty Level: 3)"', value: 450, category: '2', state: 'visible', max_attempts: 0, type: 'standard', type_data: '', flags: 'aae3acb6eff2000c0e12af0d0d875d0bdbf4ca81', tags: '"foo"', hints: '"hint,hintUrl"' }
      ),
      expect(generateData(challenges, { insertHints: options.freeTextHints, insertHintUrls: options.paidHintUrls, ctfKey: '', vulnSnippets: {} })).to.eventually.deep.include(
        { name: 'c3', description: '"C3 (Difficulty Level: 3)"', value: 450, category: '2', state: 'visible', max_attempts: 0, type: 'standard', type_data: '', flags: 'aae3acb6eff2000c0e12af0d0d875d0bdbf4ca81', tags: '"foo"', hints: '"hint,hintUrl"' }
      ),
      expect(generateData(challenges, { insertHints: options.paidTextHints, insertHintUrls: options.paidHintUrls, ctfKey: '', vulnSnippets: {} })).to.eventually.deep.include(
        { name: 'c3', description: '"C3 (Difficulty Level: 3)"', value: 450, category: '2', state: 'visible', max_attempts: 0, type: 'standard', type_data: '', flags: 'aae3acb6eff2000c0e12af0d0d875d0bdbf4ca81', tags: '"foo"', hints: '"hint,hintUrl"' }
      )
    ])
  })

  it('should not insert a text hint when corresponding hint option is not chosen', () => {
    challenges.c1.hint = 'hint'
    challenges.c2.hint = 'hint'
    return expect(generateData(challenges, defaultOptions)).to.eventually.deep.include.members([
      { name: 'c1', description: '"C1 (Difficulty Level: 1)"', category: '1', value: 100, type: 'standard', state: 'visible', max_attempts: 0, flags: '958c64658383140e7d08d5dee091009cc0eafc1f', tags: '"foo,bar"', hints: '', type_data: '' },
      { name: 'c2', description: '"C2 (Difficulty Level: 2)"', category: '2', value: 250, type: 'standard', state: 'visible', max_attempts: 0, flags: '49294e8b829f5b053f748facad22825ccb4bf420', tags: '', hints: '', type_data: '' }
    ]
    )
  })

  it('should not insert a hint URL when corresponding hint option is not chosen', () => {
    challenges.c1.hintUrl = 'hintUrl'
    challenges.c2.hintUrl = 'hintUrl'
    return expect(generateData(challenges, defaultOptions)).to.eventually.deep.include.members([
      { name: 'c1', description: '"C1 (Difficulty Level: 1)"', category: '1', value: 100, type: 'standard', state: 'visible', max_attempts: 0, flags: '958c64658383140e7d08d5dee091009cc0eafc1f', tags: '"foo,bar"', hints: '', type_data: '' },
      { name: 'c2', description: '"C2 (Difficulty Level: 2)"', category: '2', value: 250, type: 'standard', state: 'visible', max_attempts: 0, flags: '49294e8b829f5b053f748facad22825ccb4bf420', tags: '', hints: '', type_data: '' }
    ]
    )
  })

  xit('should not insert a text hint for challenges that do not have a hint defined', () => {
    challenges.c1.hint = 'hint'
    challenges.c2.hint = 'hint'
    challenges.c3.hint = undefined
    challenges.c4.hint = 'hint'
    challenges.c5.hint = 'hint'
    return Promise.all([
      expect(generateData(challenges, { insertHints: options.freeTextHints, insertHintUrls: options.noHintUrls, ctfKey: '', vulnSnippets: {} })).to.eventually.not.deep.include(
        {
          hints: {
            results: [
              { id: 3, challenge_id: 3, content: 'hint', cost: 0, type: 'standard' }
            ]
          }
        }),
      expect(generateData(challenges, { insertHints: options.paidTextHints, insertHintUrls: options.noHintUrls, ctfKey: '', vulnSnippets: {} })).to.eventually.not.deep.include(
        {
          hints: {
            results: [
              { id: 3, challenge_id: 3, content: 'hint', cost: 45, type: 'standard' }
            ]
          }
        })
    ])
  })

  xit('should not insert a hint URL for challenges that do not have a hint defined', () => {
    challenges.c1.hintUrl = 'hintUrl'
    challenges.c2.hintUrl = 'hintUrl'
    challenges.c3.hintUrl = undefined
    challenges.c4.hintUrl = 'hintUrl'
    challenges.c5.hintUrl = 'hintUrl'
    return Promise.all([
      expect(generateData(challenges, { insertHints: options.freeTextHints, insertHintUrls: options.noHintUrls, ctfKey: '', vulnSnippets: {} })).to.eventually.not.deep.include(
        {
          hints: {
            results: [
              { id: 3, challenge_id: 3, content: 'hintUrl', cost: 0, type: 'standard' }
            ]
          }
        }),
      expect(generateData(challenges, { insertHints: options.paidTextHints, insertHintUrls: options.noHintUrls, ctfKey: '', vulnSnippets: {} })).to.eventually.not.deep.include(
        {
          hints: {
            results: [
              { id: 3, challenge_id: 3, content: 'hintUrl', cost: 90, type: 'standard' }
            ]
          }
        })
    ])
  })
})
