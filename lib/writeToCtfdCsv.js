/*
 * Copyright (c) 2016-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const Promise = require('bluebird')
const fs = require('fs')
Promise.promisifyAll(fs)
const path = require('path')
const dateFormat = require('dateformat')

function writeToCtfdCsv (data, desiredFileName) {
  return new Promise((resolve, reject) => {
    const fileName = desiredFileName || 'OWASP_Juice_Shop.' + dateFormat(new Date(), 'yyyy-mm-dd') + '.CTFd.csv'
    fs.writeFileAsync(fileName, convertToCSV(data), 'utf8').then(() => {
      resolve(path.resolve(fileName).green)
    }).catch(({ message }) => {
      reject(new Error('Failed to write output to file! ' + message))
    })
  })
}

function convertToCSV (arr) {
  const array = [Object.keys(arr[0])].concat(arr)

  return array.map(it => {
    return Object.values(it).toString()
  }).join('\n')
}

module.exports = writeToCtfdCsv
