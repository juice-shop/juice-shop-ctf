const Promise = require('bluebird')
const chai = require('chai')
chai.use(require('chai-things'))
chai.use(require('chai-subset'))
chai.use(require('chai-as-promised'))
const expect = chai.expect
const generateData = require('../../lib/generators/ctfd')
const options = require('../../lib/options')

describe('Generated data', () => {
  let challenges
  beforeEach(() => {
    challenges = {
      c1: {id: 1, name: 'c1', description: 'C1', difficulty: 1, category: '1'},
      c2: {id: 2, name: 'c2', description: 'C2', difficulty: 2, category: '2'},
      c3: {id: 3, name: 'c3', description: 'C3', difficulty: 3, category: '2'},
      c4: {id: 4, name: 'c4', description: 'C4', difficulty: 4, category: '3'},
      c5: {id: 5, name: 'c5', description: 'C5', difficulty: 5, category: '1'}
    }
  })

  it('should consist of one object pushed into challenges.results per challenge', function () {
    return expect(generateData(challenges, { insertHints: options.noTextHints, insertHintUrls: options.noHintUrls, ctfKey: '' })).to.eventually.deep.include(
      {
        challenges: {
          results: [
            { id: 1, name: 'c1', description: 'C1 (Difficulty Level: 1)', value: 100, category: '1', hidden: false, max_attempts: 0, type: 'standard' },
            { id: 2, name: 'c2', description: 'C2 (Difficulty Level: 2)', value: 250, category: '2', hidden: false, max_attempts: 0, type: 'standard' },
            { id: 3, name: 'c3', description: 'C3 (Difficulty Level: 3)', value: 450, category: '2', hidden: false, max_attempts: 0, type: 'standard' },
            { id: 4, name: 'c4', description: 'C4 (Difficulty Level: 4)', value: 700, category: '3', hidden: false, max_attempts: 0, type: 'standard' },
            { id: 5, name: 'c5', description: 'C5 (Difficulty Level: 5)', value: 1000, category: '1', hidden: false, max_attempts: 0, type: 'standard' }
          ]
        }
      })
  })

  it('should consist of one object pushed into flagKeys.results per challenge', () =>
    expect(generateData(challenges, { insertHints: options.noTextHints, insertHintUrls: options.noHintUrls, ctfKey: '' })).to.eventually.deep.include(
      {
        flagKeys: {
          results: [
            { id: 1, chal: 1, flag: '958c64658383140e7d08d5dee091009cc0eafc1f', type: 'static', data: null },
            { id: 2, chal: 2, flag: '49294e8b829f5b053f748facad22825ccb4bf420', type: 'static', data: null },
            { id: 3, chal: 3, flag: 'aae3acb6eff2000c0e12af0d0d875d0bdbf4ca81', type: 'static', data: null },
            { id: 4, chal: 4, flag: '4e2b98db86cc32c56cba287db411198534af4ab6', type: 'static', data: null },
            { id: 5, chal: 5, flag: '554df67c6c0b6a99efecaec4fe2ced73b7b5be60', type: 'static', data: null }
          ]
        }
      })
  )

  xit('should consist of one object pushed into flagKeys.results per challenge', () => expect(generateData(challenges, options.noTextHints, options.noHintUrls, '')).to.eventually.deep.containSubset(
    {
      flagKeys: {
        results: [
          { id: 1, chal: 1, flag: '958c64658383140e7d08d5dee091009cc0eafc1f', type: 'static', data: null },
          { id: 2, chal: 2, flag: '49294e8b829f5b053f748facad22825ccb4bf420', type: 'static', data: null },
          { id: 3, chal: 3, flag: 'aae3acb6eff2000c0e12af0d0d875d0bdbf4ca81', type: 'static', data: null },
          { id: 4, chal: 4, flag: '4e2b98db86cc32c56cba287db411198534af4ab6', type: 'static', data: null },
          { id: 5, chal: 5, flag: '554df67c6c0b6a99efecaec4fe2ced73b7b5be60', type: 'static', data: null }
        ]
      }
    }))

  it('should be empty when given no challenges', () =>
    expect(generateData({}, { insertHints: options.noTextHints, insertHintUrls: options.noHintUrls, ctfKey: '' })).to.eventually.deep.include(
      { challenges: { results: [] } }
    )
  )

  it('should log generator error to console', () =>
    expect(generateData({ c1: undefined }, { insertHints: options.noTextHints, insertHintUrls: options.noHintUrls, ctfKey: '' })).to.be.rejectedWith('Failed to generate challenge data! Cannot read property \'difficulty\' of undefined')
  )

  it('should push an object into hints.results for a text hint defined on a challenge', () => {
    challenges.c3.hint = 'hint'
    return Promise.all([
      expect(generateData(challenges, { insertHints: options.freeTextHints, insertHintUrls: options.noHintUrls, ctfKey: '' })).to.eventually.deep.include(
        {
          hints: {
            results: [
              { id: 3, chal: 3, hint: 'hint', cost: 0, type: 0 }
            ]
          }
        }),
      expect(generateData(challenges, { insertHints: options.paidTextHints, insertHintUrls: options.noHintUrls, ctfKey: '' })).to.eventually.deep.include(
        {
          hints: {
            results: [
              { id: 3, chal: 3, hint: 'hint', cost: 45, type: 0 }
            ]
          }
        })
    ])
  })

  it('should push an object into hints.results for a text hint URL defined on a challenge', () => {
    challenges.c3.hintUrl = 'hintUrl'
    return Promise.all([
      expect(generateData(challenges, { insertHints: options.noTextHints, insertHintUrls: options.freeHintUrls, ctfKey: '' })).to.eventually.deep.include(
        {
          hints: {
            results: [
              { id: 10003, chal: 3, hint: 'hintUrl', cost: 0, type: 0 }
            ]
          }
        }),
      expect(generateData(challenges, { insertHints: options.noTextHints, insertHintUrls: options.paidHintUrls, ctfKey: '' })).to.eventually.deep.include(
        {
          hints: {
            results: [
              { id: 10003, chal: 3, hint: 'hintUrl', cost: 90, type: 0 }
            ]
          }
        })
    ])
  })

  it('should push an object each into hints.results for a challenge with text hint and hint URL defined', () => {
    challenges.c3.hint = 'hint'
    challenges.c3.hintUrl = 'hintUrl'
    return Promise.all([
      expect(generateData(challenges, { insertHints: options.freeTextHints, insertHintUrls: options.freeHintUrls, ctfKey: '' })).to.eventually.deep.include(
        {
          hints: {
            results: [
              { id: 3, chal: 3, hint: 'hint', cost: 0, type: 0 },
              { id: 10003, chal: 3, hint: 'hintUrl', cost: 0, type: 0 }
            ]
          }
        }),
      expect(generateData(challenges, { insertHints: options.paidTextHints, insertHintUrls: options.freeHintUrls, ctfKey: '' })).to.eventually.deep.include(
        {
          hints: {
            results: [
              { id: 3, chal: 3, hint: 'hint', cost: 45, type: 0 },
              { id: 10003, chal: 3, hint: 'hintUrl', cost: 0, type: 0 }
            ]
          }
        }),
      expect(generateData(challenges, { insertHints: options.freeTextHints, insertHintUrls: options.paidHintUrls, ctfKey: '' })).to.eventually.deep.include(
        {
          hints: {
            results: [
              { id: 3, chal: 3, hint: 'hint', cost: 0, type: 0 },
              { id: 10003, chal: 3, hint: 'hintUrl', cost: 90, type: 0 }
            ]
          }
        }),
      expect(generateData(challenges, { insertHints: options.paidTextHints, insertHintUrls: options.paidHintUrls, ctfKey: '' })).to.eventually.deep.include(
        {
          hints: {
            results: [
              { id: 3, chal: 3, hint: 'hint', cost: 45, type: 0 },
              { id: 10003, chal: 3, hint: 'hintUrl', cost: 90, type: 0 }
            ]
          }
        })
    ])
  })

  it('should not insert a text hint when corresponding hint option is not chosen', () => {
    challenges.c1.hint = 'hint'
    challenges.c2.hint = 'hint'
    return expect(generateData(challenges, { insertHints: options.noTextHints, insertHintUrls: options.noHintUrls, ctfKey: '' })).to.eventually.deep.include(
      { hints: { results: [] } }
    )
  })

  it('should not insert a hint URL when corresponding hint option is not chosen', () => {
    challenges.c1.hintUrl = 'hintUrl'
    challenges.c2.hintUrl = 'hintUrl'
    return expect(generateData(challenges, { insertHints: options.noTextHints, insertHintUrls: options.noHintUrls, ctfKey: '' })).to.eventually.deep.include(
      { hints: { results: [] } }
    )
  })

  it('should not insert a text hint for challenges that do not have a hint defined', () => {
    challenges.c1.hint = 'hint'
    challenges.c2.hint = 'hint'
    challenges.c3.hint = undefined
    challenges.c4.hint = 'hint'
    challenges.c5.hint = 'hint'
    return Promise.all([
      expect(generateData(challenges, { insertHints: options.freeTextHints, insertHintUrls: options.noHintUrls, ctfKey: '' })).to.eventually.not.deep.include(
        {
          hints: {
            results: [
              { id: 3, chal: 3, hint: 'hint', cost: 0, type: 0 }
            ]
          }
        }),
      expect(generateData(challenges, { insertHints: options.paidTextHints, insertHintUrls: options.noHintUrls, ctfKey: '' })).to.eventually.not.deep.include(
        {
          hints: {
            results: [
              { id: 3, chal: 3, hint: 'hint', cost: 45, type: 0 }
            ]
          }
        })
    ])
  })

  it('should not insert a hint URL for challenges that do not have a hint defined', () => {
    challenges.c1.hintUrl = 'hintUrl'
    challenges.c2.hintUrl = 'hintUrl'
    challenges.c3.hintUrl = undefined
    challenges.c4.hintUrl = 'hintUrl'
    challenges.c5.hintUrl = 'hintUrl'
    return Promise.all([
      expect(generateData(challenges, { insertHints: options.freeTextHints, insertHintUrls: options.noHintUrls, ctfKey: '' })).to.eventually.not.deep.include(
        {
          hints: {
            results: [
              { id: 3, chal: 3, hint: 'hintUrl', cost: 0, type: 0 }
            ]
          }
        }),
      expect(generateData(challenges, { insertHints: options.paidTextHints, insertHintUrls: options.noHintUrls, ctfKey: '' })).to.eventually.not.deep.include(
        {
          hints: {
            results: [
              { id: 3, chal: 3, hint: 'hintUrl', cost: 90, type: 0 }
            ]
          }
        })
    ])
  })
})
