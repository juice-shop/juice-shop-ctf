const writeToZipFile = require('../writeToZipFile')
const writeToJsonFile = require('../writeToJsonFile')
const options = require('../options')

const createCTFdExport = require('./ctfd')
const createFBCTFExport = require('./fbctf')

async function generateCTFExport (ctfFramework, challenges, settings) {
  switch (ctfFramework) {
    case options.ctfdFramework:
      const ctfdData = await createCTFdExport(challenges, settings)
      const ctfdFile = await writeToZipFile(ctfdData, settings.outputLocation)

      console.log('ZIP-archive written to ' + ctfdFile)
      console.log()
      console.log('For a step-by-step guide to import the ZIP-archive into ' + 'CTFd'.bold + ', please refer to')
      console.log('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part1/ctf.html#running-ctfd'.bold)
      break
    case options.fbctfFramework:
      const { adminPassword, fbctfData } = await createFBCTFExport(challenges, settings)
      const fbctfFile = await writeToJsonFile(fbctfData, settings.outputLocation)

      console.log('Full Game Export written to ' + fbctfFile)
      console.log()
      console.log('Note that the importing the Game Export will completly erase everything in the FBCTF instance.')
      console.log('This will also override preexisting admin users.')
      console.log('A new admin user will be created with the follwing credentials:')
      console.log('Username: admin')
      console.log('Password: ' + adminPassword)
      console.log()
      console.log('A step-by-step guide to import this file in FBCTF is comming shortly.')
      console.log('You can refer to the documentation from FBCTF for now.')
      console.log('https://github.com/facebook/fbctf'.bold)
      break
    default:
      throw new Error('Unknown CTF Framework of type: ' + ctfFramework)
  }
}

module.exports = generateCTFExport
