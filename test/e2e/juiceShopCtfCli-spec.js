const chai = require('chai')
chai.use(require('chai-as-promised'))
const expect = chai.expect
const inquirer = require('inquirer-test')
const run = inquirer
const ENTER = inquirer.ENTER
const DOWN = inquirer.DOWN
const fs = require('fs')
const path = require('path')
const dateFormat = require('dateformat')
const outputFile = 'OWASP_Juice_Shop.' + dateFormat(new Date(), 'yyyy-mm-dd') + '.CTFd.zip'
const desiredCtfdOutputFile = './output.zip'
const desiredFbctfOutputFile = './output.json'
const desiredRtbOutputFile = './output.xml'
const configFile = 'config.yml'
const util = require('util')
const execFile = util.promisify(require('child_process').execFile)

const TIMEOUT = 45000
const juiceShopCtfCli = [path.join(__dirname, '../../bin/juice-shop-ctf.js')]

function cleanup () {
  if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile)
  }
  if (fs.existsSync(configFile)) {
    fs.unlinkSync(configFile)
  }
  if (fs.existsSync(desiredCtfdOutputFile)) {
    fs.unlinkSync(desiredCtfdOutputFile)
  }
  if (fs.existsSync(desiredFbctfOutputFile)) {
    fs.unlinkSync(desiredFbctfOutputFile)
  }
  if (fs.existsSync(desiredRtbOutputFile)) {
    fs.unlinkSync(desiredRtbOutputFile)
  }
}

