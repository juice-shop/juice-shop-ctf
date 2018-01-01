const writeToZipFile = require('../writeToZipFile')
const options = require('../options')

const createCTFdExport = require('./ctfd')
// const createFBCTFExport = require('./fbctf')

async function generateCTFExport(ctfFramework, challenges, settings) {
  switch (ctfFramework) {
    case options.ctfdFramework:
      const ctfdData = await createCTFdExport(challenges, settings)
      const file = await writeToZipFile(ctfdData)

      console.log('ZIP-archive written to ' + file)
      console.log()
      console.log('For a step-by-step guide to import the ZIP-archive into ' + 'CTFd'.bold + ', please refer to')
      console.log('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part1/ctf.html#running-ctfd'.bold)
      break
    case options.fbctfFramework:
      // TODO
      // const fbctfData = await createFBCTFExport(challenges, settings)

      console.log('Full Game Export written to TODO')
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
