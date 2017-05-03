var Promise = require('bluebird')
var chai = require('chai')
chai.use(require('chai-as-promised'))
var expect = chai.expect
var generateSql = require('../../lib/generateSql')

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
    return expect(generateSql(challenges, true, 'No text hint', 'No hint URLs', false, '')).to.eventually.match(/^delete from challenges;/i)
  })

  it('should not have DELETE statement prepended when option is not chosen', function () {
    return expect(generateSql(challenges, false, 'No text hint', 'No hint URLs', false, '')).to.eventually.not.match(/^delete from challenges;/i)
  })

  it('should have SELECT statement appended when option is chosen', function () {
    return expect(generateSql(challenges, false, 'No text hint', 'No hint URLs', true, '')).to.eventually.match(/select .* from challenges .* join keys .*;\s*$/i)
  })

  it('should not have SELECT statement appended when option not is chosen', function () {
    return expect(generateSql(challenges, false, 'No text hint', 'No hint URLs', false, '')).to.eventually.not.match(/select .*;\s*$/i)
  })

  it('should consist of one INSERT statement into "challenges" per challenge', function () {
    return Promise.all([
      expect(generateSql(challenges, false, 'No text hint', 'No hint URLs', false, '')).to.eventually.match(/insert into challenges.*values \(1.*;/i),
      expect(generateSql(challenges, false, 'No text hint', 'No hint URLs', false, '')).to.eventually.match(/insert into challenges.*values \(2.*;/i),
      expect(generateSql(challenges, false, 'No text hint', 'No hint URLs', false, '')).to.eventually.match(/insert into challenges.*values \(3.*;/i),
      expect(generateSql(challenges, false, 'No text hint', 'No hint URLs', false, '')).to.eventually.match(/insert into challenges.*values \(4.*;/i),
      expect(generateSql(challenges, false, 'No text hint', 'No hint URLs', false, '')).to.eventually.match(/insert into challenges.*values \(5.*;/i)
    ])
  })

  it('should consist of one INSERT statement into "keys" per challenge', function () {
    return Promise.all([
      expect(generateSql(challenges, false, 'No text hint', 'No hint URLs', false, '')).to.eventually.match(/insert into keys.*values \(1, 1.*;/i),
      expect(generateSql(challenges, false, 'No text hint', 'No hint URLs', false, '')).to.eventually.match(/insert into keys.*values \(2, 2.*;/i),
      expect(generateSql(challenges, false, 'No text hint', 'No hint URLs', false, '')).to.eventually.match(/insert into keys.*values \(3, 3.*;/i),
      expect(generateSql(challenges, false, 'No text hint', 'No hint URLs', false, '')).to.eventually.match(/insert into keys.*values \(4, 4.*;/i),
      expect(generateSql(challenges, false, 'No text hint', 'No hint URLs', false, '')).to.eventually.match(/insert into keys.*values \(5, 5.*;/i)
    ])
  })

  it('should be empty when given no challenges', function () {
    return expect(generateSql({}, false, 'No text hint', 'No hint URLs', false, '')).to.eventually.equal('')
  })

  it('should log generator error to console', function () {
    return expect(generateSql({c1: undefined}, false, 'No text hint', 'No hint URLs', false, '')).to.be.rejectedWith('Failed to generate SQL statements! TypeError')
  })
})
