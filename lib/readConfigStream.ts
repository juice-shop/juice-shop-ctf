/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import yaml from 'js-yaml'
import Joi from 'joi'
import { options } from './options'
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
  insertHints: string | keyof typeof hintsMap
  insertHintUrls?: string | keyof typeof hintUrlsMap
  insertHintSnippets?: string | keyof typeof hintSnippetsMap
}

async function readConfigStream (stream: NodeJS.ReadableStream): Promise<ConfigDoc> {
  return await new Promise((resolve, reject) => {
    let data = ''
    stream.on('data', (chunk: Buffer | string) => {
      data += chunk.toString()
    })
    stream.on('end', () => {
      try {
        yaml.loadAll(data, (doc: unknown) => {
          const validation = schema.validate(doc)
          if (validation.error !== undefined && validation.error !== null) {
            reject(validation.error)
          } else if (validation.value !== undefined && validation.value !== null) {
            const result = validation.value as ConfigDoc
            result.insertHints =
              result.insertHints !== undefined &&
              result.insertHints !== null &&
              result.insertHints !== ''
                ? hintsMap[result.insertHints as keyof typeof hintsMap]
                : options.noTextHints

            result.insertHintUrls =
              result.insertHintUrls !== undefined &&
              result.insertHintUrls !== null &&
              result.insertHintUrls !== ''
                ? hintUrlsMap[result.insertHintUrls as keyof typeof hintUrlsMap]
                : options.noHintUrls

            result.insertHintSnippets =
              result.insertHintSnippets !== undefined &&
              result.insertHintSnippets !== null &&
              result.insertHintSnippets !== ''
                ? hintSnippetsMap[result.insertHintSnippets as keyof typeof hintSnippetsMap]
                : options.noHintSnippets

            resolve(result)
          } else {
            reject(new Error('Config validation returned null or undefined'))
          }
        })
      } catch (error) {
        reject(error)
      }
    })
  })
}

export default readConfigStream
