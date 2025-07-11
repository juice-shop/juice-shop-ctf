/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const { describe, it } = require('node:test')
const assert = require('node:assert')
const rewire = require('rewire')
const writeToRtbXml = rewire('../../lib/writeToRtbXml')

const xmlExample = '<?xml version="1.0" encoding="UTF-8"?><rootthebox api="1"></rootthebox></xml>'

describe('Output for RTB', () => {
  it('should be written to XML file', () => {
    writeToRtbXml.__set__({
      console: {
        log () {}
      },
      fs: {
        writeFileAsync (path:string, data:string) {
          assert.match((path), (/OWASP_Juice_Shop\.[0-9]{4}-[0-9]{2}-[0-9]{2}\.RTB\.xml/))
          return Promise.resolve()
        }
      }
    })
    return assert.doesNotReject(() => writeToRtbXml(xmlExample))
  })

  it('should log file system error to console', () => {
    writeToRtbXml.__set__({
      fs: {
        writeFileAsync (path:string, data:string) {
          return new Promise(() => { throw new Error('Argh!') })
        }
      }
    })
    return assert.rejects(() => writeToRtbXml(xmlExample), /Failed to write output to file! Argh!/)
  })

  it('should be written to the desired XML file', () => {
    writeToRtbXml.__set__({
      console: {
        log () {}
      },
      fs: {
        writeFileAsync (path:string, data:string) {
          assert.match(path, /custom\.xml/)
          return Promise.resolve()
        }
      }
    })
    return assert.doesNotReject(() => writeToRtbXml(xmlExample, 'custom.xml'))
  })
})
