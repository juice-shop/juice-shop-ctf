var Promise = require('bluebird')
var chai = require('chai')
chai.use(require('chai-as-promised'))
var expect = chai.expect
var rewire = require('rewire')
var writeToZipFile = rewire('../../lib/writeToZipFile')

describe('Output to file', function () {
  it('should be written to ZIP file', function () {
    writeToZipFile.__set__({
      console: {
        log: function () {}
      },
      fs: {
        writeFileAsync: function (path, data) {
          expect(data).to.match(/challenges.json/)
          expect(data).to.match(/hints.json/)
          expect(data).to.match(/keys.json/)
          expect(data).to.match(/files.json/)
          expect(data).to.match(/tags.json/)
          expect(path).to.match(/OWASP Juice Shop\.[0-9]{4}-[0-9]{2}-[0-9]{2}\.zip/)
          return new Promise(function (resolve) { resolve() })
        }}
    })
    return expect(writeToZipFile({challenges: {results: []}, flagKeys: {results: []}, hints: {results: []}})).to.be.fulfilled
  })

  it('should log file system error to console', function () {
    writeToZipFile.__set__({
      fs: {
        writeFileAsync: function (path, data) {
          return new Promise(function () { throw new Error('Argh!') })
        }}
    })
    return expect(writeToZipFile('SQL')).to.be.rejectedWith('Failed to write output to file! Argh!')
  })
})
