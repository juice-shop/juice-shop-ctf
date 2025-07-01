/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* This is a default multiplier whereby the score will be = (difficulty x multiplier)
 i.e. using these multipliers will create challenges with the following scores:
 *      =  100
 **     =  250
 ***    =  450
 ****   =  700
 *****  = 1000
 ****** = 1350
 */
const multiplier = [100, 125, 150, 175, 200, 225]
function calculateScore (difficulty: number): number {
  return difficulty * multiplier[difficulty - 1]
}

export default calculateScore
