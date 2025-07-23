/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const { describe, it, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const util = require('node:util')
const { execFile } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const inquirer = require('inquirer-test')
const dateFormat = require('dateformat')

const execFilePromise = util.promisify(execFile)

const run = inquirer
const ENTER = inquirer.ENTER
const DOWN = inquirer.DOWN

const TIMEOUT = 45000
const juiceShopCtfCli = [path.join(__dirname, '../../bin/juice-shop-ctf.js')]
const outputFile = `OWASP_Juice_Shop.${dateFormat(new Date(), 'yyyy-mm-dd')}.CTFd.csv`
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
    const output = await run(juiceShopCtfCli, [ENTER, ENTER, ENTER, ENTER, ENTER, ENTER], 2000)
    assert.match(output, /Backup archive written to /i)
    assert.match(output, /Insert a text hint along with each challenge\? No text hints/i)
    assert.match(output, /Insert a hint URL along with each challenge\? No hint URLs/i)
    assert.match(output, /Insert a code snippet as hint for each challenge\? No hint snippets/i)
  })

  it('should insert free hints when chosen', { timeout: TIMEOUT }, async () => {
    const output = await run(juiceShopCtfCli, [ENTER, ENTER, ENTER, DOWN, ENTER, ENTER, ENTER], 2000)
    assert.match(output, /Insert a text hint along with each challenge\? Free text hints/i)
  })

  it('should insert paid hints when chosen', { timeout: TIMEOUT }, async () => {
    const output = await run(juiceShopCtfCli, [ENTER, ENTER, ENTER, DOWN, DOWN, ENTER, ENTER, ENTER], 2000)
    assert.match(output, /Insert a text hint along with each challenge\? Paid text hints/i)
  })

  it('should insert free hint URLs when chosen', { timeout: TIMEOUT }, async () => {
    const output = await run(juiceShopCtfCli, [ENTER, ENTER, ENTER, ENTER, DOWN, ENTER, ENTER], 2000)
    assert.match(output, /Insert a hint URL along with each challenge\? Free hint URLs/i)
  })

  it('should insert paid hint URLs when chosen', { timeout: TIMEOUT }, async () => {
    const output = await run(juiceShopCtfCli, [ENTER, ENTER, ENTER, ENTER, DOWN, DOWN, ENTER, ENTER], 2000)
    assert.match(output, /Insert a hint URL along with each challenge\? Paid hint URLs/i)
  })

  it('should fail on invalid Juice Shop URL', { timeout: TIMEOUT }, async () => {
    const output = await run(juiceShopCtfCli, [ENTER, 'localhorst', ENTER, ENTER, ENTER, ENTER, ENTER], 2000)
    assert.match(output, /Failed to fetch challenges from API!/i)
  })

  it('should fail on invalid ctf.key URL', { timeout: TIMEOUT }, async () => {
    const output = await run(juiceShopCtfCli, [ENTER, ENTER, 'httpx://invalid/ctf-key', ENTER, ENTER, ENTER, ENTER], 2000)
    assert.match(output, /Failed to fetch secret key from URL!/i)
  })

  it('should generate a FBCTF export when choosen', { timeout: TIMEOUT }, async () => {
    const output = await run(juiceShopCtfCli, [DOWN, ENTER, ENTER, ENTER, ENTER, ENTER, ENTER], 2000)
    assert.match(output, /CTF framework to generate data for\? FBCTF/i)
  })

  it('should generate a RootTheBox export when choosen', { timeout: TIMEOUT }, async () => {
    const output = await run(juiceShopCtfCli, [DOWN, DOWN, ENTER, ENTER, ENTER, ENTER, ENTER, ENTER], 1500)
    assert.match(output, /CTF framework to generate data for\? RootTheBox/i)
  })

  it('should accept a config file', { timeout: TIMEOUT }, async () => {
    fs.writeFileSync(configFile, `
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
insertHints: paid
insertHintUrls: paid
insertHintSnippets: paid`)
    const { stdout } = await execFilePromise('node', [juiceShopCtfCli[0], '--config', configFile])
    assert.match(stdout, /Backup archive written to /i)
  })

  it('should be able to ignore SslWarnings', { timeout: TIMEOUT }, async () => {
    fs.writeFileSync(configFile, `
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
insertHints: paid
insertHintUrls: paid
insertHintSnippets: paid`)
    const { stdout } = await execFilePromise('node', [juiceShopCtfCli[0], '--config', configFile, '--ignoreSslWarnings'])
    assert.match(stdout, /Backup archive written to /i)
  })

  it('should fail when the config file cannot be parsed', { timeout: TIMEOUT }, async () => {
    fs.writeFileSync(configFile, `
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
insertHints`)
    await assert.rejects(
      execFilePromise('node', [juiceShopCtfCli[0], '--config', configFile]),
      (err) => {
        assert.match(err.stdout, /can not read /i)
        return true
      }
    )
  })

  it('should fail when the config file contains invalid values', { timeout: TIMEOUT }, async () => {
    fs.writeFileSync(configFile, `
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
insertHints: paid
insertHintUrls: invalidValue
insertHintSnippets: paid`)
    await assert.rejects(
      execFilePromise('node', [juiceShopCtfCli[0], '--config', configFile]),
      (err) => {
        assert.match(err.stdout, /"insertHintUrls" must be one of /i)
        return true
      }
    )
  })

  it('should write the output file to the specified location', { timeout: TIMEOUT }, async () => {
    fs.writeFileSync(configFile, `
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
insertHints: paid
insertHintUrls: paid
insertHintSnippets: paid`)
    await execFilePromise('node', [juiceShopCtfCli[0], '--config', configFile, '--output', desiredCtfdOutputFile])
    assert.ok(fs.existsSync(desiredCtfdOutputFile), 'Output file should have been created')
  })

  it('should be possible to create a CTFd export with a config file', { timeout: TIMEOUT }, async () => {
    fs.writeFileSync(configFile, `
ctfFramework: CTFd
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
insertHints: paid
insertHintUrls: paid
insertHintSnippets: paid`)
    await execFilePromise('node', [juiceShopCtfCli[0], '--config', configFile, '--output', desiredCtfdOutputFile])
    assert.ok(fs.existsSync(desiredCtfdOutputFile), 'CTFd output file should have been created')
  })

  it('should be possible to create a FBCTF export with a config file', { timeout: TIMEOUT }, async () => {
    fs.writeFileSync(configFile, `
ctfFramework: FBCTF
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
countryMapping: https://raw.githubusercontent.com/juice-shop/juice-shop/master/config/fbctf.yml
insertHints: paid
insertHintUrls: paid
insertHintSnippets: paid`)
    await execFilePromise('node', [juiceShopCtfCli[0], '--config', configFile, '--output', desiredFbctfOutputFile])
    assert.ok(fs.existsSync(desiredFbctfOutputFile), 'FBCTF output file should have been created')
  })

  it('should be possible to create a RootTheBox export with a config file', { timeout: TIMEOUT }, async () => {
    fs.writeFileSync(configFile, `
ctfFramework: RootTheBox
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/juice-shop/juice-shop/master/ctf.key
insertHints: paid
insertHintUrls: paid
insertHintSnippets: paid`)
    await execFilePromise('node', [juiceShopCtfCli[0], '--config', configFile, '--output', desiredRtbOutputFile])
    assert.ok(fs.existsSync(desiredRtbOutputFile), 'RootTheBox output file should have been created')
  })

  it('should fail when output file cannot be written', { timeout: TIMEOUT }, async () => {
    fs.openSync(outputFile, 'w', 0o444)
    const output = await run(juiceShopCtfCli, [ENTER, ENTER, ENTER, ENTER, ENTER, ENTER], 2000)
    assert.match(output, /Failed to write output to file!/i)
  })
})
