var chai = require('chai')
chai.use(require('chai-as-promised'))
var expect = chai.expect
var inquirer = require('inquirer-test')
var run = inquirer
var ENTER = inquirer.ENTER
var fs = require('fs')
var path = require('path')

const juiceShopCtfCli = path.join(__dirname, '../../bin/juice-shop-ctf.js')

describe('juice-shop-ctf', function () {
  beforeEach(function () {
    if (fs.existsSync('insert-ctfd-challenges.sql')) {
      fs.unlinkSync('insert-ctfd-challenges.sql')
    }
  })

  it('should accept defaults for all input questions', function (done) {
    this.timeout(20000)
    expect(run(juiceShopCtfCli, [ENTER, ENTER, ENTER, ENTER], 1000)).to
      .eventually.match(/SQL written to/i).and
      .eventually.match(/DELETE all CTFd Challenges before INSERT statements\? Yes/i).and
      .eventually.match(/SELECT all CTFd Challenges after INSERT statements\? Yes/i).and
      .notify(done)
  })

  it('should not insert DELETE statement when not chosen', function (done) {
    this.timeout(20000)
    expect(run(juiceShopCtfCli, [ENTER, ENTER, 'n', ENTER, ENTER], 1000)).to.eventually.match(/DELETE all CTFd Challenges before INSERT statements\? No/i).and.notify(done)
  })

  it('should not insert SELECT statement when not chosen', function (done) {
    this.timeout(20000)
    expect(run(juiceShopCtfCli, [ENTER, ENTER, ENTER, 'n', ENTER], 1000)).to.eventually.match(/SELECT all CTFd Challenges after INSERT statements\? No/i).and.notify(done)
  })

  it('should fail on invalid Juice Shop URL', function (done) {
    this.timeout(20000)
    expect(run(juiceShopCtfCli, ['localhorst', ENTER, ENTER, ENTER, ENTER], 1000)).to.eventually.match(/Failed to fetch challenges from API!/i).and.notify(done)
  })

  it('should fail on invalid ctf.key URL', function (done) {
    this.timeout(20000)
    expect(run(juiceShopCtfCli, [ENTER, 'http://i.n.v.a.l.i.d/ctf-key', ENTER, ENTER, ENTER], 1000)).to.eventually.match(/Failed to fetch secret key from URL!/i).and.notify(done)
  })

  it('should fail when output file cannot be written', function (done) {
    this.timeout(20000)
    fs.openSync('insert-ctfd-challenges.sql', 'w', 0)
    expect(run(juiceShopCtfCli, [ENTER, ENTER, ENTER, ENTER], 1000)).to.eventually.match(/Failed to write output to file!/i).and.notify(done)
  })
})
