/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const assert = require("node:assert/strict")
const { describe,it } = require("node:test")
const rewire = require('rewire')
const fetchCountryMapping = rewire('../../lib/fetchCountryMapping')

describe('Country mapping', () => {
  it('should be the body of the HTTP response if the given input is a URL', async () => {
    fetchCountryMapping.__set__({
      request: async () => {
        return Promise.resolve(`
ctf:
  countryMapping:
    scoreBoardChallenge:
      name: Canada
      code: CA
`)
      }
    })
    const result = await fetchCountryMapping('http://localhorst:3000')
    assert.deepEqual(result, {
      scoreBoardChallenge: {
        name: 'Canada',
        code: 'CA'
      }
    })
  })

  it('should be undefined if no map file URL is given', async () => {
    const result = await fetchCountryMapping()
    assert.equal(result, undefined)
  })

  it('should log retrieval error to console', async () => {
    fetchCountryMapping.__set__({
      request: async () => {
        return new Promise((resolve, reject) => { reject(new Error('Argh!')) })
      }
    })
    const result = await assert.rejects(fetchCountryMapping('http://localhorst:3000'), /Failed to fetch country mapping from API! Argh!/)
    assert.equal(result, undefined)
  })
})
