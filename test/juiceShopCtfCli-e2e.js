var chai = require('chai')
chai.use(require('chai-as-promised'))
var expect = chai.expect
var inquirer = require('inquirer-test')
var run = inquirer
var ENTER = inquirer.ENTER
var path = require('path')

const juiceShopCtfCli = path.join(__dirname, '../bin/juice-shop-ctf.js')

describe('juiceShopCtfCli()', function () {
  it('should accept defaults for all input questions', function (done) {
    this.timeout(20000)
    expect(run(juiceShopCtfCli, [ENTER, ENTER, ENTER, ENTER], 1000)).to.eventually.match(/SQL written to/).and.notify(done)
  })
})

