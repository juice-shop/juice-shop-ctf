var Promise = require('bluebird')
var chai = require('chai')
chai.use(require('chai-as-promised'))
var expect = chai.expect
var rewire = require('rewire')
var writeOutput = rewire('../../lib/writeOutput')

describe('Output', function () {
  it('should be written to insert-ctfd-challenges.sql', function () {
    writeOutput.__set__({
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
    return expect(writeOutput('SQL')).to.be.fulfilled
  })

  it('should log file system error to console', function () {
    writeOutput.__set__({
      fs: {
        writeFileAsync: function (path, data) {
          return new Promise(function () { throw new Error('Argh!') })
        }}
    })
    return expect(writeOutput('SQL')).to.be.rejectedWith('Argh!')
  })
})
