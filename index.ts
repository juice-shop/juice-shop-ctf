/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import 'colors' // no assignment necessary as this module extends the String prototype
import inquirer from 'inquirer'
import fetchSecretKey from './lib/fetchSecretKey'
import fetchChallenges from './lib/fetchChallenges'
import fetchCountryMapping from './lib/fetchCountryMapping'
import fetchCodeSnippets from './lib/fetchCodeSnippets'
import readConfigStream from './lib/readConfigStream'
import * as options from './lib/options'
import * as fs from 'fs'

import generateCtfExport from './lib/generators/'

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
    when: ({ ctfFramework }: { ctfFramework: string }) => ctfFramework === options.fbctfFramework
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

interface ConfigAnswers {
  ctfFramework: string
  juiceShopUrl: string
  ctfKey: string
  countryMapping?: string
  insertHints: string
  insertHintUrls: string
  insertHintSnippets: string
}

interface Argv {
  config?: string
  output?: string
  ignoreSslWarnings?: boolean
  [key: string]: any
}

function getConfig (
  argv: Argv,
  questions: Array<Record<string, any>>
): Promise<ConfigAnswers> {
  if (argv.config) {
    return readConfigStream(fs.createReadStream(argv.config)).then((config: any) => ({
      ctfFramework: config.ctfFramework ?? options.ctfdFramework,
      juiceShopUrl: config.juiceShopUrl,
      ctfKey: config.ctfKey,
      countryMapping: config.countryMapping,
      insertHints: config.insertHints,
      insertHintUrls: config.insertHintUrls,
      insertHintSnippets: config.insertHintSnippets
    }))
  }
  return inquirer.prompt(questions)
}

const juiceShopCtfCli = async () => {
  console.log()
  console.log(`Generate ${'OWASP Juice Shop'.bold} challenge archive for setting up ${options.ctfdFramework.bold}, ${options.fbctfFramework.bold} or ${options.rtbFramework.bold} score server`)

  try {
    const answers = await getConfig(argv, questions)

    console.log()

    // Only fetch snippets if user wants them
    const shouldFetchSnippets = answers.insertHintSnippets !== options.noHintSnippets

    // Prepare fetch operations
    const fetchOperations = [
      fetchSecretKey(answers.ctfKey, argv.ignoreSslWarnings),
      fetchChallenges(answers.juiceShopUrl, argv.ignoreSslWarnings),
      fetchCountryMapping(answers.countryMapping ?? '', argv.ignoreSslWarnings)
    ]

    // Conditionally add snippets fetch
    if (shouldFetchSnippets) {
      fetchOperations.push(
        fetchCodeSnippets({
          juiceShopUrl: answers.juiceShopUrl,
          ignoreSslWarnings: argv.ignoreSslWarnings
        }).catch((error: Error): Record<string, unknown> => {
          console.log(`Warning: ${error.message}`.yellow)
          return {} // Return empty object on error to continue process
        })
      )
    }

    const [fetchedSecretKey, challenges, countryMapping, vulnSnippets] = await Promise.all(fetchOperations)

    const snippets = shouldFetchSnippets ? vulnSnippets : []

    await generateCtfExport(answers.ctfFramework || options.ctfdFramework, challenges, {
      juiceShopUrl: answers.juiceShopUrl,
      insertHints: answers.insertHints,
      insertHintUrls: answers.insertHintUrls,
      insertHintSnippets: answers.insertHintSnippets,
      ctfKey: fetchedSecretKey,
      countryMapping,
      vulnSnippets: snippets,
      outputLocation: argv.output
    })
  } catch (err) {
    console.log('Failed to write output to file!', err)
  }
}

export = juiceShopCtfCli
