const writeToCtfdZip = require('../writeToCtfdZip')
const writeToCtfd2Zip = require('../writeToCtfd2Zip')
const writeToFbctfJson = require('../writeToFbctfJson')
const options = require('../options')

const createCtfdExport = require('./ctfd')
const createCtfd2Export = require('./ctfd2')
const createFbctfExport = require('./fbctf')

async function generateCTFExport (ctfFramework, challenges, settings) {
  switch (ctfFramework) {
    case options.ctfd2Framework:
      const ctfd2Data = await createCtfd2Export(challenges, settings)
      const ctfd2File = await writeToCtfd2Zip(ctfd2Data, settings.outputLocation)

      console.log('Backup archive written to ' + ctfd2File)
      console.log()
      console.log('You can dismiss the potential '.cyan + 'Internal Server Error'.italic + ' alert popup after import.'.cyan)
      console.log('Simply restart CTFd and set up CTF name and administrator credentials again.'.cyan)
      console.log()
      console.log('For a step-by-step guide to import the ZIP-archive into ' + 'CTFd 2.x'.bold + ', please refer to')
      console.log('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part1/ctf.html#running-ctfd'.bold)
      break
    case options.ctfdFramework:
      const ctfdData = await createCtfdExport(challenges, settings)
      const ctfdFile = await writeToCtfdZip(ctfdData, settings.outputLocation)

      console.log('Backup archive written to ' + ctfdFile)
      console.log()
      console.log('For a step-by-step guide to import the ZIP-archive into ' + 'CTFd 1.x'.bold + ', please refer to')
      console.log('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part1/ctf.html#running-ctfd'.bold)
      break
    case options.fbctfFramework:
      const fbctfData = await createFbctfExport(challenges, settings)
      const fbctfFile = await writeToFbctfJson(fbctfData, settings.outputLocation)

      console.log('Full Game Export written to ' + fbctfFile)
      console.log()
      console.log('For a a step-by-step guide to import this file into ' + 'FBCTF'.bold + ', please refer to')
      console.log('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part1/ctf.html#running-fbctf'.bold)
      break
    default:
      throw new Error('Unknown CTF Framework of type: ' + ctfFramework)
  }
}

module.exports = generateCTFExport
