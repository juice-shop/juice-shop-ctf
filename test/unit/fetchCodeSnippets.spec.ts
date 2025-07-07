/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import assert from "node:assert";
import { describe, it } from "node:test";
import rewire from "rewire";

const fetchCodeSnippets = rewire('../../lib/fetchCodeSnippets').default || rewire('../../lib/fetchCodeSnippets');

const sleep = (ms:number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Code snippets', () => {
  it('should be fetched from the given URL', async () => {
    fetchCodeSnippets.__set__({
      fetch: async (url:string) => {
        if (url === 'http://localhost:3000/snippets') {
          return {
            ok: true,
            json: async () => ({ challenges: ['c1'] })
          };
        } else if (url === 'http://localhost:3000/snippets/c1') {
          await sleep(10); 
          return {
            ok: true,
            json: async () => ({ snippet: 'function c1 () {}' })
          };
        } else {
          throw new Error('Unexpected request: ' + url);
        }
      }
    });
    
    const snippet = await fetchCodeSnippets('http://localhost:3000');
    assert.deepEqual(snippet, { c1: 'function c1 () {}' });
  });

  it('should log retrieval error to console', async () => {
    fetchCodeSnippets.__set__({
      fetch: async () => {
        throw new Error('Argh!');
      }
    });
    
    await assert.rejects(
      () => fetchCodeSnippets('http://localh_%&$§rst:3000'),
      /Failed to fetch snippet from API! Argh!/  
    );
  });
});