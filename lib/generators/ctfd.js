const Promise = require('bluebird')
const calculateScore = require('../calculateScore')
const calculateHintCost = require('../calculateHintCost')
const hmacSha1 = require('../hmac')
const options = require('../options')

function createCTFdExport (challenges, { insertHints, insertHintUrls, ctfKey }) {
  function insertChallenge (data, challenge) {
    const score = calculateScore(challenge.difficulty)
    data.challenges['results'].push(
      {
        'id': challenge.id,
        'name': challenge.name,
        'description': challenge.description.replace(/"/g, '""') + ' (Difficulty Level: ' + challenge.difficulty + ')',
        'max_attempts': 0,
        'value': score,
        'category': challenge.category,
        'type': 'standard',
        'hidden': false
      }
    )
  }

  function insertKey ({ flagKeys }, { id, name }) {
    flagKeys['results'].push(
      {
        'id': id,
        'chal': id,
        'type': 'static',
        'flag': hmacSha1(ctfKey, name),
        'data': null
      }
    )
  }

  function insertTextHint ({ hints }, challenge) {
    hints['results'].push(
      {
        'id': challenge.id,
        'type': 0,
        'chal': challenge.id,
        'hint': challenge.hint,
        'cost': calculateHintCost(challenge, insertHints)
      }
    )
  }

  function insertHintUrl ({ hints }, challenge) {
    hints['results'].push(
      {
        'id': 10000 + challenge.id,
        'type': 0,
        'chal': challenge.id,
        'hint': challenge.hintUrl,
        'cost': calculateHintCost(challenge, insertHintUrls)
      }
    )
  }

  return new Promise((resolve, reject) => {
    try {
      const data = {
        challenges: { 'results': [] },
        hints: { 'results': [] },
        flagKeys: { 'results': [] }
      }
      for (const key in challenges) {
        if (challenges.hasOwnProperty(key)) {
          const challenge = challenges[key]
          insertChallenge(data, challenge)
          insertKey(data, challenge)
          if (challenge.hint && insertHints !== options.noTextHints) {
            insertTextHint(data, challenge)
          }
          if (challenge.hintUrl && insertHintUrls !== options.noHintUrls) {
            insertHintUrl(data, challenge)
          }
        }
      }
      resolve(data)
    } catch (error) {
      reject(new Error('Failed to generate challenge data! ' + error.message))
    }
  })
}

module.exports = createCTFdExport
