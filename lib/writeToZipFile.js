const Promise = require('bluebird')
const fs = require('fs')
Promise.promisifyAll(fs)
const path = require('path')
const dateFormat = require('dateformat')
const Zip = require('node-zip')
const zip = new Zip()

function writeToZipFile ({challenges, hints, flagKeys}, desiredFileName) {
  return new Promise((resolve, reject) => {
    const fileName = desiredFileName || 'OWASP_Juice_Shop.' + dateFormat(new Date(), 'yyyy-mm-dd') + '.CTFd.zip'
    zip.file('db/challenges.json', JSON.stringify(challenges))
    zip.file('db/hints.json', JSON.stringify(hints))
    zip.file('db/keys.json', JSON.stringify(flagKeys))
    zip.file('db/files.json', '')
    zip.file('db/tags.json', '')
    fs.writeFileAsync(fileName, zip.generate({base64: false, compression: 'DEFLATE'}), 'binary').then(() => {
      resolve(path.resolve(fileName).green)
    }).catch(({message}) => {
      reject(new Error('Failed to write output to file! ' + message))
    })
  })
}

module.exports = writeToZipFile
