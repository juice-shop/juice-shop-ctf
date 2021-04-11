/*
 * Copyright (c) 2016-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

const calculateScore = require('./calculateScore')
const options = require('./options')

/* The hint costs depend on the kind of hint and the difficulty of the challenge they are for:
 paid text hint             = 10% of the challenge's score value
 paid url hint              = 20% of the challenge's score value
 paid code snippet hint     = 30% of the challenge's score value
 free text/url/snippet hint = free (as in free beer)
 */
function calculateHintCost ({ difficulty }, hintOption) {
  let costMultiplier = 0
  if (hintOption === options.paidTextHints) {
    costMultiplier = 0.1
  } else if (hintOption === options.paidHintUrls) {
    costMultiplier = 0.2
  } else if (hintOption === options.paidHintSnippets) {
    costMultiplier = 0.3
  }
  return costMultiplier * calculateScore(difficulty)
}
module.exports = calculateHintCost
