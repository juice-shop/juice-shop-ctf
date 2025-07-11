/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as https from 'https'
import { options } from 'joi'
import * as yaml from 'js-yaml'

async function fetchChallenges(challengeMapFile: string, ignoreSslWarnings: boolean) {
  if (!challengeMapFile) {
    return Promise.resolve()
  }

  const agent = ignoreSslWarnings
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined

  try {
    const response = await fetch(challengeMapFile, options as any)
    const text = await response.text()
    const data = yaml.loadAll(text) as any[]
    return data[0].ctf.countryMapping
  } catch (err: any) {
    throw new Error('Failed to fetch country mapping from API! ' + err.message)
  }
}

export = fetchChallenges
