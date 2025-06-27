/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

require('colors') // no assignment necessary as this module extends the String prototype
const inquirer = require('inquirer')
const fetchSecretKey = require('./lib/fetchSecretKey')
const fetchChallenges = require('./lib/fetchChallenges')
const fetchCountryMapping = require('./lib/fetchCountryMapping')
const fetchCodeSnippets = require('./lib/fetchCodeSnippets')
const readConfigStream = require('./lib/readConfigStream')
const fs = require('fs')
const options = require('./lib/options')

const generateCtfExport = require('./lib/generators/')

const argv = require('yargs')
  .option('config', {
    alias: 'c',
    describe: 'provide a configuration file'
  })
  .option('output', {
    alias: 'o',
    describe: 'change the output file'
  })
  .option('ignoreSslWarnings', {
    alias: 'i',
    describe: 'ignore tls certificate warnings'
  })
  .help()
  .argv

const questions = [
  {
    type: 'list',
    name: 'ctfFramework',
    message: 'CTF framework to generate data for?',
    choices: [options.ctfdFramework, options.fbctfFramework, options.rtbFramework],
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
    message: 'URL to ctf.key file <or> secret key <or> (CTFd only) comma-separated list of secret keys?',
    default: 'https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key'
  },
  {
    type: 'input',
    name: 'countryMapping',
    message: 'URL to country-mapping.yml file?',
    default: 'https://raw.githubusercontent.com/juice-shop/juice-shop/master/config/fbctf.yml',
    when: ({ ctfFramework }) => ctfFramework === options.fbctfFramework
  },
  {
    type: 'list',
    name: 'insertHints',
    message: 'Insert a text hint along with each challenge?',
    choices: [options.noTextHints, options.freeTextHints, options.paidTextHints],
    default: 0
  },
  {
    type: 'list',
    name: 'insertHintUrls',
    message: 'Insert a hint URL along with each challenge?',
    choices: [options.noHintUrls, options.freeHintUrls, options.paidHintUrls],
    default: 0
  },
  {
    type: 'list',
    name: 'insertHintSnippets',
    message: 'Insert a code snippet as hint for each challenge?',
    choices: [options.noHintSnippets, options.freeHintSnippets, options.paidHintSnippets],
    default: 0
  }
]

function getConfig (argv, questions) {
  if (argv.config) {
    return readConfigStream(fs.createReadStream(argv.config))
  }
  return inquirer.prompt(questions)
}

const juiceShopCtfCli = async () => {
  console.log()
  console.log(`Generate ${'OWASP Juice Shop'.bold} challenge archive for setting up ${options.ctfdFramework.bold}, ${options.fbctfFramework.bold} or ${options.rtbFramework.bold} score server`)

  try {
    const answers = await getConfig(argv, questions)

    console.log()

    const [fetchedSecretKey, challenges, countryMapping, vulnSnippets] = await Promise.all([
      fetchSecretKey(answers.ctfKey, argv.ignoreSslWarnings),
      fetchChallenges(answers.juiceShopUrl, argv.ignoreSslWarnings),
      fetchCountryMapping(answers.countryMapping, argv.ignoreSslWarnings),
      fetchCodeSnippets(answers.juiceShopUrl, argv.ignoreSslWarnings, answers.insertHintSnippets === options.noHintSnippets)
    ])

    for (const challenge of challenges) {
      if (challenge.name === 'Bonus Payload') {
        challenge.description = challenge.description.replace('https://', 'https&colon;//')
      }
    }

    await generateCtfExport(answers.ctfFramework || options.ctfdFramework, challenges, {
      juiceShopUrl: answers.juiceShopUrl,
      insertHints: answers.insertHints,
      insertHintUrls: answers.insertHintUrls,
      insertHintSnippets: answers.insertHintSnippets,
      ctfKey: fetchedSecretKey,
      countryMapping,
      vulnSnippets,
      outputLocation: argv.output
    })
    console.log()
    if (!challenges[0].hint && answers.insertHints !== options.noTextHints) {
      console.log('You selected text hints but '.yellow + answers.juiceShopUrl + ' API response did not contain any!'.yellow)
      console.log('Make sure that the server uses '.yellow + 'default.yml' + ' or has '.yellow + 'challenges.showHints: true' + ' in its config.'.yellow)
    }
    if (!challenges[0].hintUrl && answers.insertHintUrls !== options.noHintUrls) {
      console.log('You selected hint URLs but '.yellow + answers.juiceShopUrl + ' API response did not contain any!'.yellow)
      console.log('Make sure that the server uses '.yellow + 'default.yml' + ' or has '.yellow + 'challenges.showHints: true' + ' in its config.'.yellow)
    }
  } catch (error) {
    console.log(error.message.red)
  }
}

module.exports = juiceShopCtfCli
