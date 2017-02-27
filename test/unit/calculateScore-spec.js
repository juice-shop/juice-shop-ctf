var chai = require('chai')
var expect = chai.expect
var calculateScore = require('../../lib/calculateScore')

describe('Score', function () {
  it('should be 100 points for a * challenge', function () {
    expect(calculateScore(1)).to.equal(100)
  })

  it('should be 250 points for a ** challenge', function () {
    expect(calculateScore(2)).to.equal(250)
  })

  it('should be 450 points for a *** challenge', function () {
    expect(calculateScore(3)).to.equal(450)
  })

  it('should be 700 points for a **** challenge', function () {
    expect(calculateScore(4)).to.equal(700)
  })

  it('should be 1000 points for a ***** challenge', function () {
    expect(calculateScore(5)).to.equal(1000)
  })
})
