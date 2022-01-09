
/*
 * Copyright (c) 2016-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const calculateScore = require('../calculateScore')
// todo(@J12934) hint costs unlcear in csv :(
// const calculateHintCost = require('../calculateHintCost')
const hmacSha1 = require('../hmac')
// todo(@J12934) incorporate options
// const options = require('../options')

async function createCtfd3Export (challenges, { insertHints, insertHintUrls, insertHintSnippets, ctfKey, vulnSnippets }) {
  return challenges.map((challenge) => {
    return {
      name: challenge.name,
      description: `${challenge.description} (Difficulty Level: ${challenge.difficulty})`,
      category: challenge.category,
      value: calculateScore(challenge.difficulty),
      type: 'standard',
      state: 'visible',
      max_attempts: 0,
      flags: hmacSha1(ctfKey, challenge.name),
      tags: challenge.tags ?? '',
      hints: challenge.hint,
      type_data: ''
    }
  })
}

module.exports = createCtfd3Export
