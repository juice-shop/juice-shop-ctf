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

async function fetchCodeSnippets(options: string | FetchOptions): Promise<{ [key: string]: string }> {
  const juiceShopUrl = typeof options === 'string' ? options : options.juiceShopUrl;
  const ignoreSslWarnings = typeof options === 'string' ? false : options.ignoreSslWarnings || false;
  const skip = typeof options === 'string' ? false : options.skip || false;

  if (skip) {
    return {};
  }

  const agent = ignoreSslWarnings
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined;

  const fetchOptions: { agent: https.Agent | undefined } = { agent };

  try {
    
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

export = fetchCodeSnippets