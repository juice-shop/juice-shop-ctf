var Promise = require('bluebird')
var chai = require('chai')
chai.use(require('chai-as-promised'))
var expect = chai.expect
var rewire = require('rewire')
var secretKey = rewire('../../lib/secretKey')

describe('Secret key', function () {
  it('should be exactly the given input if it is not recognized as a URL', function () {
    return expect(secretKey('ZJnHOTckstBeJP!QC2T')).to.eventually.equal('ZJnHOTckstBeJP!QC2T')
  })

  it('should be the body of the HTTP response if the given input is a URL', function () {
    secretKey.__set__({
      request: function () {
        return new Promise(function (resolve) { resolve('ZJnHOTckstBeJP!QC2T') })
      }
    })
    return expect(secretKey('http://localhorst:3000')).to.eventually.equal('ZJnHOTckstBeJP!QC2T')
  })

  it('should log retrieval error to console', function () {
    secretKey.__set__({
      request: function () {
        return new Promise(function (resolve, reject) { reject(new Error('Argh!')) })
      }
    })
    return expect(secretKey('http://localh_%&$§rst:3000')).to.be.rejectedWith('Failed to fetch secret key from URL! Argh!')
  })
})
