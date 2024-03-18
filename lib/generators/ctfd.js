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

  //  In the flags section of the returned data we iterate through the result of string splitting by comma, and compute the hash of the single flag key + challenge name.
  //  Format expected is: challenge3,challenge description,category3,100,dynamic,visible,0,"flag1,flag2,flag3","tag1,tag2,tag3","hint1,hint2,hint3","{""initial"":100, ""minimum"":10, ""decay"":10}"
  //  If we provide a single key with no commas, we do not incapsulate the output in a "" pair.
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
              flags: ctfKey.split(',').length === 1 ? hmacSha1(ctfKey, challenge.name) : `"${ctfKey.split(',').map(key => `${hmacSha1(key, challenge.name)}`).join(',')}"`,
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
