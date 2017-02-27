'use strict'
var inquirer = require('inquirer')
var colors = require('colors') // eslint-disable-line no-unused-vars
var secretKey = require('./lib/secretKey')
var fetchChallenges = require('./lib/fetchChallenges')
var generateSql = require('./lib/generateSql')
var writeOutput = require('./lib/writeOutput')

var juiceShopCtfCli = function () {
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
      message: 'Secret key <or> URL to ctf.key file?',
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

  console.log()
  console.log('Generate INSERT statements for ' + 'CTFd'.bold + ' with the ' + 'OWASP Juice Shop'.bold + ' challenges')
  inquirer.prompt(questions).then(function (answers) {
    console.log()
    secretKey(answers.ctfKey).then(function (secretKey) {
      fetchChallenges(answers.juiceShopUrl).then(function (challenges) {
        generateSql(challenges, answers.deleteBeforeInsert, answers.selectAfterInsert, secretKey).then(function (sql) {
          writeOutput(sql).then(function (file) {
            console.log('SQL written to ' + file)
            console.log()
            console.log('For a step-by-step guide to apply the INSERT statements to ' + 'CTFd'.bold + ', please refer to')
            console.log('https://github.com/bkimminich/juice-shop-ctf#setting-up-ctfd-and-populating-its-database'.gray)
          }, function (error) {
            console.log(error)
          })
        })
      }, function (error) {
        console.log(error)
      })
    }, function (error) {
      console.log(error)
    })
  })
}

module.exports = juiceShopCtfCli
