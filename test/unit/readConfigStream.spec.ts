/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { test } from 'node:test'
import assert from 'node:assert'
import { Readable } from 'stream'
import readConfigStream from '../../lib/readConfigStream'
import {options} from '../../lib/options'

interface GenerateStreamFromYaml {
  (yaml: string): Readable
}

const generateStreamFromYaml: GenerateStreamFromYaml = function (yaml: string): Readable {
  const stream = new Readable()
  stream.push(yaml)
  stream.push(null)
  return stream
}

interface GenerateStreamParams {
  url: string
  ctfKey: string | number
  insertHints: string
}

function generateStream (
  url: GenerateStreamParams['url'],
  ctfKey: GenerateStreamParams['ctfKey'],
  insertHints: GenerateStreamParams['insertHints'],
): Readable {
  const yaml = `
juiceShopUrl: ${url}
ctfKey: ${ctfKey}
insertHints: ${insertHints}
`
  return generateStreamFromYaml(yaml)
}

test('rejects with an error when using an unparsable yaml', async () => {
  const stream = generateStreamFromYaml(`
juiceShopUrl: http://thejuiceshopurl.com
ctfK`)
  await assert.rejects(() => readConfigStream(stream), Error)
})

test('resolves with paid values for valid yaml', async () => {
  const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'paid')
  const result = await readConfigStream(stream)
  assert.deepEqual(result, {
    juiceShopUrl: 'http://thejuiceshopurl.com',
    ctfKey: 'theCtfKey',
    insertHints: options.paidHints,
  })
})

test('resolves with paid values for 127.0.0.1 url', async () => {
  const stream = generateStream('127.0.0.1', 'theCtfKey', 'paid')
  const result = await readConfigStream(stream)
  assert.deepEqual(result, {
    juiceShopUrl: '127.0.0.1',
    ctfKey: 'theCtfKey',
    insertHints: options.paidHints,
  })
})

test('rejects with an error when juiceShopUrl is invalid', async () => {
  const stream = generateStream('notAUriNorAnIpValue', 'theCtfKey', 'paid')
  await assert.rejects(() => readConfigStream(stream), Error)
})

test('rejects with an error when ctfKey is not a string', async () => {
  const stream = generateStream('http://thejuiceshopurl.com', 0, 'paid')
  await assert.rejects(() => readConfigStream(stream), Error)
})

test('resolves with no text hints', async () => {
  const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'none')
  const result = await readConfigStream(stream)
  assert.deepEqual(result, {
    juiceShopUrl: 'http://thejuiceshopurl.com',
    ctfKey: 'theCtfKey',
    insertHints: options.noHints,
  })
})

test('resolves with free text hints', async () => {
  const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'free')
  const result = await readConfigStream(stream)
  assert.deepEqual(result, {
    juiceShopUrl: 'http://thejuiceshopurl.com',
    ctfKey: 'theCtfKey',
    insertHints: options.freeHints,
  })
})

test('rejects when insertHints is invalid', async () => {
  const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'invalidValue')
  await assert.rejects(() => readConfigStream(stream), Error)
})
