/*
 * Copyright (c) 2016-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs')
const util = require('util')

const writeFile = util.promisify(fs.writeFile)

const path = require('path')
const dateFormat = require('dateformat')

const { stringify } = require('csv-stringify/sync')

async function writeToCtfd3Csv (challenges, desiredFileName) {
  const fileName = desiredFileName || 'OWASP_Juice_Shop.' + dateFormat(new Date(), 'yyyy-mm-dd') + '.CTFd.csv'

  try {
    const csv = stringify(challenges, { header: true })

    await writeFile(fileName, csv, { encoding: 'utf8' })
  } catch (error) {
    throw new Error('Failed to write output to file! ' + error)
  }

  return path.resolve(fileName).green
}

module.exports = writeToCtfd3Csv
