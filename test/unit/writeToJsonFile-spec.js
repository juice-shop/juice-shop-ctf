const Promise = require('bluebird')
const chai = require('chai')
chai.use(require('chai-as-promised'))
const expect = chai.expect
const rewire = require('rewire')
const writeToJsonFile = rewire('../../lib/writeToJsonFile')

describe('Output for FBCTF', () => {
  it('should be written to JSON file', () => {
    writeToJsonFile.__set__({
      console: {
        log () {}
      },
      fs: {
        writeFileAsync (path, data) {
          expect(path).to.match(/OWASP_Juice_Shop\.[0-9]{4}-[0-9]{2}-[0-9]{2}\.FBCTF\.json/)
          return new Promise(resolve => { resolve() })
        } }
    })
    return expect(writeToJsonFile({ challenges: { results: [] }, flagKeys: { results: [] }, hints: { results: [] } }))
      .to.be.fulfilled
  })

  it('should log file system error to console', () => {
    writeToJsonFile.__set__({
      fs: {
        writeFileAsync (path, data) {
          return new Promise(() => { throw new Error('Argh!') })
        } }
    })
    return expect(writeToJsonFile({ challenges: { results: [] }, flagKeys: { results: [] }, hints: { results: [] } }))
      .to.be.rejectedWith('Failed to write output to file! Argh!')
  })

  it('should be written to the desired JSON file', () => {
    writeToJsonFile.__set__({
      console: {
        log () {}
      },
      fs: {
        writeFileAsync (path, data) {
          expect(path).to.match(/custom\.json/)
          return new Promise(resolve => { resolve() })
        } }
    })
    return expect(writeToJsonFile({ challenges: { results: [] }, flagKeys: { results: [] }, hints: { results: [] } }, 'custom.json'))
      .to.be.fulfilled
  })
})
