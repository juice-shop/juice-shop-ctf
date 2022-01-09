/*
 * Copyright (c) 2016-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const writeToCtfdZip = require('../writeToCtfdZip')
const writeToCtfd3Csv = require('../writeToCtfd3Csv')
const writeToFbctfJson = require('../writeToFbctfJson')
const writeToRtbXml = require('../writeToRtbXml')
const options = require('../options')

const createCtfdExport = require('./ctfd')
const createCtfd3Export = require('./ctfd3')
const createFbctfExport = require('./fbctf')
const createRtbExport = require('./rtb')

async function generateCTFExport (ctfFramework, challenges, settings) {
  async function ctfdExport () {
    const ctfdData = await createCtfdExport(challenges, settings)
    const ctfdFile = await writeToCtfdZip(ctfdData, settings.outputLocation)

    console.log('Backup archive written to ' + ctfdFile)
    console.log()
    console.log('After the import you will have to set up the CTF name and administrator credentials again!'.cyan)
    console.log()
    console.log('For a step-by-step guide to import the ZIP-archive into ' + 'CTFd 2.x'.bold + ', please refer to')
    console.log('https://pwning.owasp-juice.shop/part1/ctf.html#running-ctfd'.bold)
  }

  async function ctfd3Export () {
    console.log('Generating Data')
    const ctfdData = await createCtfd3Export(challenges, settings)
    console.log('Writing to csv')
    const ctfdFile = await writeToCtfd3Csv(ctfdData, settings.outputLocation)

    console.log('Backup archive written to ' + ctfdFile)
    console.log()
    console.log('After the import you will have to set up the CTF name and administrator credentials again!'.cyan)
    console.log()
    console.log('For a step-by-step guide to import the ZIP-archive into ' + 'CTFd 2.x'.bold + ', please refer to')
    console.log('https://pwning.owasp-juice.shop/part1/ctf.html#running-ctfd'.bold)
  }

  async function fbctfExport () {
    const fbctfData = await createFbctfExport(challenges, settings)
    const fbctfFile = await writeToFbctfJson(fbctfData, settings.outputLocation)

    console.log('Full Game Export written to ' + fbctfFile)
    console.log()
    console.log('For a step-by-step guide to import this file into ' + 'FBCTF'.bold + ', please refer to')
    console.log('https://pwning.owasp-juice.shop/part1/ctf.html#running-fbctf'.bold)
  }

  async function rtbExport () {
    const rtbData = await createRtbExport(challenges, settings)
    const rtbFile = await writeToRtbXml(rtbData, settings.outputLocation)

    console.log('Full Game Export written to ' + rtbFile)
    console.log()
    console.log('For a step-by-step guide to import this file into ' + 'RootTheBox'.bold + ', please refer to')
    console.log('https://pwning.owasp-juice.shop/part1/ctf.html#running-rootthebox'.bold)
  }

  switch (ctfFramework) {
    case options.ctfdFramework: {
      await ctfdExport()
      break
    }
    case options.ctfd3Framework: {
      await ctfd3Export()
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
