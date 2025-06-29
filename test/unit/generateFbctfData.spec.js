const {describe,it} = require('node:test')
const assert = require('node:assert/strict')
const generateData = require('../../lib/generators/fbctf.js')
const options = require('../../lib/options.js')
const challenge1 = { key: 'key1', name: 'c1', description: 'C1', difficulty: 1, category: '1', hint: 'hint1', hintUrl: 'https://hint1.com' }
const challenge2 = { key: 'key2', name: 'c2', description: 'C2', difficulty: 3, category: '1', hint: 'hint2', hintUrl: 'https://hint2.com' }

const countryMapping = { key1: { code: 'CA' }, key2: { code: 'FR' } }

const defaultOptions = { insertHints: options.noTextHints, insertHintUrls: options.noHintUrls, ctfKey: '', countryMapping, vulnSnippets: {} }

const defaultChallenge1Mapping = {
  type: 'flag',
  title: 'c1',
  active: true,
  description: 'C1',
  entity_iso_code: 'CA',
  category: 'Difficulty 1',
  points: 100,
  bonus: 0,
  bonus_dec: 0,
  bonus_fix: 0,
  flag: '958c64658383140e7d08d5dee091009cc0eafc1f',
  hint: '',
  penalty: 0,
  links: [],
  attachments: []
}

const defaultChallenge2Mapping = {
  type: 'flag',
  title: 'c2',
  active: true,
  description: 'C2',
  entity_iso_code: 'FR',
  category: 'Difficulty 3',
  points: 450,
  bonus: 0,
  bonus_dec: 0,
  bonus_fix: 0,
  flag: '49294e8b829f5b053f748facad22825ccb4bf420',
  hint: '',
  penalty: 0,
  links: [],
  attachments: []
}

describe('Generated FBCTF data', () => {
  it('should add levels for each challenge', async () => {
    const result = await generateData([challenge1, challenge2], defaultOptions)
    assert.deepEqual(result.levels.levels, [defaultChallenge1Mapping, defaultChallenge2Mapping])
  })

  it('should not add challenges without a country mapping', async () => {
    const result = await generateData([challenge1, { ...challenge2, key: 'doentHaveAMappingForThisKey' }], defaultOptions)
    assert.deepEqual(result.levels.levels, [defaultChallenge1Mapping])
  })

  it('should respect hint insertion options', async () => {
    const result = await generateData([challenge1], { ...defaultOptions, insertHints: options.freeTextHints })
    assert.deepEqual(result.levels.levels, [
      {
        ...defaultChallenge1Mapping,
        hint: 'hint1'
      }
    ])
  })

  it('should respect hint penalty costs insertion options', async () => {
    const result = await generateData([challenge1], { ...defaultOptions, insertHints: options.paidTextHints })
    assert.deepEqual(result.levels.levels, [
      {
        ...defaultChallenge1Mapping,
        hint: 'hint1',
        penalty: 10
      }
    ])
  })

  it('should respect hintUrl penalty costs insertion options', async () => {
    const result = await generateData([challenge1], { ...defaultOptions, insertHintUrls: options.paidHintUrls })
    assert.deepEqual(result.levels.levels, [
      {
        ...defaultChallenge1Mapping,
        hint: 'https://hint1.com',
        penalty: 20
      }
    ])
  })

  it('should merge hint & hintUrl together (considering hint text and penalty)', async () => {
    const result = await generateData([challenge1], { ...defaultOptions, insertHints: options.paidTextHints, insertHintUrls: options.paidHintUrls })
    assert.deepEqual(result.levels.levels, [
      {
        ...defaultChallenge1Mapping,
        hint: 'hint1\n\nhttps://hint1.com',
        penalty: 30
      }
    ])
  })

  it('should add a dummy user to the export', async () => {
    const report = await generateData([], defaultOptions)
    assert.equal(report.teams.teams.length, 1)
  })
})
