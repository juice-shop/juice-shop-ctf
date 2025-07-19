/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, mock, afterEach } from 'node:test'
import assert from 'node:assert'
import writeToFbctfJson from '../../lib/writeToFbctfJson'

const fs = require('fs')
import Bluebird from 'bluebird'
Bluebird.promisifyAll(fs)

const ctfData = { challenges: { results: [] }, flagKeys: { results: [] }, hints: { results: [] } }

describe('Output for FBCTF', () => {
  afterEach(() => {
    mock.reset()
  })

  it('should be written to JSON file', async () => {
    mock.method(fs, 'writeFileAsync', (path: string, data: string) => {
      assert.match(path, /OWASP_Juice_Shop\.[0-9]{4}-[0-9]{2}-[0-9]{2}\.FBCTF\.json/)
      return Promise.resolve() 
    })

    await assert.doesNotReject(() => writeToFbctfJson(ctfData))
  })

  it('should log file system error to console', async () => {
    mock.method(fs, 'writeFileAsync', () => {
      return Promise.reject(new Error('Argh!'))
    })

    await assert.rejects(
      () => writeToFbctfJson(ctfData),
      /Failed to write output to file! Argh!/
    )
  })

  it('should be written to the desired JSON file', async () => {
    mock.method(fs, 'writeFileAsync', (path: string, data: string) => {
      assert.strictEqual(path, 'custom.json')
      return Promise.resolve()
    })

    await assert.doesNotReject(() => writeToFbctfJson(ctfData, 'custom.json'))
  })
})