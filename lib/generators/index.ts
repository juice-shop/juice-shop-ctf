/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import writeToCtfdZip, { type CtfdCsvRow } from '../writeToCtfdCsv'
import writeToFbctfJson from '../writeToFbctfJson'
import writeToRtbXml from '../writeToRtbXml'
import colors from 'colors'

import { options as juiceShopOptions } from '../options'
import createCtfdExport from './ctfd'
import createRtbExport from './rtb'
import createFbctfExport from './fbctf'
import { type Challenge, type BaseExportSettings } from '../types/types'

type CtfFramework = string
type ExportSettings = BaseExportSettings & {
  vulnSnippets?: Record<string, string>
  outputLocation: string
  countryMapping?: Record<string, { code: string, name?: string }>
}

async function generateCTFExport (
  ctfFramework: CtfFramework,
  challenges: Challenge[],
  settings: ExportSettings
): Promise<void> {
  settings.vulnSnippets = settings.vulnSnippets ?? {}

  async function ctfdExport (): Promise<void> {
    const challengeObject: Record<string, Challenge> = {}
    challenges.forEach((challenge, index) => {
      challengeObject[`c${index + 1}`] = challenge
    })

    const ctfdData = await createCtfdExport(challengeObject, settings)
    const ctfdFile: string = await writeToCtfdZip(ctfdData as unknown as CtfdCsvRow[], settings.outputLocation)
    console.log('Backup archive written to ' + colors.green(ctfdFile))
    console.log()
    console.log('For a step-by-step guide to import this file into ' + colors.bold('CTFd') + ', please refer to')
    console.log(colors.bold('https://pwning.owasp-juice.shop/companion-guide/latest/part4/ctf.html#_running_ctfd'))
  }

  async function fbctfExport (): Promise<void> {
    const fbctfData = await createFbctfExport(challenges, settings)
    const fbctfFile: string = await writeToFbctfJson(fbctfData, settings.outputLocation)

    console.log('Full Game Export written to ' + colors.green(fbctfFile))
    console.log()
    console.log('For a step-by-step guide to import this file into ' + colors.bold('FBCTF') + ', please refer to')
    console.log(colors.bold('https://pwning.owasp-juice.shop/companion-guide/latest/part4/ctf.html#_running_fbctf'))
  }

  async function rtbExport (): Promise<void> {
    try {
      const challengeObject: Record<string, Challenge> = {}
      challenges.forEach((challenge, index) => {
        challengeObject[`c${index + 1}`] = challenge
      })
      const rtbData = await createRtbExport(challengeObject, { ...settings, vulnSnippets: settings.vulnSnippets ?? {} })
      if (
        rtbData === undefined ||
        rtbData === null ||
        (typeof rtbData === 'string' && (rtbData === '' || rtbData.trim() === ''))
      ) {
        console.error('Error: Generated RTB data is empty')
        return
      }

      const rtbFile = await writeToRtbXml(rtbData, settings.outputLocation)

      console.log('Full Game Export written to ' + colors.green(rtbFile))
      console.log()
      console.log('For a step-by-step guide to import this file into ' + colors.bold('RootTheBox') + ', please refer to')
      console.log(colors.bold('https://pwning.owasp-juice.shop/companion-guide/latest/part4/ctf.html#_running_rootthebox'))
    } catch (error: any) {
      console.error('Error in RTB export:', error.message)
    }
  }

  switch (ctfFramework) {
    case juiceShopOptions.ctfdFramework: {
      await ctfdExport()
      break
    }
    case juiceShopOptions.fbctfFramework: {
      await fbctfExport()
      break
    }
    case juiceShopOptions.rtbFramework: {
      await rtbExport()
      break
    }
    default: {
      throw new Error('Unknown CTF Framework of type: ' + ctfFramework)
    }
  }
}

export default generateCTFExport
