'use strict'
var Promise = require('bluebird')
var fs = require('fs')
Promise.promisifyAll(fs)
var path = require('path')
var colors = require('colors') // eslint-disable-line no-unused-vars

function writeOutput (sql) {
  return new Promise(function (resolve, reject) {
    fs.writeFileAsync('insert-ctfd-challenges.sql', sql).then(function () {
      resolve(path.resolve('insert-ctfd-challenges.sql').green)
    }).catch(function (error) {
      reject('Failed'.red + ' to write output to file! ' + error)
    })
  })
}

module.exports = writeOutput
