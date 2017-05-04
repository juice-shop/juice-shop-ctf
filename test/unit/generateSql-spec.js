var Promise = require('bluebird')
var chai = require('chai')
chai.use(require('chai-as-promised'))
var expect = chai.expect
var generateSql = require('../../lib/generateSql')
var options = require('../../lib/options')

describe('Generated SQL', function () {
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

  it('should have DELETE statement prepended when option is chosen', function () {
    return expect(generateSql(challenges, true, options.noTextHints, options.noHintUrls, false, '')).to.eventually.match(/^delete from challenges;/i)
  })

  it('should not have DELETE statement prepended when option is not chosen', function () {
    return expect(generateSql(challenges, false, options.noTextHints, options.noHintUrls, false, '')).to.eventually.not.match(/^delete from challenges;/i)
  })

  it('should have SELECT statement appended when option is chosen', function () {
    return expect(generateSql(challenges, false, options.noTextHints, options.noHintUrls, true, '')).to.eventually.match(/select .* from challenges .* join keys .*;\s*$/i)
  })

  it('should not have SELECT statement appended when option not is chosen', function () {
    return expect(generateSql(challenges, false, options.noTextHints, options.noHintUrls, false, '')).to.eventually.not.match(/select .*;\s*$/i)
  })

  it('should consist of one INSERT statement into "challenges" per challenge', function () {
    return Promise.all([
      expect(generateSql(challenges, false, options.noTextHints, options.noHintUrls, false, '')).to.eventually.match(/insert into challenges.*values \(1.*;/i),
      expect(generateSql(challenges, false, options.noTextHints, options.noHintUrls, false, '')).to.eventually.match(/insert into challenges.*values \(2.*;/i),
      expect(generateSql(challenges, false, options.noTextHints, options.noHintUrls, false, '')).to.eventually.match(/insert into challenges.*values \(3.*;/i),
      expect(generateSql(challenges, false, options.noTextHints, options.noHintUrls, false, '')).to.eventually.match(/insert into challenges.*values \(4.*;/i),
      expect(generateSql(challenges, false, options.noTextHints, options.noHintUrls, false, '')).to.eventually.match(/insert into challenges.*values \(5.*;/i)
    ])
  })

  it('should consist of one INSERT statement into "keys" per challenge', function () {
    return Promise.all([
      expect(generateSql(challenges, false, options.noTextHints, options.noHintUrls, false, '')).to.eventually.match(/insert into keys.*values \(1, 1.*;/i),
      expect(generateSql(challenges, false, options.noTextHints, options.noHintUrls, false, '')).to.eventually.match(/insert into keys.*values \(2, 2.*;/i),
      expect(generateSql(challenges, false, options.noTextHints, options.noHintUrls, false, '')).to.eventually.match(/insert into keys.*values \(3, 3.*;/i),
      expect(generateSql(challenges, false, options.noTextHints, options.noHintUrls, false, '')).to.eventually.match(/insert into keys.*values \(4, 4.*;/i),
      expect(generateSql(challenges, false, options.noTextHints, options.noHintUrls, false, '')).to.eventually.match(/insert into keys.*values \(5, 5.*;/i)
    ])
  })

  it('should be empty when given no challenges', function () {
    return expect(generateSql({}, false, options.noTextHints, options.noHintUrls, false, '')).to.eventually.equal('')
  })

  it('should log generator error to console', function () {
    return expect(generateSql({c1: undefined}, false, options.noTextHints, options.noHintUrls, false, '')).to.be.rejectedWith('Failed to generate SQL statements! TypeError')
  })

  it('should INSERT a text hint for a challenge that has a hint defined', function () {
    challenges.c3.hint = 'hint'
    return Promise.all([
      expect(generateSql(challenges, false, options.freeTextHints, options.noHintUrls, false, '')).to.eventually.match(/insert into hints.*values \([0-9]*, 3,/i),
      expect(generateSql(challenges, false, options.paidTextHints, options.noHintUrls, false, '')).to.eventually.match(/insert into hints.*values \([0-9]*, 3,/i)
    ])
  })

  it('should INSERT a hint URL for a challenge that has a hint URL defined', function () {
    challenges.c3.hintUrl = 'hintUrl'
    return Promise.all([
      expect(generateSql(challenges, false, options.noTextHints, options.freeHintUrls, false, '')).to.eventually.match(/insert into hints.*values \([0-9]*, 3,/i),
      expect(generateSql(challenges, false, options.noTextHints, options.paidHintUrls, false, '')).to.eventually.match(/insert into hints.*values \([0-9]*, 3,/i)
    ])
  })

  it('should INSERT a text hint and hint URL on the same challenge as two distinct hints', function () {
    challenges.c3.hint = 'hint'
    challenges.c3.hintUrl = 'hintUrl'
    return Promise.all([
      expect(generateSql(challenges, false, options.freeTextHints, options.freeTextHints, false, '')).to.eventually.match(/insert into hints.*values \(.*"hint",.*/i).and.match(/insert into hints.*values \(.*"hintUrl",.*/i),
      expect(generateSql(challenges, false, options.paidTextHints, options.freeHintUrls, false, '')).to.eventually.match(/insert into hints.*values \(.*"hint",.*/i).and.match(/insert into hints.*values \(.*"hintUrl",.*/i),
      expect(generateSql(challenges, false, options.freeHintUrls, options.paidTextHints, false, '')).to.eventually.match(/insert into hints.*values \(.*"hint",.*/i).and.match(/insert into hints.*values \(.*"hintUrl",.*/i),
      expect(generateSql(challenges, false, options.paidTextHints, options.paidTextHints, false, '')).to.eventually.match(/insert into hints.*values \(.*"hint",.*/i).and.match(/insert into hints.*values \(.*"hintUrl",.*/i)
    ])
  })

  it('should not INSERT a text hint when corresponding hint option is not chosen', function () {
    challenges.c1.hint = 'hint'
    challenges.c2.hint = 'hint'
    return expect(generateSql(challenges, false, options.noTextHints, options.noHintUrls, false, '')).to.eventually.not.match(/insert into hints/i)
  })

  it('should not INSERT a hint URL when corresponding hint option is not chosen', function () {
    challenges.c1.hintUrl = 'hintUrl'
    challenges.c2.hintUrl = 'hintUrl'
    return expect(generateSql(challenges, false, options.noTextHints, options.noHintUrls, false, '')).to.eventually.not.match(/insert into hints/i)
  })

  it('should not INSERT a text hint for challenges that do not have a hint defined', function () {
    challenges.c1.hint = 'hint'
    challenges.c2.hint = 'hint'
    challenges.c3.hint = undefined
    challenges.c4.hint = 'hint'
    challenges.c5.hint = 'hint'
    return Promise.all([
      expect(generateSql(challenges, false, options.freeTextHints, options.noHintUrls, false, '')).to.eventually.not.match(/insert into hints.*values \([0-9]*, 3,/i),
      expect(generateSql(challenges, false, options.paidTextHints, options.noHintUrls, false, '')).to.eventually.not.match(/insert into hints.*values \([0-9]*, 3,/i)
    ])
  })

  it('should not INSERT a text hint for challenges that do not have a hint defined', function () {
    challenges.c1.hintUrl = 'hintUrl'
    challenges.c2.hintUrl = 'hintUrl'
    challenges.c3.hintUrl = undefined
    challenges.c4.hintUrl = 'hintUrl'
    challenges.c5.hintUrl = 'hintUrl'
    return Promise.all([
      expect(generateSql(challenges, false, options.noTextHints, options.freeHintUrls, false, '')).to.eventually.not.match(/insert into hints.*values \([0-9]*, 3,/i),
      expect(generateSql(challenges, false, options.noTextHints, options.paidHintUrls, false, '')).to.eventually.not.match(/insert into hints.*values \([0-9]*, 3,/i)
    ])
  })
})
