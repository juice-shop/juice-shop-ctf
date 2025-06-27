/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const assert = require('node:assert')
const{ describe, it } = require('node:test')
const rewire = require('rewire')
const fetchChallenges = rewire('../../lib/fetchChallenges')

describe('Challenges', () => {
  it('should be fetched from the given URL', async () => {
    fetchChallenges.__set__({
      request (options) {
        assert.deepEqual(options, { url: 'http://localhost:3000/api/Challenges', strictSSL: true, json: true })
        return new Promise(resolve => { resolve({ data: { c1: { }, c2: { } } }) })
      }
    })
    const result = await fetchChallenges('http://localhost:3000')
    assert.deepEqual(result, { c1: { }, c2: { } })
  })

  it('should log retrieval error to console', async () => {
    fetchChallenges.__set__({
      request () {
        return new Promise((resolve, reject) => { reject(new Error('Argh!')) })
      }
    })
    return assert.rejects(
      fetchChallenges('http://localh_%&$§rst:3000')   
    )
  })
})
