/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import assert from 'node:assert'
import { describe, it } from 'node:test'
import calculateHintCost from '../../lib/calculateHintCost'
import { options as juiceShopOptions } from '../../lib/options'

describe('Hints', () => {
  it('should cost 10% of their point value for text hints when payment is required', () => {
    assert.strictEqual(calculateHintCost({ difficulty: 1 }, juiceShopOptions.paidTextHints), 10)
    assert.strictEqual(calculateHintCost({ difficulty: 2 }, juiceShopOptions.paidTextHints), 25)
    assert.strictEqual(calculateHintCost({ difficulty: 3 }, juiceShopOptions.paidTextHints), 45)
    assert.strictEqual(calculateHintCost({ difficulty: 4 }, juiceShopOptions.paidTextHints), 70)
    assert.strictEqual(calculateHintCost({ difficulty: 5 }, juiceShopOptions.paidTextHints), 100)
    assert.strictEqual(calculateHintCost({ difficulty: 6 }, juiceShopOptions.paidTextHints), 135)
  })

  it('should cost 20% of their point value for hint URLs when payment is required', () => {
    assert.strictEqual(calculateHintCost({ difficulty: 1 }, juiceShopOptions.paidHintUrls), 20)
    assert.strictEqual(calculateHintCost({ difficulty: 2 }, juiceShopOptions.paidHintUrls), 50)
    assert.strictEqual(calculateHintCost({ difficulty: 3 }, juiceShopOptions.paidHintUrls), 90)
    assert.strictEqual(calculateHintCost({ difficulty: 4 }, juiceShopOptions.paidHintUrls), 140)
    assert.strictEqual(calculateHintCost({ difficulty: 5 }, juiceShopOptions.paidHintUrls), 200)
    assert.strictEqual(calculateHintCost({ difficulty: 6 }, juiceShopOptions.paidHintUrls), 270)
  })

  it('should cost no points for text hints for all challenge difficulties when free', () => {
    for (let i = 1; i <= 6; i++) {
      assert.strictEqual(calculateHintCost({ difficulty: i }, juiceShopOptions.freeTextHints), 0)
    }
  })

  it('should cost no points for hint URLs for all challenge difficulties when free', () => {
    for (let i = 1; i <= 6; i++) {
      assert.strictEqual(calculateHintCost({ difficulty: i }, juiceShopOptions.freeHintUrls), 0)
    }
  })
})
