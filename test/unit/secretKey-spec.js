var Promise = require('bluebird')
var chai = require('chai')
var expect = chai.expect
var rewire = require('rewire')
var secretKey = rewire('../../lib/secretKey')

describe('Secret key', function () {
  it('should be exactly the given input if it is not recognized as a URL', function () {
    expect(secretKey('ZJnHOTckstBeJP!QC2T')).to.eventually.equal('ZJnHOTckstBeJP!QC2T')
  })

  it('should be the body of the HTTP response if the given input is a URL', function () {
    secretKey.__set__({
      request: function () {
        return new Promise(function (resolve) { resolve('ZJnHOTckstBeJP!QC2T') })
      }
    })
    expect(secretKey('http://localhorst:3000')).to.eventually.equal('ZJnHOTckstBeJP!QC2T')
  })

  it('should log retrieval error to console', function () {
    secretKey.__set__({
      console: {
        log: function (message) {
          expect(message).to.match(/Argh!/)
        }
      },
      request: function () {
        return new Promise(function () { throw new Error('Argh!') })
      }
    })
    expect(secretKey('http://localh_%&$§rst:3000')).to.be.fulfilled
  })
})

