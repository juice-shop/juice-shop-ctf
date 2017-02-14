'use strict'
var inquirer = require('inquirer')

console.log('Generate INSERT statements for CTFd with the OWASP Juice Shop challenges')
console.log('------------------------------------------------------------------------')

var questions = [
  {
    type: 'input',
    name: 'juiceShopUrl',
    message: 'Juice Shop URL to retrieve challenges?',
    default: 'https://juice-shop.herokuapp.com'
  },
  {
    type: 'input',
    name: 'keyFileLocation',
    message: 'Path or URL to ctf.key file?',
    default: 'https://raw.githubusercontent.com/bkimminich/juice-shop/master/ctf.key'
  },
  {
    type: 'confirm',
    name: 'deleteBeforeInsert',
    message: 'DELETE all CTFd Challenges before INSERT?',
    default: true
  },
  {
    type: 'confirm',
    name: 'selectAfterInsert',
    message: 'SELECT all CTFd Challenges after INSERT?',
    default: true
  },
  {
    type: 'list',
    name: 'outputDestination',
    message: 'Print INSERT statements to console or file?',
    choices: ['Console', 'File (ctfd-inserts.sql)']
  }
]

inquirer.prompt(questions).then(function (answers) {
  var sql = 'INSERT ...\nINSERT ...\nINSERT ...' // TODO Generate SQL statements as simple \n separated String
  console.log('SQL statements are generated...................Done!') // TODO Log actual progress of statement creation
  console.log('------------------------------------------------------------------------')
  if (answers.outputDestination === 'Console') {
    console.log(sql)
  } else {
    console.log('Output file created: c:\\github\\juice-shop-ctf\\ctfd-inserts.sql') // TODO Create file with 'sql' as content and log its path
  }
  console.log('------------------------------------------------------------------------')
  console.log('For a step-by-step guide to apply the INSERT statements to CTFd, please refer to:')
  console.log('https://github.com/bkimminich/juice-shop-ctf/blob/master/CTFd/GenerateCTFdInserts.html#L80') // TODO Refer to Markdown doc on GitHub instead
})
