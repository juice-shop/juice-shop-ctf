/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import assert from 'node:assert'
import { describe, it } from 'node:test'
import rewire from 'rewire'

const fetchCountryMapping = rewire('../../lib/fetchCountryMapping').default || rewire('../../lib/fetchCountryMapping')

describe('Country mapping', () => {
  it('should be the body of the HTTP response if the given input is a URL', async () => {
    fetchCountryMapping.__set__({
      fetch: async () => ({
        ok: true,
        text: async () => `
ctf:
  countryMapping:
    scoreBoardChallenge:
      name: Canada
      code: CA
`
      })
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
      fetch: async () => {
        throw new Error('Argh!')
      }
    })
    await assert.rejects(
      () => fetchCountryMapping('http://localhorst:3000'),
      /Failed to fetch country mapping from API! Argh!/
    )
  })
})