/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as https from 'node:https'
import type { Challenge } from './types/types'

async function fetchChallenges (
  juiceShopUrl: string,
  ignoreSslWarnings: boolean,
  { fetch = globalThis.fetch } = { fetch: globalThis.fetch }
): Promise<Challenge[]> {
  const agent = ignoreSslWarnings
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined

  const options = { agent }

  try {
    const response = await fetch(
  `${juiceShopUrl}/api/Challenges`,
  options as RequestInit | undefined
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const json = (await response.json()) as { data: Challenge[] }
    return json.data
  } catch (err: any) {
    throw new Error('Failed to fetch challenges from API! Argh!' + err.message)
  }
}

export default fetchChallenges
