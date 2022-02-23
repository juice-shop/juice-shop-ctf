/*
 * Copyright (c) 2016-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const Promise = require('bluebird')
const request = require('request-promise')
const yaml = Promise.promisifyAll(require('js-yaml'))

function fetchChallenges (challengeMapFile, ignoreSslWarnings) {
  if (!challengeMapFile) {
    return Promise.resolve()
  }
  return request({ url: challengeMapFile, strictSSL: !ignoreSslWarnings })
    .then((data) => yaml.safeLoadAll(data))
    .then((data) => data[0].ctf.countryMapping)
    .catch(({ message }) => {
      throw new Error('Failed to fetch country mapping from API! ' + message)
    })
}

module.exports = fetchChallenges
