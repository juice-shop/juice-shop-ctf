'use strict'
var inquirer = require('inquirer')
var colors = require('colors') // eslint-disable-line no-unused-vars
var secretKey = require('./lib/secretKey')
var fetchChallenges = require('./lib/fetchChallenges')
var generateData = require('./lib/generateData')
var writeToZipFile = require('./lib/writeToZipFile')
var options = require('./lib/options')

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
      type: 'list',
      name: 'insertHints',
      message: 'Insert a text hint along with each CTFd Challenge?',
      choices: [options.noTextHints, options.freeTextHints, options.paidTextHints],
      default: 0
    },
    {
      type: 'list',
      name: 'insertHintUrls',
      message: 'Insert a hint URL along with each CTFd Challenge?',
      choices: [options.noHintUrls, options.freeHintUrls, options.paidHintUrls],
      default: 0
    }
  ]

  console.log()
  console.log('Generate ZIP-archive to import into ' + 'CTFd'.bold + ' (>=1.0.2) with the ' + 'OWASP Juice Shop'.bold + ' challenges')
  inquirer.prompt(questions).then(function (answers) {
    console.log()
    secretKey(answers.ctfKey).then(function (secretKey) {
      fetchChallenges(answers.juiceShopUrl).then(function (challenges) {
        generateData(challenges, answers.insertHints, answers.insertHintUrls, secretKey).then(function (data) {
          writeToZipFile(data).then(function (file) {
            console.log('ZIP-archive written to ' + file)
            console.log()
            console.log('For a step-by-step guide to import the ZIP-archive into ' + 'CTFd'.bold + ', please refer to')
            console.log('https://bkimminich.gitbooks.io/pwning-owasp-juice-shop/content/part1/ctf.html#running-ctfd'.bold)
          }, function (error) {
            console.log(error.message.red)
          })
        }, function (error) {
          console.log(error.message.red)
        })
      }, function (error) {
        console.log(error.message.red)
      })
    }, function (error) {
      console.log(error.message.red)
    })
  })
}

module.exports = juiceShopCtfCli
