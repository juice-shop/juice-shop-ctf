var chai = require('chai')
chai.use(require('chai-as-promised'))
var expect = chai.expect
var rewire = require('rewire')
var juiceShopCtfCli = rewire('../index')

describe('#calculateScore()', function () {
  var calculateScore = juiceShopCtfCli.__get__('calculateScore')

  it('should give 100 points for a * challenge', function () {
    expect(calculateScore(1)).to.equal(100)
  })

  it('should give 250 points for a ** challenge', function () {
    expect(calculateScore(2)).to.equal(250)
  })

  it('should give 450 points for a *** challenge', function () {
    expect(calculateScore(3)).to.equal(450)
  })

  it('should give 700 points for a **** challenge', function () {
    expect(calculateScore(4)).to.equal(700)
  })

  it('should give 1000 points for a ***** challenge', function () {
    expect(calculateScore(5)).to.equal(1000)
  })
})

describe('#isUrl()', function () {
  var isUrl = juiceShopCtfCli.__get__('isUrl')

  it('should recognize a valid HTTP URL', function () {
    expect(isUrl('http://domain')).to.be.true
  })

  it('should recognize a valid HTTPS URL', function () {
    expect(isUrl('https://domain')).to.be.true
  })

  it('should recognize a valid IP address URL', function () {
    expect(isUrl('127.0.0.1')).to.be.true
  })

  it('should not take an HMAC key for a URL', function () {
    expect(isUrl('ZRwakRJnHOTckstBeyJbyswgP!QC2T')).to.be.false
  })
})

describe('#toHmac()', function () {
  var toHmac = juiceShopCtfCli.__get__('toHmac')

  it('should create a SHA256 HMAC from plain text and secret key', function () {
    expect(toHmac('text', 'ZJnHOTckstBeJP!QC2T')).to.equal('5188938396d17832dd26fbabd5ac4d79518a87da')
  })

  it('should create a SHA256 HMAC from plain text and empty secret key', function () {
    expect(toHmac('text', '')).to.equal('f3f276f5001644013dbd202f1854bd61f9123d0f')
  })

  it('should create a different HMACs from different plain texts', function () {
    expect(toHmac('text1', 'key')).to.not.equal(toHmac('text2', 'key'))
  })
})

describe('#fetchHmacKey()', function () {
  var fetchHmacKey = juiceShopCtfCli.__get__('fetchHmacKey')

  it('should return input as key if it is not a URL', function (done) {
    expect(fetchHmacKey('ZJnHOTckstBeJP!QC2T')).to.eventually.equal('ZJnHOTckstBeJP!QC2T').and.notify(done)
  })
})

describe('#generateSql()', function () {
  var progressBarMock = { tick: function () {} }

  var generateSql = juiceShopCtfCli.__get__('generateSql')

  var challenges
  beforeEach(function () {
    challenges = {
      c1: {id: 1, name: 'c1', description: 'C1', difficulty: 1, category: '1'},
      c2: {id: 2, name: 'c2', description: 'C1', difficulty: 2, category: '2'},
      c3: {id: 3, name: 'c3', description: 'C2', difficulty: 3, category: '2'},
      c4: {id: 4, name: 'c4', description: 'C2', difficulty: 4, category: '3'},
      c5: {id: 5, name: 'c5', description: 'C2', difficulty: 5, category: '1'}
    }
  })

  it('should prepend DELETE statement when option is chosen', function (done) {
    expect(generateSql(challenges, true, false, '', progressBarMock)).to.eventually.match(/^delete from challenges;/i).and.notify(done)
  })

  it('should not prepend DELETE statement when option is not chosen', function (done) {
    expect(generateSql(challenges, false, false, '', progressBarMock)).to.eventually.not.match(/^delete from challenges;/i).and.notify(done)
  })

  it('should append SELECT statement when option is chosen', function (done) {
    expect(generateSql(challenges, false, true, '', progressBarMock)).to.eventually.match(/select \* from challenges;\s*$/i).and.notify(done)
  })

  it('should not append SELECT statement when option not is chosen', function (done) {
    expect(generateSql(challenges, false, false, '', progressBarMock)).to.eventually.not.match(/select \* from challenges;\s*$/i).and.notify(done)
  })

  it('should generate one INSERT statement per challenge', function () {
    return Promise.all([
      expect(generateSql(challenges, false, false, '', progressBarMock)).to.eventually.match(/insert into challenges.*values \(1.*;/i),
      expect(generateSql(challenges, false, false, '', progressBarMock)).to.eventually.match(/insert into challenges.*values \(2.*;/i),
      expect(generateSql(challenges, false, false, '', progressBarMock)).to.eventually.match(/insert into challenges.*values \(3.*;/i),
      expect(generateSql(challenges, false, false, '', progressBarMock)).to.eventually.match(/insert into challenges.*values \(4.*;/i),
      expect(generateSql(challenges, false, false, '', progressBarMock)).to.eventually.match(/insert into challenges.*values \(5.*;/i)
    ])
  })
})

describe('#writeOutput()', function () {
  var writeOutput = juiceShopCtfCli.__get__('writeOutput')

  it('should write SQL statements to insert-ctfd-challenges.sql', function () {
    juiceShopCtfCli.__set__({
      console: {
        log: function () {}
      },
      fs: {
        writeFile: function (path, data, cb) {
          expect(data).to.equal('SQL')
          expect(path).to.equal('insert-ctfd-challenges.sql')
          cb(null, 'Done')
        }}
    })
    writeOutput('SQL')
  })
})

describe('#fetchChallenges()', function () {
  var fetchChallenges = juiceShopCtfCli.__get__('fetchChallenges')

  it('should fetch challenges from path /api/Challenges of a given URL', function (done) {
    juiceShopCtfCli.__set__({
      request: function (url) {
        expect(url).to.deep.equal({ url: 'http://localhost:3000/api/Challenges', json: true })
        return new Promise(function () { done() })
      }
    })
    fetchChallenges('http://localhost:3000')
  })
})
