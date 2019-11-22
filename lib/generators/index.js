const writeToCtfdZip = require('../writeToCtfdZip')
const writeToFbctfJson = require('../writeToFbctfJson')
const writeToRtbXml = require('../writeToRtbXml')
const options = require('../options')

const createCtfdExport = require('./ctfd')
const createFbctfExport = require('./fbctf')
const createRtbExport = require('./rtb')

async function generateCTFExport (ctfFramework, challenges, settings) {
  switch (ctfFramework) {
    case options.ctfdFramework: {
      const ctfdData = await createCtfdExport(challenges, settings)
      const ctfdFile = await writeToCtfdZip(ctfdData, settings.outputLocation)

      console.log('Backup archive written to ' + ctfdFile)
      console.log()
      console.log('After the import you will have to set up the CTF name and administrator credentials again!'.cyan)
      console.log()
      console.log('For a step-by-step guide to import the ZIP-archive into ' + 'CTFd'.bold + ', please refer to')
      console.log('https://pwning.owasp-juice.shop/part1/ctf.html#running-ctfd'.bold)
      break
    }
    case options.fbctfFramework: {
      const fbctfData = await createFbctfExport(challenges, settings)
      const fbctfFile = await writeToFbctfJson(fbctfData, settings.outputLocation)

      console.log('Full Game Export written to ' + fbctfFile)
      console.log()
      console.log('For a step-by-step guide to import this file into ' + 'FBCTF'.bold + ', please refer to')
      console.log('https://pwning.owasp-juice.shop/part1/ctf.html#running-fbctf'.bold)
      break
    }
    case options.rtbFramework: {
      const rtbData = await createRtbExport(challenges, settings)
      const rtbFile = await writeToRtbXml(rtbData, settings.outputLocation)

      console.log('Full Game Export written to ' + rtbFile)
      console.log()
      console.log('For a step-by-step guide to import this file into ' + 'RootTheBox'.bold + ', please refer to')
      console.log('https://pwning.owasp-juice.shop/part1/ctf.html#running-rtb'.bold)
      break
    }
    default: {
      throw new Error('Unknown CTF Framework of type: ' + ctfFramework)
    }
  }
}

module.exports = generateCTFExport
