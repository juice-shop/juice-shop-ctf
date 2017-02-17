var chai = require('chai')
var expect = chai.expect
var url = require('../lib/url')

describe('url()', function () {
  it('should recognize a valid HTTP URL', function () {
    expect(url('http://domain')).to.be.true
  })

  it('should recognize a valid HTTPS URL', function () {
    expect(url('https://domain')).to.be.true
  })

  it('should recognize a valid IP address URL', function () {
    expect(url('127.0.0.1')).to.be.true
  })

  it('should not take an HMAC key for a URL', function () {
    expect(url('ZRwakRJnHOTckstBeyJbyswgP!QC2T')).to.be.false
  })
})
