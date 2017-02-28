var Promise = require('bluebird')
var chai = require('chai')
chai.use(require('chai-as-promised'))
var expect = chai.expect
var rewire = require('rewire')
var writeToFile = rewire('../../lib/writeToFile')

describe('Output to file', function () {
  it('should be written to insert-ctfd-challenges.sql', function () {
    writeToFile.__set__({
      console: {
        log: function () {}
      },
      fs: {
        writeFileAsync: function (path, data) {
          expect(data).to.equal('SQL')
          expect(path).to.equal('insert-ctfd-challenges.sql')
          return new Promise(function (resolve) { resolve() })
        }}
    })
    return expect(writeToFile('SQL')).to.be.fulfilled
  })

  it('should log file system error to console', function () {
    writeToFile.__set__({
      fs: {
        writeFileAsync: function (path, data) {
          return new Promise(function () { throw new Error('Argh!') })
        }}
    })
    return expect(writeToFile('SQL')).to.be.rejectedWith('Failed to write output to file! Error: Argh!')
  })
})
