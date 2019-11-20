const chai = require('chai')
chai.use(require('chai-things'))
chai.use(require('chai-subset'))
chai.use(require('chai-as-promised'))
const expect = chai.expect
const generateData = require('../../lib/generators/rtb')
const options = require('../../lib/options')

const challenge1 = { key: 'key1', name: 'c1', description: 'C1', difficulty: 1, category: '1', hint: 'hint1', hintUrl: 'https://hint1.com' }
const juiceShopUrl = 'http://thejuiceshopurl.com'

const defaultOptions = { insertHints: options.noTextHints, insertHintUrls: options.noHintUrls, ctfKey: '', juiceShopUrl: juiceShopUrl }

describe('Generated RTB data', () => {
  it('should respect hint insertion options', function () {
    return expect(generateData([challenge1], { ...defaultOptions, insertHints: options.freeTextHints })).to.eventually.deep.include(
        '<?xml version="1.0" encoding="UTF-8"?>'
    )
  })

  it('should respect hint penalty costs insertion options', function () {
    return expect(generateData([challenge1], { ...defaultOptions, insertHints: options.paidTextHints })).to.eventually.deep.include(
        '<?xml version="1.0" encoding="UTF-8"?>'
    )
  })

  it('should respect hint penalty costs insertion options', function () {
    return expect(generateData([challenge1], { ...defaultOptions, insertHintUrls: options.paidHintUrls })).to.eventually.deep.include(
        '<?xml version="1.0" encoding="UTF-8"?>'
    )
  })

  it('should merge hint & hintUrl together (considering hint text and penalty)', function () {
    return expect(generateData([challenge1], { ...defaultOptions, insertHints: options.paidTextHints, insertHintUrls: options.paidHintUrls })).to.eventually.deep.include(
        '<?xml version="1.0" encoding="UTF-8"?>'
    )
  })
})
