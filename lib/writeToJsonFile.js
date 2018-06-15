const Promise = require('bluebird')
const fs = require('fs')
Promise.promisifyAll(fs)
const path = require('path')
const dateFormat = require('dateformat')

async function writeToJsonFile (report, desiredFileName) {
  return new Promise((resolve, reject) => {
    const fileName = desiredFileName || 'OWASP_Juice_Shop.' + dateFormat(new Date(), 'yyyy-mm-dd') + '.FBCTF.json'
    fs.writeFileAsync(fileName, JSON.stringify(report, null, 2), {encoding: 'utf8'}).then(() => {
      resolve(path.resolve(fileName).green)
    }).catch(({message}) => {
      reject(new Error('Failed to write output to file! ' + message))
    })
  })
}

module.exports = writeToJsonFile
