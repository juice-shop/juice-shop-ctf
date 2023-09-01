/*
 * Copyright (c) 2016-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const Promise = require('bluebird')
const chai = require('chai')
chai.use(require('chai-as-promised'))
const expect = chai.expect
const rewire = require('rewire')
const writeToCtfdCsv = rewire('../../lib/writeToCtfdCsv')

describe('Output for CTFd', () => {
  xit('should be written to ZIP file', () => {
    writeToCtfdCsv.__set__({
      console: {
        log () {}
      },
      fs: {
        writeFileAsync (path, data) {
          expect(data).to.match(/alembic_version.json/)
          expect(data).to.match(/challenges.json/)
          expect(data).to.match(/hints.json/)
          expect(data).to.match(/flags.json/)
          expect(path).to.match(/OWASP_Juice_Shop\.[0-9]{4}-[0-9]{2}-[0-9]{2}\.CTFd\.zip/)
          return new Promise(resolve => { resolve() })
        }
      }
    })
    return expect(writeToCtfdCsv({ challenges: { results: [] }, flagKeys: { results: [] }, hints: { results: [] } }))
      .to.be.fulfilled
  })

  xit('should log file system error to console', () => {
    writeToCtfdCsv.__set__({
      fs: {
        writeFileAsync (path, data) {
          return new Promise(() => { throw new Error('Argh!') })
        }
      }
    })
    return expect(writeToCtfdCsv({ challenges: { results: [] }, flagKeys: { results: [] }, hints: { results: [] } }))
      .to.be.rejectedWith('Failed to write output to file! Argh!')
  })

  xit('should be written to the desired ZIP file', () => {
    writeToCtfdCsv.__set__({
      console: {
        log () {}
      },
      fs: {
        writeFileAsync (path, data) {
          expect(data).to.match(/alembic_version.json/)
          expect(data).to.match(/challenges.json/)
          expect(data).to.match(/hints.json/)
          expect(data).to.match(/flags.json/)
          expect(path).to.match(/custom\.zip/)
          return new Promise(resolve => { resolve() })
        }
      }
    })
    return expect(writeToCtfdCsv({ challenges: { results: [] }, flagKeys: { results: [] }, hints: { results: [] } }, 'custom.zip'))
      .to.be.fulfilled
  })
})
