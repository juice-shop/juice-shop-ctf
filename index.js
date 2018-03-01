const inquirer = require('inquirer')
const colors = require('colors') // eslint-disable-line no-unused-vars
const fetchSecretKey = require('./lib/secretKey')
const fetchChallenges = require('./lib/fetchChallenges')
const generateData = require('./lib/generateData')
const writeToZipFile = require('./lib/writeToZipFile')
const options = require('./lib/options')

const juiceShopCtfCli = async () => {
  const questions = [
    {
      type: 'input',
      name: 'juiceShopUrl',
      message: 'Juice Shop URL to retrieve challenges?',
      default: 'https://juice-shop.herokuapp.com'
    },
    {
      type: 'input',
      name: 'ctfKey',
      message: 'Secret key <or> URL to ctf.key file?',
      default: 'https://raw.githubusercontent.com/bkimminich/juice-shop/master/ctf.key'
    },
    {
      type: 'list',
      name: 'insertHints',
      message: 'Insert a text hint along with each CTFd Challenge?',
      choices: [options.noTextHints, options.freeTextHints, options.paidTextHints],
      default: 0
    },
    {
      type: 'list',
      name: 'insertHintUrls',
      message: 'Insert a hint URL along with each CTFd Challenge?',
      choices: [options.noHintUrls, options.freeHintUrls, options.paidHintUrls],
      default: 0
    }
  ]

  console.log()
  console.log('Generate ZIP-archive to import into ' + 'CTFd'.bold + ' (≥1.1.0) with the ' + 'OWASP Juice Shop'.bold + ' challenges')

  try {
    const {ctfKey, juiceShopUrl, insertHints, insertHintUrls} = await inquirer.prompt(questions)
    const [secretKey, challenges] = await Promise.all([
      fetchSecretKey(ctfKey),
      fetchChallenges(juiceShopUrl)
    ])
    const data = await generateData(challenges, insertHints, insertHintUrls, secretKey)
    const file = await writeToZipFile(data)

    console.log()
    console.log('ZIP-archive written to ' + file)
    console.log()
    console.log('For a step-by-step guide to import the ZIP-archive into ' + 'CTFd'.bold + ', please refer to')
    console.log('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part1/ctf.html#running-ctfd'.bold)
  } catch (error) {
    console.log(error.message.red)
  }
}

module.exports = juiceShopCtfCli
