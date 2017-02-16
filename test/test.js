var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
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

describe('#toHmac()', function () {
  it('should create a SHA256 HMAC from plain text and secret key', function () {
    expect(juiceShopCtfCli.toHmac('text', 'ZJnHOTckstBeJP!QC2T')).to.equal('5188938396d17832dd26fbabd5ac4d79518a87da')
  })

  it('should create a SHA256 HMAC from plain text and empty secret key', function () {
    expect(juiceShopCtfCli.toHmac('text', '')).to.equal('f3f276f5001644013dbd202f1854bd61f9123d0f')
  })

  it('should create a different HMACs from different plain texts', function () {
    expect(juiceShopCtfCli.toHmac('text1', 'key')).to.not.equal(juiceShopCtfCli.toHmac('text2', 'key'))
  })
})

describe('#fetchHmacKey()', function () {
  it('should return input as key if it is not a URL', function () {
    expect(juiceShopCtfCli.fetchHmacKey('ZJnHOTckstBeJP!QC2T')).to.become('ZJnHOTckstBeJP!QC2T')
  })
})
