'use strict'
var Promise = require('bluebird')
var request = require('request-promise')

function fetchChallenges (juiceShopUrl) {
  return new Promise(function (resolve, reject) {
    request({ url: juiceShopUrl + '/api/Challenges', json: true }).then(function (body) {
      resolve(body.data)
    }).catch(function (error) {
      reject('Failed to fetch challenges from API! ' + error)
    })
  })
}

module.exports = fetchChallenges
