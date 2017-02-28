'use strict'
var Promise = require('bluebird')
var ProgressBar = require('progress')
var calculateScore = require('./calculateScore')
var hmac = require('./hmac')

function generateSql (challenges, prependDelete, appendSelect, hmacKey, progressBar) {
  return new Promise(function (resolve, reject) {
    try {
      var sql = ''
      if (prependDelete) {
        sql = sql + 'DELETE FROM challenges;\n\r'
      }
      var bar = progressBar || new ProgressBar('Generating INSERT statements [:bar] :percent', { total: Object.keys(challenges).length })
      for (var key in challenges) {
        bar.tick()
        if (challenges.hasOwnProperty(key)) {
          var challenge = challenges[key]
          sql = sql + 'INSERT INTO challenges (id, name, description, value, category, flags, hidden) VALUES ('
          sql = sql + '' + challenge.id + ', '
          sql = sql + '"' + challenge.name + '", '
          sql = sql + '"' + challenge.description.replace(/"/g, '""') + ' (Difficulty Level: ' + challenge.difficulty + ')", '
          sql = sql + '"' + calculateScore(challenge.difficulty) + '", '
          sql = sql + '"' + challenge.category + '", '
          sql = sql + '"[{""flag"": ""' + hmac(challenge.name, hmacKey) + '"", ""type"": 0}]", '
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
