var Promise = require('bluebird')
var chai = require('chai')
var expect = chai.expect
var rewire = require('rewire')
var secretKey = rewire('../lib/secretKey')

describe('secretKey()', function () {
  it('should return input as key if it is not a URL', function (done) {
    expect(secretKey('ZJnHOTckstBeJP!QC2T')).to.eventually.equal('ZJnHOTckstBeJP!QC2T').and.notify(done)
  })

  it('should return body of response as key if the input is a URL', function (done) {
    secretKey.__set__({
      request: function () {
        return new Promise(function (resolve) { resolve('ZJnHOTckstBeJP!QC2T') })
      }
    })
    expect(secretKey('http://localhorst:3000')).to.eventually.equal('ZJnHOTckstBeJP!QC2T').and.notify(done)
  })
})

