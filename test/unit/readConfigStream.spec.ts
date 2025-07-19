/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { test } from 'node:test'
import assert from 'node:assert'
import { Readable } from 'stream'
const readConfigStream = require('../../lib/readConfigStream')
const options = require('../../lib/options')

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
  insertHintUrls: string
  insertHintSnippets: string
}

function generateStream (
  url: GenerateStreamParams['url'],
  ctfKey: GenerateStreamParams['ctfKey'],
  insertHints: GenerateStreamParams['insertHints'],
  insertHintUrls: GenerateStreamParams['insertHintUrls'],
  insertHintSnippets: GenerateStreamParams['insertHintSnippets']
): Readable {
  const yaml = `
juiceShopUrl: ${url}
ctfKey: ${ctfKey}
insertHints: ${insertHints}
insertHintUrls: ${insertHintUrls}
insertHintSnippets: ${insertHintSnippets}
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
  const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'paid', 'paid', 'paid')
  const result = await readConfigStream(stream)
  assert.deepEqual(result, {
    juiceShopUrl: 'http://thejuiceshopurl.com',
    ctfKey: 'theCtfKey',
    insertHints: options.paidTextHints,
    insertHintUrls: options.paidHintUrls,
    insertHintSnippets: options.paidHintSnippets
  })
})

test('resolves with paid values for 127.0.0.1 url', async () => {
  const stream = generateStream('127.0.0.1', 'theCtfKey', 'paid', 'paid', 'paid')
  const result = await readConfigStream(stream)
  assert.deepEqual(result, {
    juiceShopUrl: '127.0.0.1',
    ctfKey: 'theCtfKey',
    insertHints: options.paidTextHints,
    insertHintUrls: options.paidHintUrls,
    insertHintSnippets: options.paidHintSnippets
  })
})

test('rejects with an error when juiceShopUrl is invalid', async () => {
  const stream = generateStream('notAUriNorAnIpValue', 'theCtfKey', 'paid', 'paid', 'paid')
  await assert.rejects(() => readConfigStream(stream), Error)
})

test('rejects with an error when ctfKey is not a string', async () => {
  const stream = generateStream('http://thejuiceshopurl.com', 0, 'paid', 'paid', 'paid')
  await assert.rejects(() => readConfigStream(stream), Error)
})

test('resolves with none text hints', async () => {
  const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'none', 'paid', 'paid')
  const result = await readConfigStream(stream)
  assert.deepEqual(result, {
    juiceShopUrl: 'http://thejuiceshopurl.com',
    ctfKey: 'theCtfKey',
    insertHints: options.noTextHints,
    insertHintUrls: options.paidHintUrls,
    insertHintSnippets: options.paidHintSnippets
  })
})

test('resolves with free text hints', async () => {
  const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'free', 'paid', 'paid')
  const result = await readConfigStream(stream)
  assert.deepEqual(result, {
    juiceShopUrl: 'http://thejuiceshopurl.com',
    ctfKey: 'theCtfKey',
    insertHints: options.freeTextHints,
    insertHintUrls: options.paidHintUrls,
    insertHintSnippets: options.paidHintSnippets
  })
})

test('rejects when insertHints is invalid', async () => {
  const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'invalidValue', 'paid', 'paid')
  await assert.rejects(() => readConfigStream(stream), Error)
})

test('resolves with none for hintUrls', async () => {
  const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'paid', 'none', 'paid')
  const result = await readConfigStream(stream)
  assert.deepEqual(result, {
    juiceShopUrl: 'http://thejuiceshopurl.com',
    ctfKey: 'theCtfKey',
    insertHints: options.paidTextHints,
    insertHintUrls: options.noHintUrls,
    insertHintSnippets: options.paidHintSnippets
  })
})

test('resolves with free hintUrls', async () => {
  const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'paid', 'free', 'paid')
  const result = await readConfigStream(stream)
  assert.deepEqual(result, {
    juiceShopUrl: 'http://thejuiceshopurl.com',
    ctfKey: 'theCtfKey',
    insertHints: options.paidTextHints,
    insertHintUrls: options.freeHintUrls,
    insertHintSnippets: options.paidHintSnippets
  })
})

test('rejects when insertHintUrls is invalid', async () => {
  const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'paid', 'invalidValue', 'paid')
  await assert.rejects(() => readConfigStream(stream), Error)
})

test('resolves with none for hintSnippets', async () => {
  const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'paid', 'paid', 'none')
  const result = await readConfigStream(stream)
  assert.deepEqual(result, {
    juiceShopUrl: 'http://thejuiceshopurl.com',
    ctfKey: 'theCtfKey',
    insertHints: options.paidTextHints,
    insertHintUrls: options.paidHintUrls,
    insertHintSnippets: options.noHintSnippets
  })
})

test('resolves with free for hintSnippets', async () => {
  const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'paid', 'paid', 'free')
  const result = await readConfigStream(stream)
  assert.deepEqual(result, {
    juiceShopUrl: 'http://thejuiceshopurl.com',
    ctfKey: 'theCtfKey',
    insertHints: options.paidTextHints,
    insertHintUrls: options.paidHintUrls,
    insertHintSnippets: options.freeHintSnippets
  })
})

test('rejects when insertHintSnippets is invalid', async () => {
  const stream = generateStream('http://thejuiceshopurl.com', 'theCtfKey', 'paid', 'paid', 'invalidValue')
  await assert.rejects(() => readConfigStream(stream), Error)
})
