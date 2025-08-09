/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import jsSHA from "jssha"

interface HmacSha1 {
  (secretKey: string, text: string): string
}

const hmacSha1: HmacSha1 = (secretKey, text) => {
  const shaObj = new jsSHA('SHA-1', 'TEXT') // eslint-disable-line new-cap
  shaObj.setHMACKey(secretKey, 'TEXT')
  shaObj.update(text)
  return shaObj.getHMAC('HEX')
}

export default hmacSha1
