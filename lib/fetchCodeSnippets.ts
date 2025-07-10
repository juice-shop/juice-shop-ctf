/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const https = require('https')

/**
 * Fetches code snippets from a Juice Shop instance
 */
async function fetchCodeSnippets(options:any) {
  // Parse options
  const juiceShopUrl = typeof options === 'string' ? options : options.juiceShopUrl
  const ignoreSslWarnings = typeof options === 'string' ? false : options.ignoreSslWarnings || false
  const skip = typeof options === 'string' ? false : options.skip || false

  if (skip) {
    return {}
  }

  // Set up agent for SSL
  const agent = ignoreSslWarnings
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined

  const fetchOptions = { agent }

  try {
    
    const challengesResponse = await fetch(`${juiceShopUrl}/snippets`, fetchOptions as any)

    if (!challengesResponse.ok) {
      throw new Error(`Snippets API returned status ${challengesResponse.status}`)
    }
    
    const responseData = await challengesResponse.json()
    
    if (!responseData.challenges || !Array.isArray(responseData.challenges)) {
      throw new Error('Invalid challenges format in response')
    }
    
    const { challenges } = responseData
    const snippets: { [key: string]: string } = {}
    
    // Fetch each snippet
    for (const challengeKey of challenges) {
      const snippetRes = await fetch(`${juiceShopUrl}/snippets/${challengeKey}`, fetchOptions as any)

      if (!snippetRes.ok) {
        continue
      }
      
      const snippetData = await snippetRes.json()
      
      if (snippetData.snippet) {
        snippets[challengeKey] = snippetData.snippet
      }
    }
    
    return snippets
  } catch (error:any) {
    throw new Error('Failed to fetch snippet from API! ' + error.message)
  }
}

module.exports = fetchCodeSnippets