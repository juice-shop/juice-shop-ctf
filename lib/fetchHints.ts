/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as https from 'node:https'
import type { Hint } from './types/types'

async function fetchHints (
  juiceShopUrl: string,
  ignoreSslWarnings: boolean,
  skip: boolean = false,
  { fetch = globalThis.fetch } = { fetch: globalThis.fetch }
): Promise<Hint[]> {
  if (skip) {
    return []
  }

  const agent = ignoreSslWarnings
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined

  const options = { agent }

  try {
    const response = await fetch(
  `${juiceShopUrl}/api/Hints`,
  options as RequestInit | undefined
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const json = (await response.json()) as { data: Hint[] }
    return json.data
  } catch (err: any) {
    throw new Error('Failed to fetch hints from API! Argh! ' + err.message)
  }
}

export default fetchHints
