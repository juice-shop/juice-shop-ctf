'use strict'
var inquirer = require('inquirer')
var request = require('request-promise')
var jsSHA = require('jssha')
var ProgressBar = require('progress')
var fs = require('fs')
var path = require('path')
var colors = require('colors') // eslint-disable-line no-unused-vars

console.log()
console.log('Generate INSERT statements for ' + 'CTFd'.bold + ' with the ' + 'OWASP Juice Shop'.bold + ' challenges')

var questions = [
  {
    type: 'input',
    name: 'juiceShopUrl',
    message: 'Juice Shop URL to retrieve challenges?',
    default: 'https://juice-shop.herokuapp.com'
  },
  {
    type: 'input',
    name: 'ctfKey',
    message: 'HMAC key <or> URL to ctf.key file?',
    default: 'https://raw.githubusercontent.com/bkimminich/juice-shop/master/ctf.key'
  },
  {
    type: 'confirm',
    name: 'deleteBeforeInsert',
    message: 'DELETE all CTFd Challenges before INSERT statements?',
    default: true
  },
  {
    type: 'confirm',
    name: 'selectAfterInsert',
    message: 'SELECT all CTFd Challenges after INSERT statements?',
    default: true
  }
]

inquirer.prompt(questions).then(function (answers) {
  console.log()
  if (answers.ctfKey && answers.ctfKey.match(/.*:\/\//)) {
    request(answers.ctfKey)
      .then(function (body) {
        answers.ctfKey = body
        generateSql(answers)
      }).catch(function (error) {
        console.log('Failed'.red + ' to fetch HMAC key from URL! ' + error)
      })
  } else {
    generateSql(answers)
  }
})

function generateSql (answers) {
  request({ url: answers.juiceShopUrl + '/api/Challenges', json: true })
    .then(function (json) {
      var sql = ''
      if (answers.deleteBeforeInsert) {
        sql = sql + 'DELETE FROM challenges;\n\r'
      }
      /* This is a default multiplier whereby the score will be = (difficulty x multiplier)
       i.e. using these multipliers will create challenges with the following scores:
       *     =  100
       **    =  250
       ***   =  450
       ****  =  700
       ***** = 1000
       I think it is fair to assume that completing a 5* task will be 10 times harder than a 1* task.
       */
      var multiplier = [ 100, 125, 150, 175, 200 ]
      var challenges = json.data
      var bar = new ProgressBar('Generating INSERT statements [:bar] :percent', { total: Object.keys(challenges).length })
      for (var key in challenges) {
        bar.tick()
        if (challenges.hasOwnProperty(key)) {
          var challenge = challenges[key]
          sql = sql + 'INSERT INTO challenges (id, name, description, value, category, flags, hidden) VALUES ('
          sql = sql + '' + challenge.id + ', '
          sql = sql + '"' + challenge.name + '", '
          sql = sql + '"' + challenge.description.replace(/"/g, '""') + ' (Difficulty Level: ' + challenge.difficulty + ')", '
          sql = sql + '"' + challenge.difficulty * multiplier[ challenge.difficulty - 1 ] + '", '
          sql = sql + '"' + challenge.category + '", '
          sql = sql + '"[{""flag"": ""' + toHmac(challenge.name, answers.ctfKey) + '"", ""type"": 0}]", '
          sql = sql + '0);\n\r'
        }
      }
      if (answers.selectAfterInsert) {
        sql = sql + 'SELECT * FROM challenges;\n\r'
      }
      fs.writeFile('insert-ctfd-challenges.sql', sql, function (error) {
        if (error) {
          return console.log('Failed'.red + ' to write output to file! ' + error)
        }
        console.log('SQL written to ' + path.resolve('insert-ctfd-challenges.sql').green)
        console.log()
        console.log('For a step-by-step guide to apply the INSERT statements to ' + 'CTFd'.bold + ', please refer to')
        console.log('https://github.com/bkimminich/juice-shop-ctf/blob/master/CTFd/GenerateCTFdInserts.html#L80'.gray) // TODO Refer to Markdown doc on GitHub instead
      })
    }).catch(function (error) {
      console.log('Failed'.red + ' to fetch challenges from API! ' + error)
    })
}

function toHmac (text, theSecretKey) {
  var shaObj = new jsSHA('SHA-1', 'TEXT') // eslint-disable-line new-cap
  shaObj.setHMACKey(theSecretKey, 'TEXT')
  shaObj.update(text)
  return shaObj.getHMAC('HEX')
}

