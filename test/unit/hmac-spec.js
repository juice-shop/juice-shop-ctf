const chai = require('chai')
const expect = chai.expect
const hmacSha1 = require('../../lib/hmac')

describe('Flag', () => {
  it('should be a SHA256 HMAC from plain text and given secret key', () => {
    expect(hmacSha1('ZJnHOTckstBeJP!QC2T', 'text')).to.equal('5188938396d17832dd26fbabd5ac4d79518a87da')
  })

  it('should be a SHA256 HMAC from plain text and empty secret key', () => {
    expect(hmacSha1('', 'text')).to.equal('f3f276f5001644013dbd202f1854bd61f9123d0f')
  })

  it('should be different for different plain texts with same secret key', () => {
    expect(hmacSha1('key', 'text1')).to.not.equal(hmacSha1('key', 'text2'))
  })
})
