const Promise = require('bluebird')
const { hash } = require('bcryptjs')
Promise.promisify(hash)

const fbctfTemplate = require('../../data/fbctfImportTemplate.json')

const hmac = require('../hmac')
const calculateHintCost = require('../calculateHintCost')
const calculateScore = require('../calculateScore')

function generateRandomString (length) {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }

  return text
}

async function createFBCTFExport (challenges, { insertHints, insertHintUrls, ctfKey, countryMapping, outputLocation }) {
  // Add admin user
  const dummyUser = generateRandomString(32)
  const dummyPassword = generateRandomString(32)

  const SALT_ROUNDS = 12

  fbctfTemplate.teams.teams.push({
    'name': dummyUser,
    'active': false,
    'admin': false,
    'protected': false,
    'visible': false,
    'password_hash': await hash(dummyPassword, SALT_ROUNDS),
    'points': 0,
    'logo': '4chan-2',
    'data': {}
  })

  // Add all challenges
  fbctfTemplate.levels.levels = challenges.map(({ key, name, description, difficulty, hint }) => {
    const country = countryMapping[key]
    if (!country) {
      console.warn(`The Challenge "${name}" does not have a country mapping.`)
      console.warn('This means that it will not be included in the ctf game.')
      console.warn('Make sure that you are running the latest version.')
      console.warn('If you are and this message appears please open a issue in the juice-shop repository.')
      console.warn()
      return false
    }

    return {
      'type': 'flag',
      'title': name,
      'active': true,
      'description': description,
      'entity_iso_code': country.code,
      'category': `Difficulty ${difficulty}`,
      'points': calculateScore(difficulty),
      'bonus': 0,
      'bonus_dec': 0,
      'bonus_fix': 0,
      'flag': hmac(ctfKey, name),
      'hint': hint,
      'penalty': calculateHintCost({difficulty}, {}),
      'links': [],
      'attachments': []
    }
  }).filter(Boolean)// Filter out levels without a proper country mapping.

  return fbctfTemplate
}

module.exports = createFBCTFExport
