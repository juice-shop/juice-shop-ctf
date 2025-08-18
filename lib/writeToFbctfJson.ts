/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as path from 'node:path'
import fs from 'node:fs/promises'
import dateFormat from 'dateformat'
import 'colors'

async function writeToFbctfJson (
  report: any,
  desiredFileName?: string
): Promise<string> {
  const fileName: string = (desiredFileName !== undefined && desiredFileName !== null && desiredFileName !== '')
  ? desiredFileName
  : 'OWASP_Juice_Shop.' + dateFormat(new Date(), 'yyyy-mm-dd') + '.FBCTF.json'
  try {
    await fs.writeFile(fileName, JSON.stringify(report, null, 2), { encoding: 'utf8' })
    return path.resolve(fileName)
  } catch (error) {
    throw new Error('Failed to write output to file! ' + (error as Error)?.message)
  }
}

export default writeToFbctfJson
