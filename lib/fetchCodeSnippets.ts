/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as https from 'https'

interface FetchOptions {
  juiceShopUrl: string;
  ignoreSslWarnings?: boolean;
  skip?: boolean;
}

interface SnippetsApiResponse {
  challenges: string[];
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
    // this is actually broken. /snippets doesn't exist anymore as a endpoint in JuiceShop, now needs to be determined from the `hasCodingChallenge: true` attribute on the challenge response.
    const challengesResponse = await fetch(`${juiceShopUrl}/snippets`, fetchOptions as any);

    if (!challengesResponse.ok) {
      throw new Error(`Snippets API returned status ${challengesResponse.status}`);
    }
    
    const responseData = await challengesResponse.json() as SnippetsApiResponse;
    
    if (!responseData.challenges || !Array.isArray(responseData.challenges)) {
      throw new Error('Invalid challenges format in response');
    }
    
    const { challenges } = responseData;
    const snippets: { [key: string]: string } = {};
    
    // Fetch each snippet
    for (const challengeKey of challenges) {
      const snippetRes = await fetch(`${juiceShopUrl}/snippets/${challengeKey}`, fetchOptions as any);

      if (!snippetRes.ok) {
        continue;
      }
      
      const snippetData = await snippetRes.json() as SnippetApiResponse;
      
      if (snippetData.snippet) {
        snippets[challengeKey] = snippetData.snippet;
      }
    }
    
    return snippets;
  } catch (error: any) {
    throw new Error('Failed to fetch snippet from API! ' + error.message);
  }
}

export default fetchCodeSnippets;
