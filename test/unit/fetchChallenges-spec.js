var Promise = require('bluebird')
var chai = require('chai')
chai.use(require('chai-as-promised'))
var expect = chai.expect
var rewire = require('rewire')
var fetchChallenges = rewire('../../lib/fetchChallenges')

describe('Challenges', function () {
  it('should be fetched from the given URL', function () {
    fetchChallenges.__set__({
      request: function (options) {
        expect(options).to.deep.equal({ url: 'http://localhost:3000/api/Challenges', json: true })
        return new Promise(function (resolve) { resolve({ data: { c1: { }, c2: { } } }) })
      }
    })
    return expect(fetchChallenges('http://localhost:3000')).to.eventually.deep.equal({ c1: { }, c2: { } })
  })

  it('should log retrieval error to console', function () {
    fetchChallenges.__set__({
      request: function () {
        return new Promise(function (resolve, reject) { reject(new Error('Argh!')) })
      }
    })
    return expect(fetchChallenges('http://localh_%&$§rst:3000')).to.be.rejectedWith('Failed to fetch challenges from API! Argh!')
  })
})
