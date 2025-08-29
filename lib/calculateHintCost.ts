/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import calculateScore from './calculateScore'
import { options as juiceShopOptions } from './options'

/* The hint costs depend on the kind of hint and the difficulty of the challenge they are for:
 paid hint = 10% of the challenge's score value
 free hint = free (as in free beer)
 */
interface Challenge {
  difficulty: number
}

type HintOption = typeof juiceShopOptions.paidHints | typeof juiceShopOptions.freeHints | typeof juiceShopOptions.noHints

function calculateHintCost ({ difficulty }: Challenge, hintOption: HintOption): number {
  const costMultiplier = hintOption === juiceShopOptions.paidHints ? 0.1 : 0
  return costMultiplier * calculateScore(difficulty)
}
export default calculateHintCost
