/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, mock, afterEach } from 'node:test'
import assert from 'node:assert'
import writeToRtbXml from '../../lib/writeToRtbXml'
import { mockWriteFile, WriteFileCallback, getFileNamePattern } from './utils/mockFileSystem'

const xmlExample = '<?xml version="1.0" encoding="UTF-8"?><rootthebox api="1"></rootthebox></xml>'

describe('Output for RTB', () => {
  afterEach(() => {
    mock.reset()
  })

  it('should log file system error to console', async () => {
    mockWriteFile((filePath, data, options, callback) => {
      if (typeof options === 'function') {
        callback = options as WriteFileCallback
        options = undefined
      }
      if (callback) callback(new Error('Argh!'))
    })

    await assert.rejects(
      () => writeToRtbXml(xmlExample),
      /Failed to write output to file! Argh!/
    )
  })

  it('should be written to XML file', async () => {
    mockWriteFile((filePath, data, options, callback) => {
      if (typeof options === 'function') {
        callback = options as WriteFileCallback
        options = undefined
      }
      assert.match(filePath, getFileNamePattern('RTB\\.xml'))
      if (callback) callback(null)
    })

    await assert.doesNotReject(() => writeToRtbXml(xmlExample))
  })

  it('should be written to the desired XML file', async () => {
    mockWriteFile((filePath, data, options, callback) => {
      if (typeof options === 'function') {
        callback = options as WriteFileCallback
        options = undefined
      }
      assert.strictEqual(filePath, 'custom.xml')
      if (callback) callback(null)
    })

    await assert.doesNotReject(() => writeToRtbXml(xmlExample, 'custom.xml'))
  })
})