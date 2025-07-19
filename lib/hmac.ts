/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

const jsSHA = require('jssha')

interface HmacSha1 {
  (secretKey: string, text: string): string
}

function hmacSha1 (secretKey: string, text: string): string {
  const shaObj = new jsSHA('SHA-1', 'TEXT') // eslint-disable-line new-cap
  shaObj.setHMACKey(secretKey, 'TEXT')
  shaObj.update(text)
  return shaObj.getHMAC('HEX')
}
module.exports = hmacSha1
