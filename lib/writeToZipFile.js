'use strict'
var Promise = require('bluebird')
var fs = require('fs')
Promise.promisifyAll(fs)
var path = require('path')
var dateFormat = require('dateformat')
var Zip = require('node-zip')
var zip = new Zip()

function writeToZipFile (data) {
  return new Promise(function (resolve, reject) {
    var fileName = 'OWASP_Juice_Shop.' + dateFormat(new Date(), 'yyyy-mm-dd') + '.zip'
    zip.file('db/challenges.json', JSON.stringify(data.challenges))
    zip.file('db/hints.json', JSON.stringify(data.hints))
    zip.file('db/keys.json', JSON.stringify(data.flagKeys))
    zip.file('db/files.json', '')
    zip.file('db/tags.json', '')
    fs.writeFileAsync(fileName, zip.generate({base64: false, compression: 'DEFLATE'}), 'binary').then(function () {
      resolve(path.resolve(fileName).green)
    }).catch(function (error) {
      reject(new Error('Failed to write output to file! ' + error.message))
    })
  })
}

module.exports = writeToZipFile
