/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import fs from 'node:fs/promises'
import * as path from 'node:path'
import dateFormat from 'dateformat'
import 'colors'

async function writeToRtbXml (
  report: string | object,
  desiredFileName?: string
): Promise<string> {
  const fileName: strconst fileName: string = (desiredFileName !== undefined && desiredFileName !== null && desiredFileName !== '')
  ? desiredFileName
  : 'OWASP_Juice_Shop.' + dateFormat(new Date(), 'yyyy-mm-dd') + '.RTB.xml'ing = desiredFileName || 'OWASP_Juice_Shop.' + dateFormat(new Date(), 'yyyy-mm-dd') + '.RTB.xml'

  const xmlContent: string = typeof report === 'string' ? report : JSON.stringify(report, null, 2)

  try {
    await fs.writeFile(fileName, xmlContent, { encoding: 'utf8' })
    return path.resolve(fileName)
  } catch (error) {
    throw new Error('Failed to write output to file! ' + (error as Error)?.message)
  }
}

export default writeToRtbXml
