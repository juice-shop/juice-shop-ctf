const Promise = require('bluebird')
const fs = require('fs')
Promise.promisifyAll(fs)
const dateFormat = require('dateformat')

async function writeToJsonFile(report, desiredFileName) {
  const fileName = desiredFileName || 'OWASP_Juice_Shop.' + dateFormat(new Date(), 'yyyy-mm-dd') + '.json'

  try {
    await fs.writeFileAsync(fileName, JSON.stringify(report, null, 2), { encoding: 'utf8' });
    return fileName;
  } catch ({ message }) {
    throw new Error('Failed to write output to file! ' + message)
  } 
}

module.exports = writeToJsonFile