describe('juice-shop-ctf', () => {
  beforeEach(cleanup)
  after(cleanup)

  it('should accept defaults for all input questions', function () {
    this.timeout(TIMEOUT)
    return expect(run(juiceShopCtfCli, [ENTER, ENTER, ENTER, ENTER, ENTER, ENTER], 2000)).to
      .eventually.match(/Backup archive written to /i).and
      .eventually.match(/Insert a text hint along with each challenge\? No text hints/i).and
      .eventually.match(/Insert a hint URL along with each challenge\? No hint URLs/i).and
      .eventually.match(/Insert a code snippet as hint for each challenge\? No hint snippets/i)
  })

  it('should insert free hints when chosen', function () {
    this.timeout(TIMEOUT)
    return expect(run(juiceShopCtfCli, [ENTER, ENTER, ENTER, DOWN, ENTER, ENTER, ENTER], 2000)).to
      .eventually.match(/Insert a text hint along with each challenge\? Free text hints/i)
  })

  it('should insert paid hints when chosen', function () {
    this.timeout(TIMEOUT)
    return expect(run(juiceShopCtfCli, [ENTER, ENTER, ENTER, DOWN, DOWN, ENTER, ENTER, ENTER], 2000)).to
      .eventually.match(/Insert a text hint along with each challenge\? Paid text hints/i)
  })

  it('should insert free hint URLs when chosen', function () {
    this.timeout(TIMEOUT)
    return expect(run(juiceShopCtfCli, [ENTER, ENTER, ENTER, ENTER, DOWN, ENTER, ENTER], 2000)).to
      .eventually.match(/Insert a hint URL along with each challenge\? Free hint URLs/i)
  })

  it('should insert paid hint URLs when chosen', function () {
    this.timeout(TIMEOUT)
    return expect(run(juiceShopCtfCli, [ENTER, ENTER, ENTER, ENTER, DOWN, DOWN, ENTER, ENTER], 2000)).to
      .eventually.match(/Insert a hint URL along with each challenge\? Paid hint URLs/i)
  })

  it('should fail on invalid Juice Shop URL', function () {
    this.timeout(TIMEOUT)
    return expect(run(juiceShopCtfCli, [ENTER, 'localhorst', ENTER, ENTER, ENTER, ENTER, ENTER], 2000)).to
      .eventually.match(/Failed to fetch challenges from API!/i)
  })

  it('should fail on invalid ctf.key URL', function () {
    this.timeout(TIMEOUT)
    return expect(run(juiceShopCtfCli, [ENTER, ENTER, 'httpx://invalid/ctf-key', ENTER, ENTER, ENTER, ENTER], 2000)).to
      .eventually.match(/Failed to fetch secret key from URL!/i)
  })

  it('should generate a FBCTF export when choosen', function () {
    this.timeout(TIMEOUT)
    return expect(run(juiceShopCtfCli, [DOWN, ENTER, ENTER, ENTER, ENTER, ENTER, ENTER], 2000)).to
      .eventually.match(/CTF framework to generate data for\? FBCTF/i)
  })

  it('should generate a RootTheBox export when choosen', function () {
    this.timeout(TIMEOUT)
    return expect(run(juiceShopCtfCli, [DOWN, DOWN, ENTER, ENTER, ENTER, ENTER, ENTER, ENTER], 1500)).to
      .eventually.match(/CTF framework to generate data for\? RootTheBox/i)
  })

  it('should fail when output file cannot be written', function () {
    this.timeout(TIMEOUT)
    fs.openSync(outputFile, 'w', 0)
    return expect(run(juiceShopCtfCli, [ENTER, ENTER, ENTER, ENTER, ENTER, ENTER], 2000)).to
      .eventually.match(/Failed to write output to file!/i)
  })

  it('should accept a config file', function () {
    fs.writeFileSync(configFile, `
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/bkimminich/juice-shop/master/ctf.key
insertHints: paid
insertHintUrls: paid
insertHintSnippets: paid`)

    this.timeout(TIMEOUT)
    return expect(execFile('node', [juiceShopCtfCli[0], '--config', configFile]).then(obj => obj.stdout)).to
      .eventually.match(/Backup archive written to /i)
  })

  it('should fail when the config file cannot be parsed', function () {
    fs.writeFileSync(configFile, `
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/bkimminich/juice-shop/master/ctf.key
insertHints`)

    this.timeout(TIMEOUT)
    return expect(execFile('node', [juiceShopCtfCli[0], '--config', configFile]).then(obj => obj.stdout)).to
      .eventually.match(/can not read /i)
  })

  it('should fail when the config file contains invalid values', function () {
    fs.writeFileSync(configFile, `
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/bkimminich/juice-shop/master/ctf.key
insertHints: paid
insertHintUrls: paid
insertHintSnippets: invalidValue`)

    this.timeout(TIMEOUT)
    return expect(execFile('node', [juiceShopCtfCli[0], '--config', configFile]).then(obj => obj.stdout)).to
      .eventually.match(/"insertHintUrls" must be one of /i)
  })

  it('should write the output file to the specified location', function () {
    fs.writeFileSync(configFile, `
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/bkimminich/juice-shop/master/ctf.key
insertHints: paid
insertHintUrls: paid
insertHintSnippets: paid`)

    this.timeout(TIMEOUT)
    return expect(execFile('node', [juiceShopCtfCli[0], '--config', configFile, '--output', desiredCtfdOutputFile])
      .then(() => fs.existsSync(desiredCtfdOutputFile))).to
      .eventually.equal(true)
  })

  it('should be possible to create a CTFd export with a config file', function () {
    fs.writeFileSync(configFile, `
ctfFramework: CTFd
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/bkimminich/juice-shop/master/ctf.key
insertHints: paid
insertHintUrls: paid
insertHintSnippets: paid`)

    this.timeout(TIMEOUT)
    return expect(execFile('node', [juiceShopCtfCli[0], '--config', configFile, '--output', desiredCtfdOutputFile])
      .then(() => fs.existsSync(desiredCtfdOutputFile))).to
      .eventually.equal(true)
  })

  it('should be possible to create a FBCTF export with a config file', function () {
    fs.writeFileSync(configFile, `
ctfFramework: FBCTF
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/bkimminich/juice-shop/master/ctf.key
countryMapping: https://raw.githubusercontent.com/bkimminich/juice-shop/master/config/fbctf.yml
insertHints: paid
insertHintUrls: paid
insertHintSnippets: paid`)

    this.timeout(TIMEOUT)
    return expect(execFile('node', [juiceShopCtfCli[0], '--config', configFile, '--output', desiredFbctfOutputFile])
      .then(() => fs.existsSync(desiredFbctfOutputFile))).to
      .eventually.equal(true)
  })

  it('should be possible to create a RootTheBox export with a config file', function () {
    fs.writeFileSync(configFile, `
ctfFramework: RootTheBox
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/bkimminich/juice-shop/master/ctf.key
insertHints: paid
insertHintUrls: paid
insertHintSnippets: paid`)

    this.timeout(TIMEOUT)
    return expect(execFile('node', [juiceShopCtfCli[0], '--config', configFile, '--output', desiredRtbOutputFile])
      .then(() => fs.existsSync(desiredRtbOutputFile))).to
      .eventually.equal(true)
  })
})
