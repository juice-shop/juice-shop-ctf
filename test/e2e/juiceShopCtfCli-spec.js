var chai = require('chai')
chai.use(require('chai-as-promised'))
var expect = chai.expect
var inquirer = require('inquirer-test')
var run = inquirer
var ENTER = inquirer.ENTER
var DOWN = inquirer.DOWN
var fs = require('fs')
var path = require('path')

const juiceShopCtfCli = path.join(__dirname, '../../bin/juice-shop-ctf.js')

describe('juice-shop-ctf', function () {
  beforeEach(function () {
    if (fs.existsSync('insert-ctfd-challenges.sql')) {
      fs.unlinkSync('insert-ctfd-challenges.sql')
    }
  })

  it('should accept defaults for all input questions', function () {
    this.timeout(20000)
    return expect(run(juiceShopCtfCli, [ENTER, ENTER, ENTER, ENTER], 1500)).to
      .eventually.match(/ZIP-archive written to /i).and
      .eventually.match(/INSERT a text hint along with each CTFd Challenge\? No text hints/i).and
      .eventually.match(/INSERT a hint URL along with each CTFd Challenge\? No hint URLs/i).and
  })

  it('should insert free hints when chosen', function () {
    this.timeout(20000)
    return expect(run(juiceShopCtfCli, [ENTER, ENTER, DOWN, ENTER, ENTER], 1500)).to
      .eventually.match(/INSERT a text hint along with each CTFd Challenge\? Free text hints/i)
  })

  it('should insert paid hints when chosen', function () {
    this.timeout(20000)
    return expect(run(juiceShopCtfCli, [ENTER, ENTER, DOWN, DOWN, ENTER, ENTER], 1500)).to
      .eventually.match(/INSERT a text hint along with each CTFd Challenge\? Paid text hints/i)
  })

  it('should insert free hint URLs when chosen', function () {
    this.timeout(20000)
    return expect(run(juiceShopCtfCli, [ENTER, ENTER, ENTER, DOWN, ENTER], 1500)).to
      .eventually.match(/INSERT a hint URL along with each CTFd Challenge\? Free hint URLs/i)
  })

  it('should insert paid hint URLs when chosen', function () {
    this.timeout(20000)
    return expect(run(juiceShopCtfCli, [ENTER, ENTER, ENTER, DOWN, DOWN, ENTER], 1500)).to
      .eventually.match(/INSERT a hint URL along with each CTFd Challenge\? Paid hint URLs/i)
  })

  it('should fail on invalid Juice Shop URL', function () {
    this.timeout(20000)
    return expect(run(juiceShopCtfCli, ['localhorst', ENTER, ENTER, ENTER, ENTER], 1500)).to
      .eventually.match(/Failed to fetch challenges from API!/i)
  })

  it('should fail on invalid ctf.key URL', function () {
    this.timeout(20000)
    return expect(run(juiceShopCtfCli, [ENTER, 'httpx://invalid/ctf-key', ENTER, ENTER, ENTER], 1500)).to
      .eventually.match(/Failed to fetch secret key from URL!/i)
  })

  it('should fail when output file cannot be written', function () {
    this.timeout(20000)
    fs.openSync('insert-ctfd-challenges.sql', 'w', 0)
    return expect(run(juiceShopCtfCli, [ENTER, ENTER, ENTER, ENTER], 1500)).to
      .eventually.match(/Failed to write output to file!/i)
  })
})
