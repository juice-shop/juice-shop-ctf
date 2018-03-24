const chai = require('chai')
chai.use(require('chai-as-promised'))
const expect = chai.expect
const readConfigStream = require('../../lib/readConfigStream')
const Readable = require('stream').Readable

function generateStreamFromYaml (yaml) {
  const stream = new Readable()
  stream.push(yaml)
  stream.push(null)
  return stream
}
function generateStream (url, ctfKey, insertHints, insertHintUrls) {
  const yaml = `
juiceShopUrl: ${url}
ctfKey: ${ctfKey}
insertHints: ${insertHints}
insertHintUrls: ${insertHintUrls}
`
  return generateStreamFromYaml(yaml)
}

describe('Read config stream', () => {
  it(`should reject with an error when using an unparsable yaml`, () => {
    const stream = generateStreamFromYaml(`
juiceShopUrl: http://thejuiceshopurl.com
ctfK`)

    expect(readConfigStream(stream)).to.be.rejectedWith(Error)
  })

  it(`should resolve with {http://thejuiceshopurl.com, theCtfKey, 2, 2} when using a yaml containing http://thejuiceshopurl.com, theCtfKey, paid, paid`, () => {
    const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'paid', 'paid')

    expect(readConfigStream(stream)).to.eventually.deep.equal({
      juiceShopUrl: 'http://thejuiceshopurl.com',
      ctfKey: 'theCtfKey',
      insertHints: 2,
      insertHintUrls: 2
    })
  })

  it(`should resolve with {127.0.0.1, theCtfKey, 2, 2} when using a yaml containing 127.0.0.1, theCtfKey, paid, paid`, () => {
    const stream = generateStream('127.0.0.1', 'theCtfKey', 'paid', 'paid')

    expect(readConfigStream(stream)).to.eventually.deep.equal({
      juiceShopUrl: '127.0.0.1',
      ctfKey: 'theCtfKey',
      insertHints: 2,
      insertHintUrls: 2
    })
  })

  it(`should reject with an error when using a yaml containing notAUriNorAnIpValue, theCtfKey, paid, paid`, () => {
    const stream = generateStream('notAUriNorAnIpValue', 'theCtfKey', 'paid', 'paid')

    expect(readConfigStream(stream)).to.be.rejectedWith(Error)
  })

  it(`should reject with an error when using a yaml containing http://thejuiceshopurl.com', 0, paid, paid`, () => {
    const stream = generateStream('http://thejuiceshopurl.com', 0, 'paid', 'paid')

    expect(readConfigStream(stream)).to.be.rejectedWith(Error)
  })

  it(`should resolve with {http://thejuiceshopurl.com, theCtfKey, 0, 2} when using a yaml containing http://thejuiceshopurl.com, theCtfKey, none, paid`, () => {
    const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'none', 'paid')

    expect(readConfigStream(stream)).to.eventually.deep.equal({
      juiceShopUrl: 'http://thejuiceshopurl.com',
      ctfKey: 'theCtfKey',
      insertHints: 0,
      insertHintUrls: 2
    })
  })

  it(`should resolve with {http://thejuiceshopurl.com, theCtfKey, 1, 2} when using a yaml containing http://thejuiceshopurl.com, theCtfKey, free, paid`, () => {
    const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'free', 'paid')

    expect(readConfigStream(stream)).to.eventually.deep.equal({
      juiceShopUrl: 'http://thejuiceshopurl.com',
      ctfKey: 'theCtfKey',
      insertHints: 1,
      insertHintUrls: 2
    })
  })

  it(`should reject with an error when using a yaml containing http://thejuiceshopurl.com, theCtfKey, invalidValue, paid`, () => {
    const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'invalidValue', 'paid')

    expect(readConfigStream(stream)).to.be.rejectedWith(Error)
  })

  it(`should resolve with {http://thejuiceshopurl.com, theCtfKey, 2, 0} when using a yaml containing http://thejuiceshopurl.com, theCtfKey, none, paid`, () => {
    const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'paid', 'none')

    expect(readConfigStream(stream)).to.eventually.deep.equal({
      juiceShopUrl: 'http://thejuiceshopurl.com',
      ctfKey: 'theCtfKey',
      insertHints: 2,
      insertHintUrls: 0
    })
  })

  it(`should resolve with {http://thejuiceshopurl.com, theCtfKey, 2, 1} when using a yaml containing http://thejuiceshopurl.com, theCtfKey, free, paid`, () => {
    const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'paid', 'free')

    expect(readConfigStream(stream)).to.eventually.deep.equal({
      juiceShopUrl: 'http://thejuiceshopurl.com',
      ctfKey: 'theCtfKey',
      insertHints: 2,
      insertHintUrls: 1
    })
  })

  it(`should reject with an error when using a yaml containing http://thejuiceshopurl.com, theCtfKey, paid, invalidValue`, () => {
    const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'paid', 'invalidValue')

    expect(readConfigStream(stream)).to.be.rejectedWith(Error)
  })
})
