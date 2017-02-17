var chai = require('chai')
var expect = chai.expect
var rewire = require('rewire')
var writeOutput = rewire('../lib/writeOutput')

describe('writeOutput()', function () {
  it('should write SQL statements to insert-ctfd-challenges.sql', function () {
    writeOutput.__set__({
      console: {
        log: function () {}
      },
      fs: {
        writeFile: function (path, data, cb) {
          expect(data).to.equal('SQL')
          expect(path).to.equal('insert-ctfd-challenges.sql')
          cb(null, 'Done')
        }}
    })
    writeOutput('SQL')
  })
})
