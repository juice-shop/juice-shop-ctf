/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import Bluebird from 'bluebird'
import * as path from 'path'
import dateFormat from 'dateformat'
import 'colors'

const fs = require('fs')
Bluebird.promisifyAll(fs)

interface WriteToRtbXmlFunction {
  (report: string | object, desiredFileName?: string): Promise<string>
}

const writeToRtbXml: WriteToRtbXmlFunction = function (
  report: string | object,
  desiredFileName?: string
): Promise<string> {
  return new Bluebird((resolve: (value: string) => void, reject: (reason?: any) => void) => {
    const fileName: string = desiredFileName || 'OWASP_Juice_Shop.' + dateFormat(new Date(), 'yyyy-mm-dd') + '.RTB.xml'

    let xmlContent: string | object = report
    if (typeof report === 'string' && report.startsWith('"<?xml')) {
      xmlContent = JSON.parse(report)
    }

    fs.writeFileAsync(fileName, xmlContent, { encoding: 'utf8' }).then((): void => {
      resolve(path.resolve(fileName))
    }).catch((error: { message: string }): void => {
      reject(new Error('Failed to write output to file! ' + error.message))
    })
  })
}

export = writeToRtbXml