/*
 * Copyright (c) 2016-2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const Promise = require('bluebird')
const request = require('request-promise')

function fetchCodeSnippets (juiceShopUrl, skip = false) {
  if (skip) {
    return Promise.resolve({})
  }
  return new Promise((resolve, reject) => {
    request({ url: juiceShopUrl + '/snippets', json: true }).then(({ challenges }) => {
      const snippets = {}
      if (challenges) {
        for (let i = 0; i < challenges.length; i++) {
          request({ url: juiceShopUrl + '/snippets/' + challenges[i], json: true }).then(({ snippet }) => {
            snippets[challenges[i]] = snippet
          }).catch(({ message }) => {
            reject(new Error('Failed to fetch snippet from API! ' + message))
          })
        }
      }
      resolve(snippets)
    }).catch(({ message }) => {
      resolve({}) // TODO Reject in case of error with next major release
      // reject(new Error('Failed to fetch snippet challenges from API! ' + message))
    })
  })
}

module.exports = fetchCodeSnippets
