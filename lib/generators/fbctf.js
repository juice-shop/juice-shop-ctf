const Promise = require('bluebird')
const { hash } = require('bcryptjs')
const { readFile } = require('fs')
const path = require('path')
Promise.promisify(hash)

const options = require('../options')
const hmac = require('../hmac')
const calculateHintCost = require('../calculateHintCost')
const calculateScore = require('../calculateScore')

function generateRandomString (length) {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)) }

  return text
}

function loadTemplate () {
  return new Promise((resolve, reject) => {
    const filename = path.join(__dirname, '../../data/fbctfImportTemplate.json')

    readFile(filename, { encoding: 'utf8' }, (err, text) => {
      if (err) {
        reject(err)
      }
      resolve(JSON.parse(text))
    })
  })
}

async function createDummyUser () {
  const SALT_ROUNDS = 12
  return {
    'name': generateRandomString(32),
    'active': false,
    'admin': false,
    'protected': false,
    'visible': false,
    'password_hash': await hash(generateRandomString(32), SALT_ROUNDS),
    'points': 0,
    'logo': '4chan-2',
    'data': {}
  }
}

async function createFBCTFExport (challenges, { insertHints, insertHintUrls, ctfKey, countryMapping }) {
  const fbctfTemplate = await loadTemplate()

  fbctfTemplate.teams.teams.push(await createDummyUser())

  // Add all challenges
  fbctfTemplate.levels.levels = challenges.map(({ key, name, description, difficulty, hint, hintUrl }) => {
    const country = countryMapping[key]
    if (!country) {
      console.warn(`Challenge "${name}" does not have a country mapping and will not appear in the CTF game!`.yellow)
      return false
    }

    let hintText = []
    if (insertHints !== options.noTextHints) {
      hintText.push(hint)
    }
    if (insertHintUrls !== options.noHintUrls) {
      hintText.push(hintUrl)
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
      'hint': hintText.join('\n'),
      'penalty': calculateHintCost({ difficulty }, insertHints) + calculateHintCost({ difficulty }, insertHintUrls),
      'links': [],
      'attachments': []
    }
  }).filter(Boolean)// Filter out levels without a proper country mapping.

  return fbctfTemplate
}

module.exports = createFBCTFExport
