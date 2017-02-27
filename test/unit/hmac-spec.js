var chai = require('chai')
var expect = chai.expect
var hmac = require('../../lib/hmac')

describe('Flag', function () {
  it('should be a SHA256 HMAC from plain text and given secret key', function () {
    expect(hmac('text', 'ZJnHOTckstBeJP!QC2T')).to.equal('5188938396d17832dd26fbabd5ac4d79518a87da')
  })

  it('should be a SHA256 HMAC from plain text and empty secret key', function () {
    expect(hmac('text', '')).to.equal('f3f276f5001644013dbd202f1854bd61f9123d0f')
  })

  it('should be different for different plain texts with same secret key', function () {
    expect(hmac('text1', 'key')).to.not.equal(hmac('text2', 'key'))
  })
})
