/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const assert = require('node:assert')
const rewire = require('rewire')
const { describe, it } = require('node:test')
const fetchCodeSnippets = rewire('../../lib/fetchCodeSnippets')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

describe('Code snippets', () => {
  it('should be fetched from the given URL', async () => {
    fetchCodeSnippets.__set__({
      request (options) {
        if (options.url === 'http://localhost:3000/snippets') {
          assert.deepEqual(options, { url: 'http://localhost:3000/snippets', json: true, strictSSL: true })
          return new Promise(resolve => { resolve({ challenges: ['c1'] }) })
        } else if (options.url === 'http://localhost:3000/snippets/c1') {
          assert.deepEqual(options, { url: 'http://localhost:3000/snippets/c1', json: true, strictSSL: true })
          return sleep(10).then(() => ({ snippet: 'function c1 () {}' }))
        } else {
          throw new Error('Unexpected request: ' + options.url)
        }
      }
    })
    const snippet = await fetchCodeSnippets('http://localhost:3000')
    assert.deepEqual(snippet, { c1: 'function c1 () {}' })
  })

  it('should log retrieval error to console', () => {
    fetchCodeSnippets.__set__({
      request () {
        return new Promise((resolve, reject) => { reject(new Error('Argh!')) })
      }
    })
    return assert.rejects(fetchCodeSnippets('http://localh_%&$§rst:3000'))
  })
})
