'use strict'
var Promise = require('bluebird')
var calculateScore = require('./calculateScore')
var hmac = require('./hmac')

function generateSql (challenges, prependDelete, appendSelect, hmacKey) {
  return new Promise(function (resolve, reject) {
    try {
      var sql = ''
      if (prependDelete) {
        sql = sql + 'DELETE FROM challenges;\n\r'
      }
      for (var key in challenges) {
        if (challenges.hasOwnProperty(key)) {
          var challenge = challenges[key]
          sql = sql + 'INSERT INTO challenges (id, name, description, value, category, hidden, type, max_attempts) VALUES ('
          sql = sql + '' + challenge.id + ', '
          sql = sql + '"' + challenge.name + '", '
          sql = sql + '"' + challenge.description.replace(/"/g, '""') + ' (Difficulty Level: ' + challenge.difficulty + ')", '
          sql = sql + '"' + calculateScore(challenge.difficulty) + '", '
          sql = sql + '"' + challenge.category + '", '
          sql = sql + '0, 0, 0);\n'
          sql = sql + 'INSERT INTO keys (id, chal, flag, key_type) VALUES ('
          sql = sql + '' + challenge.id + ', '
          sql = sql + '' + challenge.id + ', '
          sql = sql + '"' + hmac(challenge.name, hmacKey) + '", '
          sql = sql + '0);\n\r'
        }
      }
      if (appendSelect) {
        sql = sql + 'SELECT * FROM challenges;\n\r'
      }
      resolve(sql)
    } catch (error) {
      reject('Failed to generate SQL statements! ' + error)
    }
  })
}

module.exports = generateSql
