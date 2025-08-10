/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as https from 'node:https';
import yaml from 'js-yaml';

async function fetchCountryMapping(
  challengeMapFile?: string,
  ignoreSslWarnings?: boolean,
  { fetch = globalThis.fetch } = { fetch: globalThis.fetch }
): Promise<Record<string, any> | undefined> {
  if (!challengeMapFile) {
    return undefined;
  }

  const agent = ignoreSslWarnings
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined
  const options = { agent };
 
  try {
    const response = await fetch(challengeMapFile, options as any)
    const text = await response.text()
    const data = yaml.loadAll(text) as any[]
    return data[0].ctf.countryMapping
  } catch (err: any) {
    throw new Error('Failed to fetch country mapping from API! ' + err.message)
  }
}

export default fetchCountryMapping;
