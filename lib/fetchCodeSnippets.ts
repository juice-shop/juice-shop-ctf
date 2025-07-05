/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as https from 'https'

interface CodeSnippetsOptions {
  juiceShopUrl: string
  ignoreSslWarnings: boolean
  skip?: boolean
}

interface SnippetResponse {
  snippet: string
}

async function fetchCodeSnippets(
  options: string | CodeSnippetsOptions
): Promise<Record<string, string>> {
  const { juiceShopUrl, ignoreSslWarnings, skip = false } =
    typeof options === 'string'
      ? { juiceShopUrl: options, ignoreSslWarnings: false, skip: false }
      : options

  if (skip) {
    return {}
  }

  const agent = ignoreSslWarnings
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined

  const fetchOptions = { agent, headers: { 'Content-Type': 'application/json' } }

  try {
    const challengesResponse = await fetch(`${juiceShopUrl}/snippets`, fetchOptions)

    if (!challengesResponse.ok) {
      throw new Error(`Failed to fetch snippet list: ${challengesResponse.status}`)
    }

    const { challenges }: { challenges: string[] } = await challengesResponse.json()

    if (!challenges) {
      return {}
    }

    const snippets: Record<string, string> = {}

    const snippetList = await Promise.all(
      challenges.map(async (challengeKey) => {
        const snippetRes = await fetch(`${juiceShopUrl}/snippets/${challengeKey}`, fetchOptions)

        if (!snippetRes.ok) {
          throw new Error(`Failed to fetch snippet for ${challengeKey}: ${snippetRes.status}`)
        }

        const { snippet }: SnippetResponse = await snippetRes.json()
        return { challengeKey, snippet }
      })
    )

    for (const { challengeKey, snippet } of snippetList) {
      snippets[challengeKey] = snippet
    }

    return snippets
  } catch (error: any) {
    throw new Error('Failed to fetch snippet from API! ' + error.message)
  }
}

export = fetchCodeSnippets
