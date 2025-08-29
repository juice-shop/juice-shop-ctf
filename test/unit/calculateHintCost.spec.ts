/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import assert from 'node:assert'
import { describe, it } from 'node:test'
import calculateHintCost from '../../lib/calculateHintCost'
import { options as juiceShopOptions } from '../../lib/options'

describe('Hints', () => {
  it('should cost 10% of their point value for hints when payment is required', () => {
    assert.strictEqual(calculateHintCost({ difficulty: 1 }, juiceShopOptions.paidHints), 10)
    assert.strictEqual(calculateHintCost({ difficulty: 2 }, juiceShopOptions.paidHints), 25)
    assert.strictEqual(calculateHintCost({ difficulty: 3 }, juiceShopOptions.paidHints), 45)
    assert.strictEqual(calculateHintCost({ difficulty: 4 }, juiceShopOptions.paidHints), 70)
    assert.strictEqual(calculateHintCost({ difficulty: 5 }, juiceShopOptions.paidHints), 100)
    assert.strictEqual(calculateHintCost({ difficulty: 6 }, juiceShopOptions.paidHints), 135)
  })

  it('should cost no points for hints for all challenge difficulties when free', () => {
    for (let i = 1; i <= 6; i++) {
      assert.strictEqual(calculateHintCost({ difficulty: i }, juiceShopOptions.freeHints), 0)
    }
  })
})
