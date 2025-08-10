/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fetchSecretKey from '../../lib/fetchSecretKey';

describe('Secret key', () => {
  it('should be exactly the given input if it is not recognized as a URL', async () => {
    const result = await fetchSecretKey('ZJnHOTckstBeJP!QC2T', false);
    assert.equal(result, 'ZJnHOTckstBeJP!QC2T');
  });

  it('should be the body of the HTTP response if the given input is a URL', async () => {
    const result = await fetchSecretKey('http://localhorst:3000', false, {
      fetch: async () => new Response('ZJnHOTckstBeJP!QC2T',
         { status: 200 }
        )
    });
    assert.equal(result, 'ZJnHOTckstBeJP!QC2T');
  });

  it('should log retrieval error to console', async () => {
    await assert.rejects(
      () => fetchSecretKey('http://localhorst:3000', false, {
        fetch: async () => {
          throw new Error('Argh!');
        }
      }),
      /Failed to fetch secret key from URL! Argh!/
    );
  });

  it('should be exactly the given input for empty values', async () => {
    const result1 = await fetchSecretKey(undefined, false);
    assert.equal(result1, undefined);
    const result2 = await fetchSecretKey(null, false);
    assert.equal(result2, null);
  });
});