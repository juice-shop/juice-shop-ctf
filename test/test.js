var chai = require('chai')
var chaiAsPromised = require('chai-as-promised')
chai.use(chaiAsPromised)
var expect = chai.expect
var rewire = require('rewire')
var juiceShopCtfCli = rewire('../index')

describe('#isUrl()', function () {
  var isUrl = juiceShopCtfCli.__get__('isUrl')

  it('should recognize a valid HTTP URL', function () {
    expect(isUrl('http://domain')).to.be.true
  })

  it('should recognize a valid HTTPS URL', function () {
    expect(isUrl('https://domain')).to.be.true
  })

  it('should recognize a valid IP address URL', function () {
    expect(isUrl('127.0.0.1')).to.be.true
  })

  it('should not take an HMAC key for a URL', function () {
    expect(isUrl('ZRwakRJnHOTckstBeyJbyswgP!QC2T')).to.be.false
  })
})

describe('#toHmac()', function () {
  var toHmac = juiceShopCtfCli.__get__('toHmac')

  it('should create a SHA256 HMAC from plain text and secret key', function () {
    expect(toHmac('text', 'ZJnHOTckstBeJP!QC2T')).to.equal('5188938396d17832dd26fbabd5ac4d79518a87da')
  })

  it('should create a SHA256 HMAC from plain text and empty secret key', function () {
    expect(toHmac('text', '')).to.equal('f3f276f5001644013dbd202f1854bd61f9123d0f')
  })

  it('should create a different HMACs from different plain texts', function () {
    expect(toHmac('text1', 'key')).to.not.equal(toHmac('text2', 'key'))
  })
})

describe('#fetchHmacKey()', function () {
  var fetchHmacKey = juiceShopCtfCli.__get__('fetchHmacKey')

  it('should return input as key if it is not a URL', function (done) {
    expect(fetchHmacKey('ZJnHOTckstBeJP!QC2T')).to.eventually.equal('ZJnHOTckstBeJP!QC2T').and.notify(done)
  })
})
