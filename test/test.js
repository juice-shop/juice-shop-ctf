var chai = require('chai')
var expect = chai.expect
var juiceShopCtfCli = require('../index')

describe('#isUrl()', function () {
  it('should recognize a valid HTTP URL', function () {
    expect(juiceShopCtfCli.isUrl('http://domain')).to.be.true
  })

  it('should recognize a valid HTTPS URL', function () {
    expect(juiceShopCtfCli.isUrl('https://domain')).to.be.true
  })

  it('should recognize a valid IP address URL', function () {
    expect(juiceShopCtfCli.isUrl('127.0.0.1')).to.be.true
  })

  it('should not take an HMAC key for a URL', function () {
    expect(juiceShopCtfCli.isUrl('ZRwakRJnHOTckstBeyJbyswgP!QC2T')).to.be.false
  })
})
