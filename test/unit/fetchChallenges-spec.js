var chai = require('chai')
chai.use(require('chai-as-promised'))
var expect = chai.expect
var rewire = require('rewire')
var fetchChallenges = rewire('../../lib/fetchChallenges')

describe('Challenges', function () {
  it('should be requested as JSON from the path /api/Challenges under the given URL', function () {
    fetchChallenges.__set__({
      request: function (options) {
        expect(options).to.deep.equal({ url: 'http://localhost:3000/api/Challenges', json: true })
        return new Promise(function () {})
      }
    })
    expect(fetchChallenges('http://localhost:3000')).to.be.fulfilled
  })

  it('should be fetched from the given URL', function () {
    fetchChallenges.__set__({
      request: function (options) {
        expect(options).to.deep.equal({ url: 'http://localhost:3000/api/Challenges', json: true })
        return new Promise(function (resolve) { resolve({ data: { c1: { }, c2: { } } }) })
      }
    })
    expect(fetchChallenges('http://localhost:3000')).to.eventually.deep.equal({ c1: { }, c2: { } })
  })

  it('should log retrieval error to console', function () {
    fetchChallenges.__set__({
      console: {
        log: function (message) {
          expect(message).to.match(/Argh!/)
        }
      },
      request: function () {
        return new Promise(function () { throw new Error('Argh!') })
      }
    })
    expect(fetchChallenges('http://localh_%&$§rst:3000')).to.be.fulfilled
  })
})
