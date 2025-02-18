/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const Promise = require('bluebird')
const chai = require('chai')
chai.use(require('chai-as-promised'))
const expect = chai.expect
const rewire = require('rewire')
const fetchCountryMapping = rewire('../../lib/fetchCountryMapping')

describe('Country mapping', () => {
  it('should be the body of the HTTP response if the given input is a URL', () => {
    fetchCountryMapping.__set__({
      request () {
        return Promise.resolve(`
ctf:
  countryMapping:
    scoreBoardChallenge:
      name: Canada
      code: CA
`)
      }
    })
    return expect(fetchCountryMapping('http://localhorst:3000')).to.eventually.deep.equal({
      scoreBoardChallenge: {
        name: 'Canada',
        code: 'CA'
      }
    })
  })

  it('should be undefined if no map file URL is given', () => {
    return expect(fetchCountryMapping()).to.eventually.equal(undefined)
  })

  it('should log retrieval error to console', () => {
    fetchCountryMapping.__set__({
      request () {
        return new Promise((resolve, reject) => { reject(new Error('Argh!')) })
      }
    })
    return expect(fetchCountryMapping('http://localh_%&$§rst:3000')).to.be.rejectedWith('Failed to fetch country mapping from API! Argh!')
  })
})
