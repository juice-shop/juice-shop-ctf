'use strict'
var Promise = require('bluebird')
var calculateScore = require('./calculateScore')
var calculateHintCost = require('./calculateHintCost')
var hmacSha1 = require('./hmac')
var options = require('./options')

function generateData (challenges, insertHints, insertHintUrls, ctfKey) {
  function insertChallenge (data, challenge) {
    var score = calculateScore(challenge.difficulty)
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

  function insertKey (data, challenge) {
    data.flagKeys['results'].push(
      {
        'id': challenge.id,
        'chal': challenge.id,
        'type': 'static',
        'flag': hmacSha1(ctfKey, challenge.name),
        'data': null
      }
    )
  }

  function insertTextHint (data, challenge) {
    data.hints['results'].push(
      {
        'id': challenge.id,
        'type': 0,
        'chal': challenge.id,
        'hint': challenge.hint.replace(/"/g, '""'),
        'cost': calculateHintCost(challenge, insertHints)
      }
    )
  }

  function insertHintUrl (data, challenge) {
    data.hints['results'].push(
      {
        'id': 10000 + challenge.id,
        'type': 0,
        'chal': challenge.id,
        'hint': challenge.hintUrl,
        'cost': calculateHintCost(challenge, insertHintUrls)
      }
    )
  }

  return new Promise(function (resolve, reject) {
    try {
      var data = {
        challenges: {'results': []},
        hints: {'results': []},
        flagKeys: {'results': []}
      }
      for (var key in challenges) {
        if (challenges.hasOwnProperty(key)) {
          var challenge = challenges[key]
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

module.exports = generateData
