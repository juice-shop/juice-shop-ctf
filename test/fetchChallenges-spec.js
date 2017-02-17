var chai = require('chai')
var expect = chai.expect
var rewire = require('rewire')
var fetchChallenges = rewire('../lib/fetchChallenges')

describe('challenges()', function () {
  it('should fetch challenges from path /api/Challenges of a given URL', function (done) {
    fetchChallenges.__set__({
      request: function (options) {
        expect(options).to.deep.equal({ url: 'http://localhost:3000/api/Challenges', json: true })
        return new Promise(function () { done() })
      }
    })
    fetchChallenges('http://localhost:3000')
  })
})
