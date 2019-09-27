const Promise = require('bluebird')
const fs = require('fs')
Promise.promisifyAll(fs)
const path = require('path')
const dateFormat = require('dateformat')
const Zip = require('node-zip')
const zip = new Zip()

function writeToCtfd2Zip ({ challenges, hints, flagKeys }, desiredFileName) {
  return new Promise((resolve, reject) => {
    const fileName = desiredFileName || 'OWASP_Juice_Shop.' + dateFormat(new Date(), 'yyyy-mm-dd') + '.CTFd2.zip'
    zip.file('db/alembic_version.json', '{"count": 1, "results": [{"version_num": "8369118943a1"}], "meta": {}}')
    zip.file('db/challenges.json', JSON.stringify(challenges))
    zip.file('db/hints.json', JSON.stringify(hints))
    zip.file('db/flags.json', JSON.stringify(flagKeys))
    fs.writeFileAsync(fileName, zip.generate({ base64: false, compression: 'DEFLATE' }), 'binary').then(() => {
      resolve(path.resolve(fileName).green)
    }).catch(({ message }) => {
      reject(new Error('Failed to write output to file! ' + message))
    })
  })
}

module.exports = writeToCtfd2Zip
