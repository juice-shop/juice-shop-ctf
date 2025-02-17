/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const Promise = require('bluebird')
const chai = require('chai')
chai.use(require('chai-as-promised'))
const expect = chai.expect
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
          expect(path).to.match(/OWASP_Juice_Shop\.[0-9]{4}-[0-9]{2}-[0-9]{2}\.FBCTF\.json/)
          return new Promise(resolve => { resolve() })
        }
      }
    })
    return expect(writeToFbctfJson({ challenges: { results: [] }, flagKeys: { results: [] }, hints: { results: [] } }))
      .to.be.fulfilled
  })

  it('should log file system error to console', () => {
    writeToFbctfJson.__set__({
      fs: {
        writeFileAsync (path, data) {
          return new Promise(() => { throw new Error('Argh!') })
        }
      }
    })
    return expect(writeToFbctfJson({ challenges: { results: [] }, flagKeys: { results: [] }, hints: { results: [] } }))
      .to.be.rejectedWith('Failed to write output to file! Argh!')
  })

  it('should be written to the desired JSON file', () => {
    writeToFbctfJson.__set__({
      console: {
        log () {}
      },
      fs: {
        writeFileAsync (path, data) {
          expect(path).to.match(/custom\.json/)
          return new Promise(resolve => { resolve() })
        }
      }
    })
    return expect(writeToFbctfJson({ challenges: { results: [] }, flagKeys: { results: [] }, hints: { results: [] } }, 'custom.json'))
      .to.be.fulfilled
  })
})
