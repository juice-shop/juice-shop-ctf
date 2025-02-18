/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const chai = require('chai')
const expect = chai.expect
const url = require('../../lib/url')

describe('URL', () => {
  it('should be recognized on given valid HTTP URL', () => {
    expect(url('http://domain')).to.equal(true)
  })

  it('should be recognized on given valid HTTPS URL', () => {
    expect(url('https://domain')).to.equal(true)
  })

  it('should be recognized on given valid IP address', () => {
    expect(url('127.0.0.1')).to.equal(true)
  })

  it('should not be recognized on given HMAC key', () => {
    expect(url('ZRwakRJnHOTckstBeyJbyswgP!QC2T')).to.equal(false)
  })
})
