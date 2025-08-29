/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, beforeEach, after } from 'node:test'
import assert from 'node:assert'
import util from 'node:util'
import * as fs from 'fs'
import { execFile } from 'node:child_process'
import path from 'node:path'
// @ts-expect-error FIXME due to non-existing type definitions for inquirer-test
import inquirer from 'inquirer-test'
import df from 'dateformat'

// FIXME Change back to https://juice-shop.herokuapp.com after release of v19.0.0 of Juice Shop main app
const DEFAULT_JUICE_SHOP_URL = process.env.DEFAULT_JUICE_SHOP_URL ?? 'https://juice-shop-staging.herokuapp.com'

const execFilePromise = util.promisify(execFile)

const run = inquirer
const ENTER = inquirer.ENTER
const DOWN = inquirer.DOWN

const TIMEOUT = 45000
const juiceShopCtfCli = [path.join(__dirname, '../../bin/juice-shop-ctf.js')]
const outputFile = `OWASP_Juice_Shop.${df(new Date(), 'yyyy-mm-dd')}.CTFd.csv`
const desiredCtfdOutputFile = './output.zip'
const desiredFbctfOutputFile = './output.json'
const desiredRtbOutputFile = './output.xml'
const configFile = 'config.yml'

function cleanup () {
  for (const file of [outputFile, configFile, desiredCtfdOutputFile, desiredFbctfOutputFile, desiredRtbOutputFile]) {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file)
    }
  }
}

