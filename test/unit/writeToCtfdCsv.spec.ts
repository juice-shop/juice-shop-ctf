/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { test ,describe} from 'node:test'
import  assert  from 'node:assert'
import { mockWriteFile } from './utils/mockFileSystem'

import writeToCtfdCsv from '../../lib/writeToCtfdCsv.js'

const CTFD_DATA = [
  { name: 'c1', description: '"C1 (Difficulty Level: 1)"', category: '1', value: 100, type: 'standard', state: 'visible', max_attempts: 0, flags: '958c64658383140e7d08d5dee091009cc0eafc1f', tags: '"foo,bar"', hints: '', type_data: '' },
  { name: 'c2', description: '"C2 (Difficulty Level: 2)"', category: '2', value: 250, type: 'standard', state: 'visible', max_attempts: 0, flags: '49294e8b829f5b053f748facad22825ccb4bf420', tags: '', hints: '', type_data: '' },
  { name: 'c3', description: '"C3 (Difficulty Level: 3)"', category: '2', value: 450, type: 'standard', state: 'visible', max_attempts: 0, flags: 'aae3acb6eff2000c0e12af0d0d875d0bdbf4ca81', tags: '"foo"', hints: '', type_data: '' },
]

describe('Output for CTFd', () => { // TODO Amend test cases for new CSV data export
  test('should be written to ZIP file', async () => {
    mockWriteFile(async (filePath, data, options) => {
      const [HEADER, ...LINES ] = data.split('\n')
      assert.strictEqual(HEADER, 'name,description,category,value,type,state,max_attempts,flags,tags,hints,type_data')

      assert.strictEqual(LINES[0], 'c1,"C1 (Difficulty Level: 1)",1,100,standard,visible,0,958c64658383140e7d08d5dee091009cc0eafc1f,"foo,bar",,')
      assert.strictEqual(LINES[1], 'c2,"C2 (Difficulty Level: 2)",2,250,standard,visible,0,49294e8b829f5b053f748facad22825ccb4bf420,,,')
      assert.strictEqual(LINES[2], 'c3,"C3 (Difficulty Level: 3)",2,450,standard,visible,0,aae3acb6eff2000c0e12af0d0d875d0bdbf4ca81,"foo",,')
      assert.strictEqual(LINES.length, 3)

      assert.match(filePath, /OWASP_Juice_Shop\..*\.csv$/)
    })
    await assert.doesNotReject(writeToCtfdCsv(CTFD_DATA))
  })

  test('should throw error when unable to write', async () => {
    mockWriteFile(async (filePath, data, options) => {
      throw new Error('Argh!')
    })

    await assert.rejects(
      () => writeToCtfdCsv(CTFD_DATA),
      /Failed to write output to file! Argh!/
    )
  })
})
