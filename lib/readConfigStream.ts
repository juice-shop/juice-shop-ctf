/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const yaml = require('js-yaml')
const Joi = require('joi')
const options = require('./options')
const schema = Joi.object().keys({
  ctfFramework: Joi.string().optional().valid(options.ctfdFramework, options.fbctfFramework, options.rtbFramework),
  juiceShopUrl: [Joi.string().uri().required(), Joi.string().ip().required()],
  countryMapping: Joi.string().when('ctfFramework', { is: options.fbctfFramework, then: Joi.required(), otherwise: Joi.optional() }),
  ctfKey: Joi.string().required(),
  insertHints: Joi.any().valid('none', 'free', 'paid').required(),
  insertHintUrls: Joi.any().valid('none', 'free', 'paid').when('ctfFramework', { is: options.fbctfFramework, then: Joi.optional(), otherwise: Joi.required() }),
  insertHintSnippets: Joi.any().valid('none', 'free', 'paid').when('ctfFramework', { is: options.fbctfFramework, then: Joi.optional(), otherwise: Joi.required() })
})

const hintsMap = { none: options.noTextHints, free: options.freeTextHints, paid: options.paidTextHints }
const hintUrlsMap = { none: options.noHintUrls, free: options.freeHintUrls, paid: options.paidHintUrls }
const hintSnippetsMap = { none: options.noHintSnippets, free: options.freeHintSnippets, paid: options.paidHintSnippets }

interface ConfigDoc {
  ctfFramework?: string
  juiceShopUrl: string
  countryMapping?: string
  ctfKey: string
  insertHints: keyof typeof hintsMap
  insertHintUrls?: keyof typeof hintUrlsMap
  insertHintSnippets?: keyof typeof hintSnippetsMap
}

function readConfigStream (stream: NodeJS.ReadableStream): Promise<ConfigDoc> {
  return new Promise((resolve, reject) => {
    let data = ''
    stream.on('data', (chunk: Buffer | string) => {
      data = data + chunk
    })
    stream.on('end', () => {
      try {
        yaml.loadAll(data, (doc: ConfigDoc) => {
          const validation = schema.validate(doc)
          if (validation.error) {
            reject(validation.error)
          } else {
            const result = validation.value as ConfigDoc
            result.insertHints = hintsMap[result.insertHints]
            result.insertHintUrls = result.insertHintUrls ? hintUrlsMap[result.insertHintUrls] : options.noHintUrls
            result.insertHintSnippets = result.insertHintSnippets ? hintSnippetsMap[result.insertHintSnippets] : options.noHintSnippets
            resolve(result)
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  })
}

export = readConfigStream
