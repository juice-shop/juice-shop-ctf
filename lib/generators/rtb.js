const Promise = require('bluebird')
const xmlBuilder = require('xmlbuilder')
const TurndownService = require('turndown')
const turndownService = new TurndownService()
const calculateScore = require('../calculateScore')
const calculateHintCost = require('../calculateHintCost')
const hmacSha1 = require('../hmac')
const options = require('../options')
const { readFileSync } = require('fs')
const path = require('path')
let rtbTemplate = {}

function createRtbExport (challenges, { insertHints, insertHintUrls, ctfKey, juiceShopUrl }) {

  function checkHints() {
    return (challenge.hint && insertHints !== options.noTextHints)
  }

  function checkHintsURL() {
    return (challenge.hintUrl && insertHintUrls !== options.noHintUrls)
  }

  function getDescription(category) {
    if (rtbTemplate["categories"][category] == undefined) {
      return category
    }
    return rtbTemplate["categories"][category].description
  }

  function getImage(category) {
    if (rtbTemplate["categories"][category] == undefined) {
      category = "Miscellaneous"
    }
    return rtbTemplate["categories"][category].image
  }

  function insertHint(challenge, flag) {
    if (checkHints || checkHintsURL) {
      const hints = flag.ele("hints")
      let count = 0
      if (checkHints) {
        const hint = hints.ele("hint")
        hint.ele("description", turndownService.turndown(challenge.hint))
        hint.ele("price", calculateHintCost(challenge, insertHints))
        count += 1
      }
      if (checkHintsURL) {
        const hint = hints.ele("hint")
        hint.ele("description", "[" + formatHintURL(challenge) + 
          "](" + challenge.hintUrl + ")")
        hint.ele("price", calculateHintCost(challenge, insertHintUrls))
        count += 1
      }
      hints.att({'count': count})
    }
  }

  function formatHintURL(challenge) {
    hint_text = challenge.description
    if (challenge.hintUrl.includes("#")) {
      hint_url = challenge.hintUrl
      hint_text = hint_url.substring(hint_url.lastIndexOf("#")+1, hint_url.length).replace(/-/g, " ")
      hint_text = hint_text.replace(/\b[a-z]|['_][a-z]|\B[A-Z]/g, function(x){
        return x[0]==="'"||x[0]==="_"?x:String.fromCharCode(x.charCodeAt(0)^32)
      })
    }
    return hint_text
  }

  function insertBoxes(challenges, boxes, category) {
    box = boxes.ele("box", {'gamelevel': "0"})
    box.ele("name", category)
    box.ele("category", category)
    box.ele("description", getDescription(category) + 
      "\n\n**Target:** [OWASP Juice Shop](" + juiceShopUrl + ")")
    box.ele("avatar", getImage(category))
    flags = box.ele("flags")
    let i = 0
    for (const key in challenges) {
      if (Object.prototype.hasOwnProperty.call(challenges, key)) {
        const challenge = challenges[key]
        if (category === challenge.category) {
            i += 1
            insertFlag(challenge, flags, i)
        }
      }
    }
    flags.att({"count": i.toString()})
  }

  function difficultyText(value) {
    let difficulty = ""
    for (let i = 0; i < value; i++) {
      difficulty += "⭐️"
    }
    return difficulty
  }

  function insertFlag(challenge, flags, order) {
    flag = flags.ele("flag", {"type": "static"})
    flag.ele("name", challenge.name)
    flag.ele("description", turndownService.turndown(challenge.description) + 
      " **Difficulty** " + difficultyText(challenge.difficulty))
    flag.ele("token", hmacSha1(ctfKey, challenge.name))
    flag.ele("value", calculateScore(challenge.difficulty))
    flag.ele("order", order.toString())
    insertHint(challenge, flag)
  }
  
  function insertCategories(challenges, xmlRTB) {
    const categories = new Set()
    for (const key in challenges) {
      categories.add(challenges[key].category)
    }
    if (categories.size > 0) {
      categories_xml = xmlRTB.ele('categories', {'count': categories.size})
      for (let category of categories) {
        categories_xml.ele("category").ele("category", category)
      }
      categories_xml.up()
    } 
    return categories
  }

  function insertCorporation(categories, xmlRTB) {
    let corporation = xmlRTB.ele('corporations', { 'count': '1'}).ele('corporation')
    corporation.ele("name")
    let boxes = corporation.ele('boxes', {'count': categories.size.toString()})
    return boxes
  }

  function insertConfiguration(xmlRTB) {
    const config = xmlRTB.ele('configuration')
    config.ele('game_name', rtbTemplate['configuration'].game_name)
    config.ele('org_footer', rtbTemplate['configuration'].org_footer)
    config.ele('ctf_tagline', rtbTemplate['configuration'].ctf_tagline)
    config.ele('ctf_logo', rtbTemplate['configuration'].ctf_logo)
    config.ele('scoreboard_right_image', rtbTemplate['configuration'].scoreboard_right_image)
  }

  function sortByDifficulty(dict){
    const sorted = []
    let maxdifficulty = 5
    for (let i = 0; i <= maxdifficulty; i++) {
        for (const key in challenges) {
            if (Object.prototype.hasOwnProperty.call(challenges, key)) {
                let challenge = challenges[key]
                if (challenge.difficulty === i) {
                    sorted[sorted.length] = challenge
                }
                maxdifficulty = Math.max(challenge.difficulty, maxdifficulty)
            }
        }
    }
    return sorted
  }

  function loadTemplate () {
    let template = readFileSync(path.join(__dirname, '../../data/rtbImportTemplate.json'));
    return JSON.parse(template);
  }

  return new Promise((resolve, reject) => {
    try {
      rtbTemplate = loadTemplate()
      const xmlRTB = xmlBuilder.create("rootthebox", {version: '1.0', encoding: 'UTF-8'}).att('api', '1')
      insertConfiguration(xmlRTB)
      xmlRTB.ele('gamelevels', { 'count': '1'}).up()
      const categories = insertCategories(challenges, xmlRTB)
      const boxes = insertCorporation(categories, xmlRTB)
      const sorted_challenges = sortByDifficulty(challenges)
      for (let category of categories) {
        insertBoxes(sorted_challenges, boxes, category)
      }
      resolve(xmlRTB.end({ pretty: true }))
    } catch (error) {
      reject(new Error('Failed to generate challenge data! ' + error.message))
    }
  })
}

module.exports = createRtbExport
