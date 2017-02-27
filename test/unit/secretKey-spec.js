var Promise = require('bluebird')
var chai = require('chai')
var expect = chai.expect
var rewire = require('rewire')
var secretKey = rewire('../../lib/secretKey')

describe('Secret key', function () {
  it('should be exactly the given input if it is not recognized as a URL', function (done) {
    expect(secretKey('ZJnHOTckstBeJP!QC2T')).to.eventually.equal('ZJnHOTckstBeJP!QC2T').and.notify(done)
  })

  it('should be the body of the HTTP response if the given input is a URL', function (done) {
    secretKey.__set__({
      request: function () {
        return new Promise(function (resolve) { resolve('ZJnHOTckstBeJP!QC2T') })
      }
    })
    expect(secretKey('http://localhorst:3000')).to.eventually.equal('ZJnHOTckstBeJP!QC2T').and.notify(done)
  })
})

