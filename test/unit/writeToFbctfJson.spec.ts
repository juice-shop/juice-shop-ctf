/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it, mock, afterEach } from 'node:test'
import assert from 'node:assert'
import writeToFbctfJson from '../../lib/writeToFbctfJson'
import { mockWriteFile, WriteFileCallback, getFileNamePattern } from './utils/mockFileSystem'

const ctfData = { challenges: { results: [] }, flagKeys: { results: [] }, hints: { results: [] } }

describe('Output for FBCTF', () => {
  afterEach(() => {
    mock.reset()
  })

  it('should be written to JSON file', async () => {
    mockWriteFile(async (filePath, data, options) => {
      assert.match(filePath, getFileNamePattern('FBCTF\\.json'))
    })

    await assert.doesNotReject(() => writeToFbctfJson(ctfData))
  })

  it('should log file system error to console', async () => {
    mockWriteFile(async (filePath, data, options, callback) => {
      throw new Error('Argh!')
    })

    await assert.rejects(
      () => writeToFbctfJson(ctfData),
      /Failed to write output to file! Argh!/
    )
  })

  it('should be written to the desired JSON file', async () => {
    mockWriteFile(async (filePath, data, options) => {
      assert.strictEqual(filePath, 'custom.json')
    })

    await assert.doesNotReject(() => writeToFbctfJson(ctfData, 'custom.json'))
  })
})
