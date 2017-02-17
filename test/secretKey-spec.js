var chai = require('chai')
var expect = chai.expect
var secretKey = require('../lib/secretKey')

describe('secretKey()', function () {
  it('should return input as key if it is not a URL', function (done) {
    expect(secretKey('ZJnHOTckstBeJP!QC2T')).to.eventually.equal('ZJnHOTckstBeJP!QC2T').and.notify(done)
  })
})
