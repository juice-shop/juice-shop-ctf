/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const Bluebird = require('bluebird')
const fs = require('fs')
Bluebird.promisifyAll(fs)
const path = require('path')
const dateFormatLib = require('dateformat')
require('colors')

function writeToRtbXml (report:any, desiredFileName:any) {
  return new Bluebird((resolve:any, reject:any) => {
    const fileName = desiredFileName || 'OWASP_Juice_Shop.' + dateFormatLib(new Date(), 'yyyy-mm-dd') + '.RTB.xml'

    let xmlContent = report
    if (typeof report === 'string' && report.startsWith('"<?xml')) {
      xmlContent = JSON.parse(report)
    }
    
    fs.writeFileAsync(fileName, xmlContent, { encoding: 'utf8' }).then(() => {
      resolve(path.resolve(fileName))
    }).catch((error : any) => {
      reject(new Error('Failed to write output to file! ' + error.message))
    })
  })
}

export = writeToRtbXml