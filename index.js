const inquirer = require('inquirer')
const colors = require('colors') // eslint-disable-line no-unused-vars
const fetchSecretKey = require('./lib/fetchSecretKey')
const fetchChallenges = require('./lib/fetchChallenges')
const fetchCountryMapping = require('./lib/fetchCountryMapping')
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
      message: 'CTF framework to generate data for?',
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
      type: 'input',
      name: 'countryMapping',
      message: 'URL to counry-mapping.yml file?',
      default: 'https://raw.githubusercontent.com/bkimminich/juice-shop/master/config/fbctf.yml',
      when: ({ ctfFramework }) => ctfFramework === options.fbctfFramework
    },
    {
      type: 'list',
      name: 'insertHints',
      message: 'Insert a text hint along with each Challenge?',
      choices: [options.noTextHints, options.freeTextHints, options.paidTextHints],
      default: 0
    },
    {
      type: 'list',
      name: 'insertHintUrls',
      message: 'Insert a hint URL along with each Challenge?',
      choices: [options.noHintUrls, options.freeHintUrls, options.paidHintUrls],
      default: 0,
      when: ({ ctfFramework }) => ctfFramework === options.ctfdFramework
    }
  ]

  console.log()
  console.log('Generate ' + 'OWASP Juice Shop'.bold + ' challenge archive for setting up ' + options.ctfdFramework.bold + ' or ' + options.fbctfFramework.bold + ' score server')

  try {
    const answers = await getConfig(argv, questions)

    console.log()

    const [fetchedSecretKey, challenges, countryMapping] = await Promise.all([
      fetchSecretKey(answers.ctfKey),
      fetchChallenges(answers.juiceShopUrl),
      fetchCountryMapping(answers.countryMapping)
    ])

    await generateCTFExport(answers.ctfFramework || options.ctfdFramework, challenges, {
      insertHints: answers.insertHints,
      insertHintUrls: answers.insertHintUrls,
      ctfKey: fetchedSecretKey,
      countryMapping,
      outputLocation: argv.output
    })
  } catch (error) {
    console.log(error.message.red)
  }
}

module.exports = juiceShopCtfCli
