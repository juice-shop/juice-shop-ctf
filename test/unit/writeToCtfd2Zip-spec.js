const Promise = require('bluebird')
const chai = require('chai')
chai.use(require('chai-as-promised'))
const expect = chai.expect
const rewire = require('rewire')
const writeToCtfd2Zip = rewire('../../lib/writeToCtfd2Zip')

describe('Output for CTFd 2.x', () => {
  it('should be written to ZIP file', () => {
    writeToCtfd2Zip.__set__({
      console: {
        log () {}
      },
      fs: {
        writeFileAsync (path, data) {
          expect(data).to.match(/alembic_version.json/)
          expect(data).to.match(/challenges.json/)
          expect(data).to.match(/hints.json/)
          expect(data).to.match(/flags.json/)
          expect(path).to.match(/OWASP_Juice_Shop\.[0-9]{4}-[0-9]{2}-[0-9]{2}\.CTFd2\.zip/)
          return new Promise(resolve => { resolve() })
        }
      }
    })
    return expect(writeToCtfd2Zip({ challenges: { results: [] }, flagKeys: { results: [] }, hints: { results: [] } }))
      .to.be.fulfilled
  })

  it('should log file system error to console', () => {
    writeToCtfd2Zip.__set__({
      fs: {
        writeFileAsync (path, data) {
          return new Promise(() => { throw new Error('Argh!') })
        }
      }
    })
    return expect(writeToCtfd2Zip({ challenges: { results: [] }, flagKeys: { results: [] }, hints: { results: [] } }))
      .to.be.rejectedWith('Failed to write output to file! Argh!')
  })

  it('should be written to the desired ZIP file', () => {
    writeToCtfd2Zip.__set__({
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
    return expect(writeToCtfd2Zip({ challenges: { results: [] }, flagKeys: { results: [] }, hints: { results: [] } }, 'custom.zip'))
      .to.be.fulfilled
  })
})
