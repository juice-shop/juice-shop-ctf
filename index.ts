/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import colors from 'colors' // no assignment necessary as this module extends the String prototype
import inquirer from 'inquirer'
import fetchSecretKey from './lib/fetchSecretKey'
import fetchChallenges from './lib/fetchChallenges'
import fetchCountryMapping from './lib/fetchCountryMapping'
import fetchCodeSnippets from './lib/fetchCodeSnippets'
import readConfigStream from './lib/readConfigStream'
import { options as juiceShopOptions } from './lib/options'
import * as fs from 'fs'
import generateCtfExport from './lib/generators/'
import yargs from 'yargs'

interface Argv {
  config?: string
  output?: string
  ignoreSslWarnings?: boolean
}

const argv = yargs
  .option('config', {
    alias: 'c',
    describe: 'provide a configuration file',
    type: 'string'
  })
  .option('output', {
    alias: 'o',
    describe: 'change the output file',
    type: 'string'
  })
  .option('ignoreSslWarnings', {
    alias: 'i',
    describe: 'ignore tls certificate warnings',
    type: 'boolean'
  })
  .help()
  .argv as Argv

const DEFAULT_JUICE_SHOP_URL = 'http://localhost:3000/'

const questions = [
  {
    type: 'list',
    name: 'ctfFramework',
    message: 'CTF framework to generate data for?',
    choices: [juiceShopOptions.ctfdFramework, juiceShopOptions.fbctfFramework, juiceShopOptions.rtbFramework],
    default: 0
  },
  {
    type: 'input',
    name: 'juiceShopUrl',
    message: 'Juice Shop URL to retrieve challenges?',
    default: DEFAULT_JUICE_SHOP_URL
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
    when: ({ ctfFramework }: { ctfFramework: string }) => ctfFramework === juiceShopOptions.fbctfFramework
  },
  {
    type: 'list',
    name: 'insertHints',
    message: 'Insert a text hint along with each challenge?',
    choices: [juiceShopOptions.noTextHints, juiceShopOptions.freeTextHints, juiceShopOptions.paidTextHints],
    default: 0
  },
  {
    type: 'list',
    name: 'insertHintUrls',
    message: 'Insert a hint URL along with each challenge?',
    choices: [juiceShopOptions.noHintUrls, juiceShopOptions.freeHintUrls, juiceShopOptions.paidHintUrls],
    default: 0
  },
  {
    type: 'list',
    name: 'insertHintSnippets',
    message: 'Insert a code snippet as hint for each challenge?',
    choices: [juiceShopOptions.noHintSnippets, juiceShopOptions.freeHintSnippets, juiceShopOptions.paidHintSnippets],
    default: 0
  }
]

interface ConfigAnswers {
  ctfFramework: string
  juiceShopUrl: string
  ctfKey: string
  countryMapping?: string
  insertHints: typeof juiceShopOptions.freeTextHints | typeof juiceShopOptions.paidTextHints | typeof juiceShopOptions.noTextHints
  insertHintUrls: typeof juiceShopOptions.freeHintUrls | typeof juiceShopOptions.paidHintUrls | typeof juiceShopOptions.noHintUrls
  insertHintSnippets: typeof juiceShopOptions.freeHintSnippets | typeof juiceShopOptions.paidHintSnippets | typeof juiceShopOptions.noHintSnippets
}

async function getConfig (
  argv: Argv,
  questions: Array<Record<string, any>>
): Promise<ConfigAnswers> {
  if (argv.config != null && argv.config !== '') {
    return await readConfigStream(fs.createReadStream(argv.config)).then((config: any) => ({
      ctfFramework: config.ctfFramework ?? juiceShopOptions.ctfdFramework,
      juiceShopUrl: config.juiceShopUrl,
      ctfKey: config.ctfKey,
      countryMapping: config.countryMapping,
      insertHints: config.insertHints,
      insertHintUrls: config.insertHintUrls,
      insertHintSnippets: config.insertHintSnippets
    }))
  }
  return await inquirer.prompt(questions)
}

export default async function juiceShopCtfCli (): Promise<void> {
  console.log()
  console.log(`Generate ${colors.bold('OWASP Juice Shop')} challenge archive for setting up ${colors.bold(juiceShopOptions.ctfdFramework)}, ${colors.bold(juiceShopOptions.fbctfFramework)}, or ${colors.bold(juiceShopOptions.rtbFramework)} score server`)

  try {
    const answers = await getConfig(argv, questions)

    console.log()

    // Only fetch snippets if user wants them
    const shouldFetchSnippets = answers.insertHintSnippets !== juiceShopOptions.noHintSnippets

    // Prepare fetch operations
    const fetchOperations = [
      fetchSecretKey(answers.ctfKey, argv.ignoreSslWarnings ?? false),
      fetchChallenges(answers.juiceShopUrl, argv.ignoreSslWarnings ?? false),
      fetchCountryMapping(answers.countryMapping !== undefined && answers.countryMapping !== '' ? answers.countryMapping : '', argv.ignoreSslWarnings ?? false), fetchCodeSnippets({ juiceShopUrl: answers.juiceShopUrl, ignoreSslWarnings: argv.ignoreSslWarnings ?? false, skip: !shouldFetchSnippets })
    ] as const

    const [fetchedSecretKey, challenges, countryMapping, vulnSnippets] = await Promise.all(fetchOperations)

    await generateCtfExport(
      answers.ctfFramework ?? juiceShopOptions.ctfdFramework,
      challenges,
      {
        juiceShopUrl: answers.juiceShopUrl,
        insertHints: answers.insertHints,
        insertHintUrls: answers.insertHintUrls,
        insertHintSnippets: answers.insertHintSnippets,
        ctfKey: fetchedSecretKey ?? '',
        countryMapping,
        vulnSnippets,
        outputLocation: argv.output ?? ''
      }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.log('Failed to write output to file!'.red, message.red)
  }
}
