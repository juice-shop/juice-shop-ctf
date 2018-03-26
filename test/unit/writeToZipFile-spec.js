const Promise = require('bluebird')
const chai = require('chai')
chai.use(require('chai-as-promised'))
const expect = chai.expect
const rewire = require('rewire')
const writeToZipFile = rewire('../../lib/writeToZipFile')

describe('Output to file', () => {
  it('should be written to ZIP file', () => {
    writeToZipFile.__set__({
      console: {
        log () {}
      },
      fs: {
        writeFileAsync (path, data) {
          expect(data).to.match(/challenges.json/)
          expect(data).to.match(/hints.json/)
          expect(data).to.match(/keys.json/)
          expect(data).to.match(/files.json/)
          expect(data).to.match(/tags.json/)
          expect(path).to.match(/OWASP_Juice_Shop\.[0-9]{4}-[0-9]{2}-[0-9]{2}\.zip/)
          return new Promise(resolve => { resolve() })
        }}
    })
    return expect(writeToZipFile({challenges: {results: []}, flagKeys: {results: []}, hints: {results: []}}))
      .to.be.fulfilled
  })

  it('should log file system error to console', () => {
    writeToZipFile.__set__({
      fs: {
        writeFileAsync (path, data) {
          return new Promise(() => { throw new Error('Argh!') })
        }}
    })
    return expect(writeToZipFile({challenges: {results: []}, flagKeys: {results: []}, hints: {results: []}}))
      .to.be.rejectedWith('Failed to write output to file! Argh!')
  })

  it('should be written to the desired ZIP file', () => {
    writeToZipFile.__set__({
      console: {
        log () {}
      },
      fs: {
        writeFileAsync (path, data) {
          expect(data).to.match(/challenges.json/)
          expect(data).to.match(/hints.json/)
          expect(data).to.match(/keys.json/)
          expect(data).to.match(/files.json/)
          expect(data).to.match(/tags.json/)
          expect(path).to.match(/custom\.zip/)
          return new Promise(resolve => { resolve() })
        }}
    })
    return expect(writeToZipFile({challenges: {results: []}, flagKeys: {results: []}, hints: {results: []}}, 'custom.zip'))
      .to.be.fulfilled
  })
})
