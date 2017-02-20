var chai = require('chai')
var expect = chai.expect
var hmac = require('../lib/hmac')

describe('hmac()', function () {
  it('should create a SHA256 HMAC from plain text and secret key', function () {
    expect(hmac('text', 'ZJnHOTckstBeJP!QC2T')).to.equal('5188938396d17832dd26fbabd5ac4d79518a87da')
  })

  it('should create a SHA256 HMAC from plain text and empty secret key', function () {
    expect(hmac('text', '')).to.equal('f3f276f5001644013dbd202f1854bd61f9123d0f')
  })

  it('should create a different HMACs from different plain texts', function () {
    expect(hmac('text1', 'key')).to.not.equal(hmac('text2', 'key'))
  })
})
