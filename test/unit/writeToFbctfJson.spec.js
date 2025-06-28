/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const assert = require('node:assert')
const{describe, it} = require('node:test')
const rewire = require('rewire')
const writeToFbctfJson = rewire('../../lib/writeToFbctfJson')

describe('Output for FBCTF', () => {
  it('should be written to JSON file', () => {
    writeToFbctfJson.__set__({
      console: {
        log () {}
      },
      fs: {
        writeFileAsync (path, data) {
          assert.match((path),(/OWASP_Juice_Shop\.[0-9]{4}-[0-9]{2}-[0-9]{2}\.FBCTF\.json/))
          return Promise.resolve()
        }
      }
    })
    return assert.doesNotReject(() => writeToFbctfJson({ challenges: { results: [] }, flagKeys: { results: [] }, hints: { results: [] } }))
  })

  it('should log file system error to console', () => {
    writeToFbctfJson.__set__({
      fs: {
        writeFileAsync (path, data) {
          return new Promise(() => { throw new Error('Argh!') })
        }
      }
    })
   return assert.rejects(() => writeToFbctfJson({ challenges: { results: [] }, flagKeys: { results: [] }, hints: { results: [] } }), /Failed to write output to file! Argh!/)
  })

  it('should be written to the desired JSON file', () => {
    writeToFbctfJson.__set__({
      console: {
        log () {}
      },
      fs: {
        writeFileAsync (path, data) {
          assert.match(path, /custom\.json/)
          return Promise.resolve()
        }
      }
    })
    return assert.doesNotReject(() => writeToFbctfJson({ challenges: { results: [] }, flagKeys: { results: [] }, hints: { results: [] } }, 'custom.json'))
  })
})
