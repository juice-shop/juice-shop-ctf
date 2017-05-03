'use strict'
var Promise = require('bluebird')
var calculateScore = require('./calculateScore')
var hmac = require('./hmac')

function generateSql (challenges, prependDelete, insertHints, insertHintUrls, appendSelect, hmacKey) {
  return new Promise(function (resolve, reject) {
    console.log(insertHints)
    console.log(insertHintUrls)
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
          var score = calculateScore(challenge.difficulty)
          sql = sql + 'INSERT INTO challenges (id, name, description, value, category, hidden, type, max_attempts) VALUES ('
          sql = sql + '' + challenge.id + ', '
          sql = sql + '"' + challenge.name + '", '
          sql = sql + '"' + challenge.description.replace(/"/g, '""') + ' (Difficulty Level: ' + challenge.difficulty + ')", '
          sql = sql + '"' + score + '", '
          sql = sql + '"' + challenge.category + '", '
          sql = sql + '0, 0, 0);\n'
          sql = sql + 'INSERT INTO keys (id, chal, flag, key_type) VALUES ('
          sql = sql + '' + challenge.id + ', '
          sql = sql + '' + challenge.id + ', '
          sql = sql + '"' + hmac(challenge.name, hmacKey) + '", '
          sql = sql + '0);\n'
          if (challenge.hint && insertHints !== 'No text hints') {
            sql = sql + 'INSERT INTO hints (id, chal, hint, cost, type) VALUES ('
            sql = sql + '' + challenge.id + ', '
            sql = sql + '' + challenge.id + ', '
            sql = sql + '"' + challenge.hint.replace(/"/g, '""') + '", '
            sql = sql + '' + (insertHints === 'Paid text hints' ? score / 10 : 0) + ', '
            sql = sql + '0);\n'
          }
          if (challenge.hintUrl && insertHintUrls !== 'No hint URLs') {
            sql = sql + 'INSERT INTO hints (id, chal, hint, cost, type) VALUES ('
            sql = sql + '' + (10000 + challenge.id) + ', '
            sql = sql + '' + challenge.id + ', '
            sql = sql + '"' + challenge.hintUrl + '", '
            sql = sql + '' + (insertHintUrls === 'Paid hint URLs' ? score / 5 : 0) + ', '
            sql = sql + '0);\n'
          }
          sql = sql + '\r'
        }
      }
      if (appendSelect) {
        sql = sql + 'SELECT challenges.id, name, description, value, category, flag FROM challenges LEFT JOIN keys ON challenges.id = keys.chal;\n\r'
      }
      resolve(sql)
    } catch (error) {
      reject('Failed to generate SQL statements! ' + error)
    }
  })
}

module.exports = generateSql
