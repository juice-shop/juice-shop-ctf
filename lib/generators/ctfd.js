/*
 * Copyright (c) 2016-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const Promise = require('bluebird')
const calculateScore = require('../calculateScore')
// const calculateHintCost = require('../calculateHintCost')
const hmacSha1 = require('../hmac')
const options = require('../options')

function createCtfdExport (challenges, { insertHints, insertHintUrls, insertHintSnippets, ctfKey, vulnSnippets }) {
  function insertChallengeHints (challenge) {
    const hints = []
    if (challenge.hint && insertHints !== options.noTextHints) {
      hints.push(challenge.hint.replaceAll('"', '""').replaceAll(',', '٬'))
    }
    if (challenge.hintUrl && insertHintUrls !== options.noHintUrls) {
      hints.push(challenge.hintUrl)
    }
    if (vulnSnippets[challenge.key] && insertHintSnippets !== options.noHintSnippets) {
      hints.push('<pre><code>' + vulnSnippets[challenge.key].replaceAll('"', '""').replaceAll(',', '٬') + '</code></pre>')
    }
    return (hints.length === 0 ? '' : `"${hints.join(',')}"`)
  }

  /*
  function insertChallengeHintCosts (challenge) {
    const hintCosts = []
    if (challenge.hint && insertHints !== options.noTextHints) {
      hintCosts.push(calculateHintCost(challenge, insertHints))
    }
    if (challenge.hintUrl && insertHintUrls !== options.noHintUrls) {
      hintCosts.push(calculateHintCost(challenge, insertHintUrls))
    }
    if (vulnSnippets[challenge.key] && insertHintSnippets !== options.noHintSnippets) {
      hintCosts.push(calculateHintCost(challenge, insertHintSnippets))
    }
    return (hintCosts.length === 0 ? '' : `"${hintCosts.join(',')}"`)
  }
*/

  return new Promise((resolve, reject) => {
    try {
      const data = []
      for (const key in challenges) {
        if (Object.prototype.hasOwnProperty.call(challenges, key)) {
          const challenge = challenges[key]
          data.push(
            {
              name: challenge.name,
              description: `"${challenge.description.replaceAll('"', '""')} (Difficulty Level: ${challenge.difficulty})"`,
              category: challenge.category,
              value: calculateScore(challenge.difficulty),
              type: 'standard',
              state: 'visible',
              max_attempts: 0,
              flags: hmacSha1(ctfKey, challenge.name),
              tags: challenge.tags ? `"${challenge.tags}"` : '',
              hints: insertChallengeHints(challenge),
              // hint_cost: insertChallengeHintCosts(challenge),
              type_data: ''
            }
          )
        }
      }
      resolve(data)
    } catch (error) {
      reject(new Error('Failed to generate challenge data! ' + error.message))
    }
  })
}

module.exports = createCtfdExport
