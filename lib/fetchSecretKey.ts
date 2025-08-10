/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as https from 'node:https';
import isUrl from './url';

async function fetchSecretKey(
  origin: string | undefined | null, 
  ignoreSslWarnings: boolean,
  { fetch = globalThis.fetch } = { fetch: globalThis.fetch }
) {
  const agent = ignoreSslWarnings
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined;

  if (origin && isUrl(origin)) {
  try {
      const response = await fetch(origin, { agent } as any);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
    }
    
      const body = await response.text();
      return body;
    } catch (err) {
      throw new Error(
        "Failed to fetch secret key from URL! " +
          (err instanceof Error ? err.message : String(err))
      );
    }
  } else {
    return origin;
  }
}

export default fetchSecretKey;
