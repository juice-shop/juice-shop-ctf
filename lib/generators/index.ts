/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import writeToCtfdZip from '../writeToCtfdCsv'
import writeToFbctfJson from '../writeToFbctfJson'
import writeToRtbXml from '../writeToRtbXml'
import colors from 'colors'

import { options as juiceShopOptions } from '../options'
import createCtfdExport from './ctfd'
import createRtbExport from './rtb'
import createFbctfExport from './fbctf'
import { Challenge, BaseExportSettings, FbctfExportSettings } from '../types/types'
import { CtfdCsvRow } from '../writeToCtfdCsv'

type CtfFramework = string
type ExportSettings = BaseExportSettings & {
  vulnSnippets?: Record<string, string>
  outputLocation: string
  countryMapping?: Record<string, {code: string, name?: string}>
}

async function generateCTFExport (
  ctfFramework: CtfFramework,
  challenges: Challenge[],
  settings: ExportSettings
): Promise<void> {
  settings.vulnSnippets = settings.vulnSnippets || {}
  
  async function ctfdExport(): Promise<void> {
    const challengeObject: Record<string, Challenge> = {}
    challenges.forEach((challenge, index) => {
      challengeObject[`c${index + 1}`] = challenge
    })

    const ctfdData = await createCtfdExport(challengeObject, settings)
    const ctfdFile: string = await writeToCtfdZip(ctfdData as unknown as CtfdCsvRow[], settings.outputLocation)
    console.log('Backup archive written to ' + colors.green(ctfdFile))
    console.log()
    console.log('For a step-by-step guide to import this file into ' + 'CTFd'.bold + ', please refer to')
    console.log('https://pwning.owasp-juice.shop/companion-guide/latest/part4/ctf.html#_running_ctfd'.bold)
  }

  async function fbctfExport(): Promise<void> {
    const fbctfSettings: FbctfExportSettings = {
      ...settings,
      countryMapping: settings.countryMapping || {}
    }
    const fbctfData = await createFbctfExport(challenges, fbctfSettings)
    const fbctfFile: string = await writeToFbctfJson(fbctfData, settings.outputLocation)

    console.log('Full Game Export written to ' + colors.green(fbctfFile))
    console.log()
    console.log('For a step-by-step guide to import this file into ' + 'FBCTF'.bold + ', please refer to')
    console.log('https://pwning.owasp-juice.shop/companion-guide/latest/part4/ctf.html#_running_fbctf'.bold)
  }

  async function rtbExport(): Promise<void> {
    try {
      const challengeObject: Record<string, Challenge> = {}
      challenges.forEach((challenge, index) => {
        challengeObject[`c${index + 1}`] = challenge
      })
      const rtbData = await createRtbExport(challengeObject, { ...settings, vulnSnippets: settings.vulnSnippets ?? {} })
      if (!rtbData || (typeof rtbData === 'string' && rtbData.trim() === '')) {
        console.error('Error: Generated RTB data is empty')
        return
      }

      const rtbFile = await writeToRtbXml(rtbData, settings.outputLocation)

      console.log('Full Game Export written to ' + colors.green(rtbFile))
      console.log()
      console.log('For a step-by-step guide to import this file into ' + 'RootTheBox'.bold + ', please refer to')
      console.log('https://pwning.owasp-juice.shop/companion-guide/latest/part4/ctf.html#_running_rootthebox'.bold)
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