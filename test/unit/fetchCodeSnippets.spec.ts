/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import assert from "node:assert";
import { describe, it } from "node:test";
import fetchCodeSnippets from "../../lib/fetchCodeSnippets";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Code snippets', () => {
  it('should be fetched from the given URL', async () => {
    const snippet = await fetchCodeSnippets('http://localhost:3000', {
      fetch: async (url: RequestInfo | URL) => {
        if (url === 'http://localhost:3000/snippets') {
          return new Response(JSON.stringify({ challenges: ['c1'] }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } else if (url === 'http://localhost:3000/snippets/c1') {
          await sleep(10); 
          return new Response(JSON.stringify({ snippet: 'function c1 () {}' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          throw new Error('Unexpected request: ' + url);
        }
      }
    });
    
    assert.deepEqual(snippet, { c1: 'function c1 () {}' });
  });

  it('should log retrieval error to console', async () => {
    await assert.rejects(
      () => fetchCodeSnippets('http://localh_%&$§rst:3000', {
        fetch: async (_: RequestInfo | URL) => {
          throw new Error('Argh!');
        }
      }),
      /Failed to fetch snippet from API! Argh!/  
    );
  });
}); 