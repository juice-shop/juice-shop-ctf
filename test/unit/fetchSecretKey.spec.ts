/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import assert from 'node:assert/strict'
import rewire from 'rewire' 
const fetchSecretKey = rewire('../../lib/fetchSecretKey').default || rewire('../../lib/fetchSecretKey')
import { describe, it } from 'node:test'

describe('Secret key', () => {
  it('should be exactly the given input if it is not recognized as a URL', async () => {
    const result = await fetchSecretKey('ZJnHOTckstBeJP!QC2T')
    assert.equal(result, 'ZJnHOTckstBeJP!QC2T')
  })

  it('should be the body of the HTTP response if the given input is a URL', async () => {
    fetchSecretKey.__set__({
      fetch: async () => ({
        ok: true,
        text: async () => 'ZJnHOTckstBeJP!QC2T'
      })
    })
    const result = await fetchSecretKey('http://localhorst:3000')
    assert.equal(result, 'ZJnHOTckstBeJP!QC2T')
  })

  it('should log retrieval error to console', async () => {
    fetchSecretKey.__set__({
      fetch: async () => {
        throw new Error('Argh!')
      }
    })
    await assert.rejects(
      () => fetchSecretKey('http://localhorst:3000'),
      /Failed to fetch secret key from URL! Argh!/
    )
  })

  it('should be exactly the given input for empty values', async () => {
    const result1 = await fetchSecretKey(undefined)
    assert.equal(result1, undefined)
    const result2 = await fetchSecretKey(null)
    assert.equal(result2, null)
  })
})