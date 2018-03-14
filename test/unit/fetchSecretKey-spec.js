const Promise = require('bluebird')
const chai = require('chai')
chai.use(require('chai-as-promised'))
const expect = chai.expect
const rewire = require('rewire')
const fetchSecretKey = rewire('../../lib/fetchSecretKey')

describe('Secret key', () => {
  it('should be exactly the given input if it is not recognized as a URL', () => expect(fetchSecretKey('ZJnHOTckstBeJP!QC2T')).to.eventually.equal('ZJnHOTckstBeJP!QC2T'))

  it('should be the body of the HTTP response if the given input is a URL', () => {
    fetchSecretKey.__set__({
      request () {
        return new Promise(resolve => { resolve('ZJnHOTckstBeJP!QC2T') })
      }
    })
    return expect(fetchSecretKey('http://localhorst:3000')).to.eventually.equal('ZJnHOTckstBeJP!QC2T')
  })

  it('should log retrieval error to console', () => {
    fetchSecretKey.__set__({
      request () {
        return new Promise((resolve, reject) => { reject(new Error('Argh!')) })
      }
    })
    return expect(fetchSecretKey('http://localh_%&$§rst:3000')).to.be.rejectedWith('Failed to fetch secret key from URL! Argh!')
  })
})
