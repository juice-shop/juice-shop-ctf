var chai = require('chai')
var expect = chai.expect
var url = require('../../lib/url')

describe('URL', function () {
  it('should be recognized on given valid HTTP URL', function () {
    expect(url('http://domain')).to.equal(true)
  })

  it('should be recognized on given valid HTTPS URL', function () {
    expect(url('https://domain')).to.equal(true)
  })

  it('should be recognized on given valid IP address', function () {
    expect(url('127.0.0.1')).to.equal(true)
  })

  it('should not be recognized on given HMAC key', function () {
    expect(url('ZRwakRJnHOTckstBeyJbyswgP!QC2T')).to.equal(false)
  })
})
