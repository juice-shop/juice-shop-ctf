/*
 * Copyright (c) 2016-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const Promise = require('bluebird')
const chai = require('chai')
chai.use(require('chai-as-promised'))
const expect = chai.expect
const rewire = require('rewire')
const fetchCodeSnippets = rewire('../../lib/fetchCodeSnippets')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

describe('Code snippets', () => {
  it('should be fetched from the given URL', async () => {
    fetchCodeSnippets.__set__({
      request (options) {
        if (options.url === 'http://localhost:3000/snippets') {
          expect(options).to.deep.equal({ url: 'http://localhost:3000/snippets', json: true, strictSSL: true })
          return new Promise(resolve => { resolve({ challenges: ['c1'] }) })
        } else if (options.url === 'http://localhost:3000/snippets/c1') {
          expect(options).to.deep.equal({ url: 'http://localhost:3000/snippets/c1', json: true, strictSSL: true })
          return sleep(10).then(() => ({ snippet: 'function c1 () {}' }))
        } else {
          expect(false, 'Unexpected request: ' + options)
        }
      }
    })
    const snippet = await fetchCodeSnippets('http://localhost:3000')
    expect(snippet).to.deep.equal({ c1: 'function c1 () {}' })
  })

  xit('should log retrieval error to console', () => {
    fetchCodeSnippets.__set__({
      request () {
        return new Promise((resolve, reject) => { reject(new Error('Argh!')) })
      }
    })
    return expect(fetchCodeSnippets('http://localh_%&$§rst:3000')).to.be.rejectedWith('Failed to fetch snippet challenges from API! Argh!')
  })
})
