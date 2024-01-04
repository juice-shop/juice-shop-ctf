/*
 * Copyright (c) 2016-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const Promise = require('bluebird')
const request = require('request-promise')

function fetchChallenges (juiceShopUrl, ignoreSslWarnings) {
  return new Promise((resolve, reject) => {
    request({ url: juiceShopUrl + '/api/Challenges', json: true, strictSSL: !ignoreSslWarnings }).then(({ data }) => {
      resolve(data)
    }).catch(({ message }) => {
      reject(new Error('Failed to fetch challenges from API! ' + message))
    })
  })
}

module.exports = fetchChallenges
