const Promise = require('bluebird')
const chai = require('chai')
chai.use(require('chai-as-promised'))
const expect = chai.expect
const rewire = require('rewire')
const fetchCountryMapping = rewire('../../lib/fetchCountryMapping')

describe('Country mapping', () => {
  it('should be the body of the HTTP response if the given input is a URL', () => {
    fetchCountryMapping.__set__({
      request () {
        return Promise.resolve(`
ctf:
  countryMapping:
    scoreBoardChallenge:
      name: Canada
      code: CA
`)
      }
    })
    return expect(fetchCountryMapping('http://localhorst:3000')).to.eventually.deep.equal({
      scoreBoardChallenge: {
        name: 'Canada',
        code: 'CA'
      }
    })
  })
})
