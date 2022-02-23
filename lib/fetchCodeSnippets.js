/*
 * Copyright (c) 2016-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const request = require('request-promise')

async function fetchCodeSnippets (juiceShopUrl, ignoreSslWarnings, skip = false) {
  if (skip) {
    return {}
  }
  try {
    const { challenges } = await request({
      url: juiceShopUrl + '/snippets',
      json: true,
      strictSSL: !ignoreSslWarnings
    })
    if (!challenges) {
      return {}
    }
    const snippets = {}
    const snippetList = await Promise.all(
      challenges.map(async (challengeKey) => {
        const { snippet } = await request({
          url: juiceShopUrl + '/snippets/' + challengeKey,
          json: true,
          strictSSL: !ignoreSslWarnings
        })
        return { challengeKey, snippet }
      })
    )

    for (const { challengeKey, snippet } of snippetList) {
      snippets[challengeKey] = snippet
    }
    return snippets
  } catch (error) {
    throw new Error('Failed to fetch snippet from API! ' + error.message)
  }
}

module.exports = fetchCodeSnippets
