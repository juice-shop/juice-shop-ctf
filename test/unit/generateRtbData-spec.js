/*
 * Copyright (c) 2016-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const chai = require('chai')
chai.use(require('chai-things'))
chai.use(require('chai-subset'))
chai.use(require('chai-as-promised'))
const expect = chai.expect
const generateData = require('../../lib/generators/rtb')
const options = require('../../lib/options')

const defaultOptions = { insertHints: options.noTextHints, insertHintUrls: options.noHintUrls, ctfKey: '', vulnSnippets: {} }

describe('Generated RTB data', () => {
  let challenges
  beforeEach(() => {
    challenges = {
      c1: { id: 1, key: 'k1', name: 'c1', description: 'C1', difficulty: 1, category: '1' },
      c2: { id: 2, key: 'k2', name: 'c2', description: 'C2', difficulty: 2, category: '2' },
      c3: { id: 3, key: 'k3', name: 'c3', description: 'C3', difficulty: 3, category: '2' },
      c4: { id: 4, key: 'k4', name: 'c4', description: 'C4', difficulty: 4, category: '3' },
      c5: { id: 5, key: 'k5', name: 'c5', description: 'C5', difficulty: 5, category: '1' }
    }
  })

  it('should contain no boxes when given no challenges', () =>
    expect(generateData({}, defaultOptions)).to.eventually.deep.include(
      '<boxes count="0"/>'
    )
  )

  it('should log generator error to console', () =>
    expect(generateData({ c1: undefined }, defaultOptions)).to.be.rejectedWith('Failed to generate challenge data! Cannot read property \'category\' of undefined')
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

  it('should add a <hint> for a text hint defined on a challenge', () => {
    challenges.c3.hint = 'hint'
    return Promise.all([
      expect(generateData(challenges, { insertHints: options.freeTextHints, insertHintUrls: options.noHintUrls, ctfKey: '', vulnSnippets: {} })).to.eventually.deep.match(
        /<flag type="static">\s{15}<name>c3<\/name>[^]*<hints count="1">\s{17}<hint>\s{19}<description>hint<\/description>\s{19}<price>0<\/price>/
      ),
      expect(generateData(challenges, { insertHints: options.paidTextHints, insertHintUrls: options.noHintUrls, ctfKey: '', vulnSnippets: {} })).to.eventually.deep.match(
        /<flag type="static">\s{15}<name>c3<\/name>[^]*<hints count="1">\s{17}<hint>\s{19}<description>hint<\/description>\s{19}<price>45<\/price>/
      )
    ])
  })

  it('should add a <hint> for a hint URL defined on a challenge', () => {
    challenges.c3.hintUrl = 'hintUrl'
    return Promise.all([
      expect(generateData(challenges, { insertHints: options.noTextHints, insertHintUrls: options.freeHintUrls, ctfKey: '', vulnSnippets: {} })).to.eventually.deep.match(
        /<flag type="static">\s{15}<name>c3<\/name>[^]*<hints count="1">\s{17}<hint>\s{19}<description>\[C3]\(hintUrl\)<\/description>\s{19}<price>0<\/price>/
      ),
      expect(generateData(challenges, { insertHints: options.noTextHints, insertHintUrls: options.paidHintUrls, ctfKey: '', vulnSnippets: {} })).to.eventually.deep.match(
        /<flag type="static">\s{15}<name>c3<\/name>[^]*<hints count="1">\s{17}<hint>\s{19}<description>\[C3]\(hintUrl\)<\/description>\s{19}<price>90<\/price>/
      )
    ])
  })

  it('should extract the link text for a hint URL from its anchor', () => {
    challenges.c3.hintUrl = 'hintUrl#this-is-the-anchor-to-the-ebook-section'
    return expect(generateData(challenges, { insertHints: options.noTextHints, insertHintUrls: options.freeHintUrls, ctfKey: '', vulnSnippets: {} })).to.eventually.deep.match(
      /<hint>\s{19}<description>\[This Is The Anchor To The Ebook Section]\(hintUrl#this-is-the-anchor-to-the-ebook-section\)<\/description>/
    )
  })
})
