/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import assert from 'node:assert';
import { describe, it } from 'node:test';
import fetchCountryMapping from '../../lib/fetchCountryMapping';

describe('Country mapping', () => {
  it('should be the body of the HTTP response if the given input is a URL', async () => {
    const result = await fetchCountryMapping('http://localhorst:3000', false, {
      fetch: async () =>
        new Response(
          `
ctf:
  countryMapping:
    scoreBoardChallenge:
      name: Canada
      code: CA
`
   ) 
    });
    assert.deepEqual(result, {
      scoreBoardChallenge: {
        name: 'Canada',
        code: 'CA'
      }
    });
  });

  it('should be empty if no map file URL is given', async () => {
    const result = await fetchCountryMapping();
    assert.deepEqual(result, {});
  });

  it('should log retrieval error to console', async () => {
    await assert.rejects(
      () => fetchCountryMapping('http://localhorst:3000', false, {
        fetch: async () => {
          throw new Error('Argh!');
        }
      }),
      /Failed to fetch country mapping from API! Argh!/
    );
  });
});