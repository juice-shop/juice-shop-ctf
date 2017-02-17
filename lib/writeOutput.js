'use strict'
var fs = require('fs')
var path = require('path')

function writeOutput (sql) {
  fs.writeFile('insert-ctfd-challenges.sql', sql, function (error) {
    if (error) {
      console.log('Failed'.red + ' to write output to file! ' + error)
    } else {
      console.log('SQL written to ' + path.resolve('insert-ctfd-challenges.sql').green)
      console.log()
      console.log('For a step-by-step guide to apply the INSERT statements to ' + 'CTFd'.bold + ', please refer to')
      console.log('https://github.com/bkimminich/juice-shop-ctf/blob/master/CTFd/GenerateCTFdInserts.html#L80'.gray) // TODO Refer to Markdown doc on GitHub instead
    }
  })
}

module.exports = writeOutput
