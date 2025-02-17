/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const writeToCtfdZip = require('../writeToCtfdCsv')
const writeToFbctfJson = require('../writeToFbctfJson')
const writeToRtbXml = require('../writeToRtbXml')
const options = require('../options')

const createCtfdExport = require('./ctfd')
const createFbctfExport = require('./fbctf')
const createRtbExport = require('./rtb')

async function generateCTFExport (ctfFramework, challenges, settings) {
  async function ctfdExport () {
    const ctfdData = await createCtfdExport(challenges, settings)
    const ctfdFile = await writeToCtfdZip(ctfdData, settings.outputLocation)

    console.log('Backup archive written to ' + ctfdFile)
    console.log()
    console.log('For a step-by-step guide to import this file into ' + 'CTFd'.bold + ', please refer to')
    console.log('https://pwning.owasp-juice.shop/companion-guide/latest/part4/ctf.html#_running_ctfd'.bold)
  }

  async function fbctfExport () {
    const fbctfData = await createFbctfExport(challenges, settings)
    const fbctfFile = await writeToFbctfJson(fbctfData, settings.outputLocation)

    console.log('Full Game Export written to ' + fbctfFile)
    console.log()
    console.log('For a step-by-step guide to import this file into ' + 'FBCTF'.bold + ', please refer to')
    console.log('https://pwning.owasp-juice.shop/companion-guide/latest/part4/ctf.html#_running_fbctf'.bold)
  }

  async function rtbExport () {
    const rtbData = await createRtbExport(challenges, settings)
    const rtbFile = await writeToRtbXml(rtbData, settings.outputLocation)

    console.log('Full Game Export written to ' + rtbFile)
    console.log()
    console.log('For a step-by-step guide to import this file into ' + 'RootTheBox'.bold + ', please refer to')
    console.log('https://pwning.owasp-juice.shop/companion-guide/latest/part4/ctf.html#_running_rootthebox'.bold)
  }

  switch (ctfFramework) {
    case options.ctfdFramework: {
      await ctfdExport()
      break
    }
    case options.fbctfFramework: {
      await fbctfExport()
      break
    }
    case options.rtbFramework: {
      await rtbExport()
      break
    }
    default: {
      throw new Error('Unknown CTF Framework of type: ' + ctfFramework)
    }
  }
}

module.exports = generateCTFExport
