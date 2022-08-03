/*
 * Copyright (c) 2016-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const Promise = require('bluebird')
const calculateScore = require('../calculateScore')
const calculateHintCost = require('../calculateHintCost')
const hmacSha1 = require('../hmac')
const options = require('../options')

function createCtfdExport (challenges, { insertHints, insertHintUrls, insertHintSnippets, ctfKey, vulnSnippets }) {
  function insertChallenge (data, challenge) {
    const score = calculateScore(challenge.difficulty)
    challenge.description = challenge.description.replace('`xss`', '&#x60;xss&#x60;')
    data.challenges.results.push(
      {
        id: challenge.id,
        name: challenge.name,
        description: challenge.description + ' (Difficulty Level: ' + challenge.difficulty + ')',
        max_attempts: 0,
        value: score,
        category: challenge.category,
        type: 'standard',
        state: 'visible',
        next_id: null // TODO Use "tutorialOrder" to recommend order of first challenges; leave null for rest
      }
    )
  }

  function insertKey ({ flagKeys }, { id, name }) {
    flagKeys.results.push(
      {
        id: id,
        challenge_id: id,
        type: 'static',
        content: hmacSha1(ctfKey, name),
        data: null
      }
    )
  }

  function insertTextHint ({ hints }, challenge) {
    hints.results.push(
      {
        id: challenge.id,
        type: 'standard',
        challenge_id: challenge.id,
        content: challenge.hint,
        cost: calculateHintCost(challenge, insertHints)
      }
    )
  }

  function insertHintUrl ({ hints }, challenge, hasTextHintPrerequisite) {
    hints.results.push(
      {
        id: 10000 + challenge.id,
        type: 'standard',
        challenge_id: challenge.id,
        content: challenge.hintUrl,
        cost: calculateHintCost(challenge, insertHintUrls),
        requirements: hasTextHintPrerequisite ? { prerequisites: [challenge.id] } : null
      }
    )
  }

  function insertHintSnippet ({ hints }, challenge, snippet, hasTextHintPrerequisite, hasHintUrlPrerequisite) {
    hints.results.push(
      {
        id: 20000 + challenge.id,
        type: 'standard',
        challenge_id: challenge.id,
        content: '<pre><code>' + snippet + '</code></pre>',
        cost: calculateHintCost(challenge, insertHintSnippets),
        requirements: hasTextHintPrerequisite ? (hasHintUrlPrerequisite ? { prerequisites: [challenge.id, 10000 + challenge.id] } : { prerequisites: [challenge.id] }) : (hasHintUrlPrerequisite ? { prerequisites: [10000 + challenge.id] } : null)
      }
    )
  }

  function insertTags ({ tags }, challenge) {
    if (!challenge.tags) {
      return
    }
    tags.results.push(
      ...challenge.tags.split(',').map((tag, index) => {
        return {
          id: (challenge.id * 100) + index,
          challenge_id: challenge.id,
          value: tag
        }
      })
    )
  }

  return new Promise((resolve, reject) => {
    try {
      const data = {
        challenges: { results: [] },
        hints: { results: [] },
        flagKeys: { results: [] },
        tags: { results: [] }
      }
      for (const key in challenges) {
        if (Object.prototype.hasOwnProperty.call(challenges, key)) {
          const challenge = challenges[key]
          insertChallenge(data, challenge)
          insertKey(data, challenge)
          insertTags(data, challenge)
          if (challenge.hint && insertHints !== options.noTextHints) {
            insertTextHint(data, challenge)
          }
          if (challenge.hintUrl && insertHintUrls !== options.noHintUrls) {
            insertHintUrl(data, challenge, insertHints !== options.noTextHints)
          }
          if (vulnSnippets[challenge.key] && insertHintSnippets !== options.noHintSnippets) {
            insertHintSnippet(data, challenge, vulnSnippets[challenge.key], insertHints !== options.noTextHints, insertHintUrls !== options.noHintUrls)
          }
        }
      }
      resolve(data)
    } catch (error) {
      reject(new Error('Failed to generate challenge data! ' + error.message))
    }
  })
}

module.exports = createCtfdExport
