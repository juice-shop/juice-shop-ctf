/*
 * Copyright (c) 2016-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const Promise = require('bluebird')
const chai = require('chai')
chai.use(require('chai-as-promised'))
const expect = chai.expect
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
        writeFileAsync (path, data) {
          expect(path).to.match(/OWASP_Juice_Shop\.[0-9]{4}-[0-9]{2}-[0-9]{2}\.RTB\.xml/)
          return new Promise(resolve => { resolve() })
        }
      }
    })
    return expect(writeToRtbXml(xmlExample))
      .to.be.fulfilled
  })

  it('should log file system error to console', () => {
    writeToRtbXml.__set__({
      fs: {
        writeFileAsync (path, data) {
          return new Promise(() => { throw new Error('Argh!') })
        }
      }
    })
    return expect(writeToRtbXml(xmlExample))
      .to.be.rejectedWith('Failed to write output to file! Argh!')
  })

  it('should be written to the desired XML file', () => {
    writeToRtbXml.__set__({
      console: {
        log () {}
      },
      fs: {
        writeFileAsync (path, data) {
          expect(path).to.match(/custom\.xml/)
          return new Promise(resolve => { resolve() })
        }
      }
    })
    return expect(writeToRtbXml(xmlExample, 'custom.xml'))
      .to.be.fulfilled
  })
})
