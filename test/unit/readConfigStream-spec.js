/*
 * Copyright (c) 2016 -2021 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const chai = require('chai')
chai.use(require('chai-as-promised'))
const expect = chai.expect
const readConfigStream = require('../../lib/readConfigStream')
const options = require('../../lib/options')
const Readable = require('stream').Readable

function generateStreamFromYaml (yaml) {
  const stream = new Readable()
  stream.push(yaml)
  stream.push(null)
  return stream
}
function generateStream (url, ctfKey, insertHints, insertHintUrls, insertHintSnippets) {
  const yaml = `
juiceShopUrl: ${url}
ctfKey: ${ctfKey}
insertHints: ${insertHints}
insertHintUrls: ${insertHintUrls}
insertHintSnippets: ${insertHintSnippets}
`
  return generateStreamFromYaml(yaml)
}

describe('Read config stream', () => {
  it('should reject with an error when using an unparsable yaml', () => {
    const stream = generateStreamFromYaml(`
juiceShopUrl: http://thejuiceshopurl.com
ctfK`)

    expect(readConfigStream(stream)).to.be.rejectedWith(Error)
  })

  it('should resolve with {http://thejuiceshopurl.com, theCtfKey, 2, 2, 2} when using a yaml containing http://thejuiceshopurl.com, theCtfKey, paid, paid, paid', () => {
    const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'paid', 'paid', 'paid')

    expect(readConfigStream(stream)).to.eventually.deep.equal({
      juiceShopUrl: 'http://thejuiceshopurl.com',
      ctfKey: 'theCtfKey',
      insertHints: options.paidTextHints,
      insertHintUrls: options.paidHintUrls,
      insertHintSnippets: options.paidHintSnippets
    })
  })

  it('should resolve with {127.0.0.1, theCtfKey, 2, 2, 2} when using a yaml containing 127.0.0.1, theCtfKey, paid, paid. paid', () => {
    const stream = generateStream('127.0.0.1', 'theCtfKey', 'paid', 'paid', 'paid')

    expect(readConfigStream(stream)).to.eventually.deep.equal({
      juiceShopUrl: '127.0.0.1',
      ctfKey: 'theCtfKey',
      insertHints: options.paidTextHints,
      insertHintUrls: options.paidHintUrls,
      insertHintSnippets: options.paidHintSnippets
    })
  })

  it('should reject with an error when using a yaml containing notAUriNorAnIpValue, theCtfKey, paid, paid, paid', () => {
    const stream = generateStream('notAUriNorAnIpValue', 'theCtfKey', 'paid', 'paid', 'paid')

    expect(readConfigStream(stream)).to.be.rejectedWith(Error)
  })

  it('should reject with an error when using a yaml containing http://thejuiceshopurl.com\', 0, paid, paid, paid', () => {
    const stream = generateStream('http://thejuiceshopurl.com', 0, 'paid', 'paid', 'paid')

    expect(readConfigStream(stream)).to.be.rejectedWith(Error)
  })

  it('should resolve with {http://thejuiceshopurl.com, theCtfKey, 0, 2, 2} when using a yaml containing http://thejuiceshopurl.com, theCtfKey, none, paid, paid', () => {
    const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'none', 'paid', 'paid')

    expect(readConfigStream(stream)).to.eventually.deep.equal({
      juiceShopUrl: 'http://thejuiceshopurl.com',
      ctfKey: 'theCtfKey',
      insertHints: options.noTextHints,
      insertHintUrls: options.paidHintUrls,
      insertHintSnippets: options.paidHintSnippets
    })
  })

  it('should resolve with {http://thejuiceshopurl.com, theCtfKey, 1, 2, 2} when using a yaml containing http://thejuiceshopurl.com, theCtfKey, free, paid, paid', () => {
    const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'free', 'paid', 'paid')

    expect(readConfigStream(stream)).to.eventually.deep.equal({
      juiceShopUrl: 'http://thejuiceshopurl.com',
      ctfKey: 'theCtfKey',
      insertHints: options.freeTextHints,
      insertHintUrls: options.paidHintUrls,
      insertHintSnippets: options.paidHintSnippets
    })
  })

  it('should reject with an error when using a yaml containing http://thejuiceshopurl.com, theCtfKey, invalidValue, paid, paid', () => {
    const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'invalidValue', 'paid', 'paid')

    expect(readConfigStream(stream)).to.be.rejectedWith(Error)
  })

  it('should resolve with {http://thejuiceshopurl.com, theCtfKey, 2, 0, 2} when using a yaml containing http://thejuiceshopurl.com, theCtfKey, paid, none, paid', () => {
    const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'paid', 'none', 'paid')

    expect(readConfigStream(stream)).to.eventually.deep.equal({
      juiceShopUrl: 'http://thejuiceshopurl.com',
      ctfKey: 'theCtfKey',
      insertHints: options.paidTextHints,
      insertHintUrls: options.noHintUrls,
      insertHintSnippets: options.paidHintSnippets
    })
  })

  it('should resolve with {http://thejuiceshopurl.com, theCtfKey, 2, 1, 2} when using a yaml containing http://thejuiceshopurl.com, theCtfKey, paid, free, paid', () => {
    const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'paid', 'free', 'paid')

    expect(readConfigStream(stream)).to.eventually.deep.equal({
      juiceShopUrl: 'http://thejuiceshopurl.com',
      ctfKey: 'theCtfKey',
      insertHints: options.paidTextHints,
      insertHintUrls: options.freeHintUrls,
      insertHintSnippets: options.paidHintSnippets
    })
  })

  it('should reject with an error when using a yaml containing http://thejuiceshopurl.com, theCtfKey, paid, invalidValue, paid', () => {
    const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'paid', 'invalidValue', 'paid')

    expect(readConfigStream(stream)).to.be.rejectedWith(Error)
  })

  it('should resolve with {http://thejuiceshopurl.com, theCtfKey, 2, 2, 0} when using a yaml containing http://thejuiceshopurl.com, theCtfKey, paid, paid, none', () => {
    const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'paid', 'paid', 'none')

    expect(readConfigStream(stream)).to.eventually.deep.equal({
      juiceShopUrl: 'http://thejuiceshopurl.com',
      ctfKey: 'theCtfKey',
      insertHints: options.paidTextHints,
      insertHintUrls: options.paidHintUrls,
      insertHintSnippets: options.noHintSnippets
    })
  })

  it('should resolve with {http://thejuiceshopurl.com, theCtfKey, 2, 2, 1} when using a yaml containing http://thejuiceshopurl.com, theCtfKey, paid, paid, free', () => {
    const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'paid', 'paid', 'free')

    expect(readConfigStream(stream)).to.eventually.deep.equal({
      juiceShopUrl: 'http://thejuiceshopurl.com',
      ctfKey: 'theCtfKey',
      insertHints: options.paidTextHints,
      insertHintUrls: options.paidHintUrls,
      insertHintSnippets: options.freeHintSnippets
    })
  })

  it('should reject with an error when using a yaml containing http://thejuiceshopurl.com, theCtfKey, paid, paid, invalidValue', () => {
    const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'paid', 'paid', 'invalidValue')

    expect(readConfigStream(stream)).to.be.rejectedWith(Error)
  })
})
