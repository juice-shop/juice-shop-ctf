const chai = require('chai')
chai.use(require('chai-things'))
chai.use(require('chai-subset'))
chai.use(require('chai-as-promised'))
const expect = chai.expect
const generateData = require('../../lib/generators/rtb')
const options = require('../../lib/options')

let defaultOptions = { insertHints: options.noTextHints, insertHintUrls: options.noHintUrls, ctfKey: '' }

describe('Generated RTB data', () => {
  let challenges
  beforeEach(() => {
    challenges = {
      c1: { id: 1, name: 'c1', description: 'C1', difficulty: 1, category: '1' },
      c2: { id: 2, name: 'c2', description: 'C2', difficulty: 2, category: '2' },
      c3: { id: 3, name: 'c3', description: 'C3', difficulty: 3, category: '2' },
      c4: { id: 4, name: 'c4', description: 'C4', difficulty: 4, category: '3' },
      c5: { id: 5, name: 'c5', description: 'C5', difficulty: 5, category: '1' }
    }
  })

  it('should contain no boxes when given no challenges', () =>
    expect(generateData({}, defaultOptions)).to.eventually.deep.include(
      '<boxes count="0"/>'
    )
  )

  it('should log generator error to console', () =>
    expect(generateData({ c1: undefined }, defaultOptions)).to.be.rejectedWith(`Failed to generate challenge data! Cannot read property 'category' of undefined`)
  )

  it('should contain one <box> per given challenge category', function () {
    return expect(generateData(challenges, defaultOptions)).to.eventually.deep.include(
      '<boxes count="3">'
    )
  })

  it('should contain one <category> per given challenge category', function () {
    return expect(generateData(challenges, defaultOptions)).to.eventually.deep.include(
      '<categories count="3">'
    )
  })

  it('should put each given challenge as a <flag> into the matching category <box>', function () {
    return expect(generateData(challenges, defaultOptions)).to.eventually.deep.match(
      /<box gamelevel="0">[\s]{11}<name>1<\/name>[^]*<flags count="2">/
    ).and.to.eventually.deep.match(
      /<box gamelevel="0">[\s]{11}<name>2<\/name>[^]*<flags count="2">/
    ).and.to.eventually.deep.match(
      /<box gamelevel="0">[\s]{11}<name>3<\/name>[^]*<flags count="1">/
    )
  })
})
