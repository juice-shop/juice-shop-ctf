/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as https from 'https'
import type { Challenge } from './types/types';

interface FetchOptions {
  juiceShopUrl: string;
  ignoreSslWarnings?: boolean;
  skip?: boolean;
}

interface SnippetApiResponse {
  snippet: string;
}

async function fetchCodeSnippets(
  { juiceShopUrl, ignoreSslWarnings = false, skip = false }: FetchOptions,
  { fetch = globalThis.fetch } = { fetch: globalThis.fetch }
): Promise<{ [key: string]: string }> {
  if (skip) {
    return {};
  }

  const agent = ignoreSslWarnings
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined;

  const fetchOptions: { agent: https.Agent | undefined } = { agent };

  try {
    const challengesResponse = await fetch(`${juiceShopUrl}/api/challenges`, fetchOptions as any);

    if (!challengesResponse.ok) {
      throw new Error(`Snippets API returned status ${challengesResponse.status}`);
    }
    
    const { data: challenges} = await challengesResponse.json() as { data: Challenge[]};
    
    if (!challenges || !Array.isArray(challenges)) {
      throw new Error('Invalid challenges format in response');
    }

    const challengesWithSnippets = challenges.filter(challenge => challenge.hasCodingChallenge)

    const snippets: { [key: string]: string } = {};
    
    // Fetch each snippet
    for (const challenge of challengesWithSnippets) {
      const snippetResponse = await fetch(`${juiceShopUrl}/snippets/${challenge.key}`, fetchOptions as any);
      if (!snippetResponse.ok) {
        continue;
      }
      const snippetData = await snippetResponse.json() as SnippetApiResponse;

      if (snippetData.snippet) {
        snippets[challenge.key] = snippetData.snippet;
      }
    }
    
    return snippets;
  } catch (error: any) {
    throw new Error('Failed to fetch snippet from API! ' + error.message);
  }
}

export default fetchCodeSnippets;
