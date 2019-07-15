const yaml = require('js-yaml')
const Joi = require('@hapi/joi')
const options = require('./options')
const schema = Joi.object().keys({
  ctfFramework: Joi.string().optional().valid(options.ctfd2Framework, options.ctfdFramework, options.fbctfFramework),
  juiceShopUrl: [Joi.string().uri().required(), Joi.string().ip().required()],
  countryMapping: Joi.string().when('ctfFramework', { is: options.fbctfFramework, then: Joi.required(), otherwise: Joi.optional() }),
  ctfKey: Joi.string().required(),
  insertHints: Joi.any().valid('none', 'free', 'paid').required(),
  insertHintUrls: Joi.any().valid('none', 'free', 'paid').when('ctfFramework', { is: options.fbctfFramework, then: Joi.optional(), otherwise: Joi.required() })
})

const hintsMap = { none: 0, free: 1, paid: 2 }

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
            result.insertHintUrls = result.insertHintUrls ? hintsMap[result.insertHintUrls] : 0
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
