const inquirer = require('inquirer')
const colors = require('colors') // eslint-disable-line no-unused-vars
const fetchSecretKey = require('./lib/fetchSecretKey')
const fetchChallenges = require('./lib/fetchChallenges')
const readConfigStream = require('./lib/readConfigStream')
const fs = require('fs')
const options = require('./lib/options')

const generateCTFExport = require('./lib/generators/')

const argv = require('yargs')
  .option('config', {
    alias: 'c',
    describe: 'provide a configuration file'
  })
  .option('output', {
    alias: 'o',
    describe: 'change the output file'
  })
  .help()
  .argv

function getConfig (argv, questions) {
  if (argv.config) {
    return readConfigStream(fs.createReadStream(argv.config))
  }
  return inquirer.prompt(questions)
}

const juiceShopCtfCli = async () => {
  const questions = [
    {
      type: 'list',
      name: 'ctfFramework',
      message: 'CTF Framework the generated files should be for?',
      choices: [options.ctfdFramework, options.fbctfFramework],
      default: 0
    },
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
  console.log('Generate ZIP-archive to import into ' + 'CTFd'.bold + ' (>=1.0.5) with the ' + 'OWASP Juice Shop'.bold + ' challenges')

  try {
    const answers = await getConfig(argv, questions)

    console.log()

    const [fetchedSecretKey, challenges] = await Promise.all([
      fetchSecretKey(answers.ctfKey),
      fetchChallenges(answers.juiceShopUrl)
    ])

    await generateCTFExport(answers.ctfFramework, challenges, {
      insertHints: answers.insertHints,
      insertHintUrls: answers.insertHintUrls,
      ctfKey: fetchedSecretKey,
      outputLocation: argv.output
    })
  } catch (error) {
    console.log(error.message.red)
  }
}

module.exports = juiceShopCtfCli
