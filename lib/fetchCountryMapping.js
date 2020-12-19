/*
 * Copyright (c) 2016-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const Promise = require('bluebird')
const request = require('request-promise')
const yaml = Promise.promisifyAll(require('js-yaml'))

function fetchChallenges (challengeMapFile) {
  if (!challengeMapFile) {
    return Promise.resolve()
  }
  return request({ url: challengeMapFile })
    .then((data) => yaml.safeLoadAll(data))
    .then((data) => data[0].ctf.countryMapping)
    .catch(({ message }) => {
      throw new Error('Failed to fetch country mapping from API! ' + message)
    })
}

module.exports = fetchChallenges
