var chai = require('chai')
var expect = chai.expect
var rewire = require('rewire')
var fetchChallenges = rewire('../lib/fetchChallenges')

describe('challenges()', function () {
  it('should request JSON from the path /api/Challenges under the given URL', function (done) {
    fetchChallenges.__set__({
      request: function (options) {
        expect(options).to.deep.equal({ url: 'http://localhost:3000/api/Challenges', json: true })
        return new Promise(function () { done() })
      }
    })
    expect(fetchChallenges('http://localhost:3000')).to.notify(done)
  })

  it('should fetch challenges from the given URL', function (done) {
    fetchChallenges.__set__({
      request: function (options) {
        expect(options).to.deep.equal({ url: 'http://localhost:3000/api/Challenges', json: true })
        return new Promise(function (resolve) { resolve({ data: { c1: { }, c2: { } } }) })
      }
    })
    expect(fetchChallenges('http://localhost:3000')).to.eventually.deep.equal({ c1: { }, c2: { } }).and.notify(done)
  })
})
