/*
 * Copyright (c) 2016-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const Promise = require('bluebird')
const fs = require('fs')
Promise.promisifyAll(fs)
const path = require('path')
const dateFormat = require('dateformat')

async function writeToRtbXml (report, desiredFileName) {
  return new Promise((resolve, reject) => {
    const fileName = desiredFileName || 'OWASP_Juice_Shop.' + dateFormat(new Date(), 'yyyy-mm-dd') + '.RTB.xml'
    fs.writeFileAsync(fileName, report, { encoding: 'utf8' }).then(() => {
      resolve(path.resolve(fileName).green)
    }).catch(({ message }) => {
      reject(new Error('Failed to write output to file! ' + message))
    })
  })
}

module.exports = writeToRtbXml
