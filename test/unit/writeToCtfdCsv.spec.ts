/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { test ,describe} from 'node:test'
import  assert  from 'node:assert'
const rewire = require('rewire')

const writeToCtfdCsv = rewire('../../lib/writeToCtfdCsv.js')

describe('Output for CTFd', () => { // TODO Amend test cases for new CSV data export
  test.skip('should be written to ZIP file', async () => {
    writeToCtfdCsv.__set__({
      console: {
        log () {}
      },
      fs: {
        writeFileAsync (path : string, data: string) {
          assert.match(data, /alembic_version.json/)
          assert.match(data, /challenges.json/)
          assert.match(data, /hints.json/)
          assert.match(data, /flags.json/)
          assert.match(path, /OWASP_Juice_Shop\.[0-9]{4}-[0-9]{2}-[0-9]{2}\.CTFd\.zip/)
          return Promise.resolve()
        }
      }
    })
    await assert.doesNotReject(writeToCtfdCsv({ challenges: { results: [] }, flagKeys: { results: [] }, hints: { results: [] } }))
  })

  test.skip('should log file system error to console', () => {
    writeToCtfdCsv.__set__({
      fs: {
        writeFileAsync (path: string, data: string) {
          return new Promise(() => { throw new Error('Argh!') })
        }
      }
    })
    return assert.rejects(writeToCtfdCsv({ challenges: { results: [] }, flagKeys: { results: [] }, hints: { results: [] } }))
      .then(() => { throw new Error('Failed to write output to file! Argh!') })
  })

  test.skip('should be written to the desired ZIP file', () => {
    writeToCtfdCsv.__set__({
      console: {
        log () {}
      },
      fs: {
        writeFileAsync (path: string, data: string) {
          assert.match(data, /alembic_version.json/)
          assert.match(data, /challenges.json/)
          assert.match(data, /hints.json/)
          assert.match(data, /flags.json/)
          assert.match(path, /custom\.zip/)
          return Promise.resolve()
        }
      }
    })
    return assert.doesNotReject(writeToCtfdCsv({ challenges: { results: [] }, flagKeys: { results: [] }, hints: { results: [] } }, 'custom.zip'))
  })
})
