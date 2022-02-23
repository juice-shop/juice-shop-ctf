/*
 * Copyright (c) 2016-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const Promise = require('bluebird')
const chai = require('chai')
chai.use(require('chai-as-promised'))
const expect = chai.expect
const rewire = require('rewire')
const fetchChallenges = rewire('../../lib/fetchChallenges')

describe('Challenges', () => {
  it('should be fetched from the given URL', () => {
    fetchChallenges.__set__({
      request (options) {
        expect(options).to.deep.equal({ url: 'http://localhost:3000/api/Challenges', strictSSL: true, json: true })
        return new Promise(resolve => { resolve({ data: { c1: { }, c2: { } } }) })
      }
    })
    return expect(fetchChallenges('http://localhost:3000')).to.eventually.deep.equal({ c1: { }, c2: { } })
  })

  it('should log retrieval error to console', () => {
    fetchChallenges.__set__({
      request () {
        return new Promise((resolve, reject) => { reject(new Error('Argh!')) })
      }
    })
    return expect(fetchChallenges('http://localh_%&$§rst:3000')).to.be.rejectedWith('Failed to fetch challenges from API! Argh!')
  })
})