describe('juice-shop-ctf', () => {
  beforeEach(cleanup)
  after(cleanup)

  it('should accept defaults for all input questions', { timeout: TIMEOUT }, async () => {
    const output = await run(juiceShopCtfCli, [ENTER, ENTER, ENTER, ENTER], 2000)
    assert.match(output, /Backup archive written to /i)
    assert.match(output, /Insert a list of hints along with each challenge\? No hints/i)
  })

  it('should insert free hints when chosen', { timeout: TIMEOUT }, async () => {
    const output = await run(juiceShopCtfCli, [ENTER, ENTER, ENTER, DOWN, ENTER], 2000)
    assert.match(output, /Insert a list of hints along with each challenge\? Free hints/i)
  })

  it('should insert paid hints when chosen', { timeout: TIMEOUT }, async () => {
    const output = await run(juiceShopCtfCli, [ENTER, ENTER, ENTER, DOWN, DOWN, ENTER], 2000)
    assert.match(output, /Insert a list of hints along with each challenge\? Paid hints/i)
  })

  it('should fail on invalid Juice Shop URL', { timeout: TIMEOUT }, async () => {
    const output = await run(juiceShopCtfCli, [ENTER, 'localhorst', ENTER, ENTER, ENTER], 2000)
    assert.match(output, /Failed to fetch challenges from API!/i)
  })

  it('should fail on invalid ctf.key URL', { timeout: TIMEOUT }, async () => {
    const output = await run(juiceShopCtfCli, [ENTER, ENTER, 'httpx://invalid/ctf-key', ENTER, ENTER], 2000)
    assert.match(output, /Failed to fetch secret key from URL!/i)
  })

  it('should generate a FBCTF export when choosen', { timeout: TIMEOUT }, async () => {
    const output = await run(juiceShopCtfCli, [DOWN, ENTER, ENTER, ENTER, ENTER], 2000)
    assert.match(output, /CTF framework to generate data for\? FBCTF/i)
  })

  it('should generate a RootTheBox export when choosen', { timeout: TIMEOUT }, async () => {
    const output = await run(juiceShopCtfCli, [DOWN, DOWN, ENTER, ENTER, ENTER, ENTER], 1500)
    assert.match(output, /CTF framework to generate data for\? RootTheBox/i)
  })

  it('should accept a config file', { timeout: TIMEOUT }, async () => {
    fs.writeFileSync(configFile, `
juiceShopUrl: ${DEFAULT_JUICE_SHOP_URL}
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
insertHints: paid`)
    const { stdout } = await execFilePromise('node', [juiceShopCtfCli[0], '--config', configFile])
    assert.match(stdout, /Backup archive written to /i)
  })

  it('should be able to ignore SslWarnings', { timeout: TIMEOUT }, async () => {
    fs.writeFileSync(configFile, `
juiceShopUrl: ${DEFAULT_JUICE_SHOP_URL}
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
insertHints: paid`)
    const { stdout } = await execFilePromise('node', [juiceShopCtfCli[0], '--config', configFile, '--ignoreSslWarnings'])
    assert.match(stdout, /Backup archive written to /i)
  })

  it('should fail when the config file cannot be parsed', { timeout: TIMEOUT }, async () => {
    fs.writeFileSync(configFile, `
juiceShopUrl: ${DEFAULT_JUICE_SHOP_URL}
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
insertHints`)
    const { stdout } = await execFilePromise('node', [juiceShopCtfCli[0], '--config', configFile])
    assert.match(stdout, /can not read/i, 'stdout should mention a parsing error')
  })

  it('should fail when the config file contains invalid values', { timeout: TIMEOUT }, async () => {
    fs.writeFileSync(configFile, `
juiceShopUrl: ${DEFAULT_JUICE_SHOP_URL}
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
insertHints: invalidValue`)
    const { stdout } = await execFilePromise('node', [juiceShopCtfCli[0], '--config', configFile])
    assert.match(stdout, /"insertHints" must be one of/i, 'stdout should mention an invalid value')
  })

  it('should write the output file to the specified location', { timeout: TIMEOUT }, async () => {
    fs.writeFileSync(configFile, `
juiceShopUrl: ${DEFAULT_JUICE_SHOP_URL}
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
insertHints: paid`)
    await execFilePromise('node', [juiceShopCtfCli[0], '--config', configFile, '--output', desiredCtfdOutputFile])
    assert.ok(fs.existsSync(desiredCtfdOutputFile), 'Output file should have been created')
  })

  it('should be possible to create a CTFd export with a config file', { timeout: TIMEOUT }, async () => {
    fs.writeFileSync(configFile, `
ctfFramework: CTFd
juiceShopUrl: ${DEFAULT_JUICE_SHOP_URL}
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
insertHints: paid`)
    await execFilePromise('node', [juiceShopCtfCli[0], '--config', configFile, '--output', desiredCtfdOutputFile])
    assert.ok(fs.existsSync(desiredCtfdOutputFile), 'CTFd output file should have been created')
  })

  it('should be possible to create a FBCTF export with a config file', { timeout: TIMEOUT }, async () => {
    fs.writeFileSync(configFile, `
ctfFramework: FBCTF
juiceShopUrl: ${DEFAULT_JUICE_SHOP_URL}
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
countryMapping: https://raw.githubusercontent.com/juice-shop/juice-shop/master/config/fbctf.yml
insertHints: paid`)
    await execFilePromise('node', [juiceShopCtfCli[0], '--config', configFile, '--output', desiredFbctfOutputFile])
    assert.ok(fs.existsSync(desiredFbctfOutputFile), 'FBCTF output file should have been created')
  })

  it('should be possible to create a RootTheBox export with a config file', { timeout: TIMEOUT }, async () => {
    fs.writeFileSync(configFile, `
ctfFramework: RootTheBox
juiceShopUrl: ${DEFAULT_JUICE_SHOP_URL}
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
insertHints: paid`)
    await execFilePromise('node', [juiceShopCtfCli[0], '--config', configFile, '--output', desiredRtbOutputFile])
    assert.ok(fs.existsSync(desiredRtbOutputFile), 'RootTheBox output file should have been created')
  })

  it('should fail when output file cannot be written', { timeout: TIMEOUT }, async () => {
    // Create the output file first
    fs.writeFileSync(outputFile, '')
    // Set read-only permissions (no write permission)
    fs.chmodSync(outputFile, 0o444)
    const output = await run(juiceShopCtfCli, [ENTER, ENTER, ENTER, ENTER, ENTER, ENTER], 2000)
    assert.match(output, /Failed to write output to file!/i)
  })
})
