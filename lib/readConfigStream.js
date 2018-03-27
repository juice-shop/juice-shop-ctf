const yaml = require('js-yaml')
const Joi = require('joi')
const schema = Joi.object().keys({
  juiceShopUrl: [Joi.string().uri().required(), Joi.string().ip().required()],
  ctfKey: Joi.string().required(),
  insertHints: Joi.any().valid('none', 'free', 'paid').required(),
  insertHintUrls: Joi.any().valid('none', 'free', 'paid').required()
})

const hintsMap = {'none': 0, 'free': 1, 'paid': 2}

function readConfigStream (stream) {
  return new Promise((resolve, reject) => {
    let data = ''
    stream.on('data', (chunk) => {
      data = data + chunk
    })
    stream.on('end', () => {
      try {
        yaml.safeLoadAll(data, (doc) => {
          const validation = Joi.validate(doc, schema)
          if (validation.error) {
            reject(validation.error)
          } else {
            const result = validation.value
            result.insertHints = hintsMap[result.insertHints]
            result.insertHintUrls = hintsMap[result.insertHintUrls]
            resolve(result)
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  })
}

module.exports = readConfigStream
