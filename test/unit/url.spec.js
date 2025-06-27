/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const assert = require('node:assert')
const { describe, it } = require('node:test')
const url = require('../../lib/url')

describe('URL', () => {
  it('should be recognized on given valid HTTP URL', () => {
    assert.strictEqual(url('http://domain'), true)
  })

  it('should be recognized on given valid HTTPS URL', () => {
    assert.strictEqual(url('https://domain'), true)
  })

  it('should be recognized on given valid IP address', () => {
    assert.strictEqual(url('127.0.0.1'), true)
  })

  it('should not be recognized on given HMAC key', () => {
    assert.strictEqual(url('ZRwakRJnHOTckstBeyJbyswgP!QC2T'), false)
  })
})
