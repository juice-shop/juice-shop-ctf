/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const test = require('node:test')
const assert = require('node:assert/strict')
const { describe, it } = test
const rewire = require('rewire')
const fetchSecretKey = rewire('../../lib/fetchSecretKey')

describe('Secret key', () => {
  it('should be exactly the given input if it is not recognized as a URL', async () => {
    const result = await fetchSecretKey('ZJnHOTckstBeJP!QC2T')
    assert.equal(result, 'ZJnHOTckstBeJP!QC2T')
  })

  it('should be the body of the HTTP response if the given input is a URL', async () => {
    fetchSecretKey.__set__({
      request: async () => {
        return new Promise(resolve => { resolve('ZJnHOTckstBeJP!QC2T') })
      }
    })
    const result = await fetchSecretKey('http://localhorst:3000')
    assert.equal(result, 'ZJnHOTckstBeJP!QC2T')
  })

  it('should log retrieval error to console', async () => {
    fetchSecretKey.__set__({
      request: async () => {
        return new Promise((resolve, reject) => { reject(new Error('Argh!')) })
      }
    })
    await assert.rejects(fetchSecretKey('http://localhorst:3000'), /Failed to fetch secret key from URL! Argh!/)
  })

  it('should be exactly the given input for empty values', async () => {
    const result1 = await fetchSecretKey(undefined)
    assert.equal(result1, undefined)
    const result2 = await fetchSecretKey(null)
    assert.equal(result2, null)
  })
})
