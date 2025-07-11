/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import Bluebird from 'bluebird'
import * as path from 'path'
import 'colors'
import dateFormat from 'dateformat'

const fs = require('fs')
Bluebird.promisifyAll(fs)

interface WriteToFbctfJsonFunction {
  (report: any, desiredFileName?: string): Promise<string>
}

const writeToFbctfJson: WriteToFbctfJsonFunction = function (
  report: any,
  desiredFileName?: string
): Promise<string> {
  return new Bluebird((resolve: (value: string) => void, reject: (reason?: any) => void) => {
    const fileName: string = desiredFileName || 'OWASP_Juice_Shop.' + dateFormat(new Date(), 'yyyy-mm-dd') + '.FBCTF.json'

    fs.writeFileAsync(fileName, JSON.stringify(report, null, 2), { encoding: 'utf8' }).then((): void => {
      resolve(path.resolve(fileName))
    }).catch((error: { message: string }): void => {
      reject(new Error('Failed to write output to file! ' + error.message))
    })
  })
}

export = writeToFbctfJson
