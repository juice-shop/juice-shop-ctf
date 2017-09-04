'use strict'
var Promise = require('bluebird')
var calculateScore = require('./calculateScore')
var calculateHintCost = require('./calculateHintCost')
var hmacSha1 = require('./hmac')
var options = require('./options')

function generateSql (challenges, prependDelete, insertHints, insertHintUrls, appendSelect, ctfKey) {
  function insertChallenge (challenge) {
    var score = calculateScore(challenge.difficulty)
    var sql = 'INSERT INTO challenges (id, name, description, value, category, hidden, type, max_attempts) VALUES ('
    sql = sql + '' + challenge.id + ', '
    sql = sql + '"' + challenge.name + '", '
    sql = sql + '"' + challenge.description.replace(/"/g, '""') + ' (Difficulty Level: ' + challenge.difficulty + ')", '
    sql = sql + '"' + score + '", '
    sql = sql + '"' + challenge.category + '", '
    sql = sql + '0, 0, 0);\n'
    return sql
  }

  function insertKey (challenge) {
    var sql = 'INSERT INTO keys (id, chal, flag, key_type) VALUES ('
    sql = sql + '' + challenge.id + ', '
    sql = sql + '' + challenge.id + ', '
    sql = sql + '"' + hmacSha1(ctfKey, challenge.name) + '", '
    sql = sql + '0);\n'
    return sql
  }

  function insertTextHint (challenge) {
    var sql = 'INSERT INTO hints (id, chal, hint, cost, type) VALUES ('
    sql = sql + '' + challenge.id + ', '
    sql = sql + '' + challenge.id + ', '
    sql = sql + '"' + challenge.hint.replace(/"/g, '""') + '", '
    sql = sql + '' + calculateHintCost(challenge, insertHints) + ', '
    sql = sql + '0);\n'
    return sql
  }

  function insertHintUrl (challenge) {
    var sql = 'INSERT INTO hints (id, chal, hint, cost, type) VALUES ('
    sql = sql + '' + (10000 + challenge.id) + ', '
    sql = sql + '' + challenge.id + ', '
    sql = sql + '"' + challenge.hintUrl + '", '
    sql = sql + '' + calculateHintCost(challenge, insertHintUrls) + ', '
    sql = sql + '0);\n'
    return sql
  }

  return new Promise(function (resolve, reject) {
    try {
      var sql = ''
      if (prependDelete) {
        sql = sql + 'DELETE FROM challenges;\n'
        sql = sql + 'DELETE FROM keys;\n\r'
        sql = sql + 'DELETE FROM hints;\n\r'
      }
      for (var key in challenges) {
        if (challenges.hasOwnProperty(key)) {
          var challenge = challenges[key]
          sql = sql + insertChallenge(challenge)
          sql = sql + insertKey(challenge)
          if (challenge.hint && insertHints !== options.noTextHints) {
            sql = sql + insertTextHint(challenge)
          }
          if (challenge.hintUrl && insertHintUrls !== options.noHintUrls) {
            sql = sql + insertHintUrl(challenge)
          }
          sql = sql + '\r'
        }
      }
      if (appendSelect) {
        sql = sql + 'SELECT challenges.id, name, description, value, category, flag FROM challenges LEFT JOIN keys ON challenges.id = keys.chal;\n\r'
      }
      resolve(sql)
    } catch (error) {
      reject(new Error('Failed to generate SQL statements! ' + error.message))
    }
  })
}

module.exports = generateSql
