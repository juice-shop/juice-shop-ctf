/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, mock, afterEach } from 'node:test'
import assert from 'node:assert'
import writeToRtbXml from '../../lib/writeToRtbXml'

const fs = require('fs')
import Bluebird from 'bluebird'
Bluebird.promisifyAll(fs)

const xmlExample = '<?xml version="1.0" encoding="UTF-8"?><rootthebox api="1"></rootthebox></xml>'

describe('Output for RTB', () => {
  afterEach(() => {
    mock.reset()
  })

  it('should log file system error to console', async () => {
    mock.method(fs, 'writeFileAsync', () => {
      return Promise.reject(new Error('Argh!'))
    })

    await assert.rejects(
      () => writeToRtbXml(xmlExample),
      /Failed to write output to file! Argh!/
    )
  })

  it('should be written to XML file', async () => {
    mock.method(fs, 'writeFileAsync', (path: string, data: string) => {
      assert.match(path, /OWASP_Juice_Shop\.[0-9]{4}-[0-9]{2}-[0-9]{2}\.RTB\.xml/)
      return Promise.resolve()
    })

    await assert.doesNotReject(() => writeToRtbXml(xmlExample))
  })

  it('should be written to the desired XML file', async () => {
    mock.method(fs, 'writeFileAsync', (path: string, data: string) => {
      assert.strictEqual(path, 'custom.xml')
      return Promise.resolve()
    })

    await assert.doesNotReject(() => writeToRtbXml(xmlExample, 'custom.xml'))
  })
})