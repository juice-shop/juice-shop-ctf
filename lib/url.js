/*
 * Copyright (c) 2016-2024 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

function isUrl (text) {
  return text.match(/^(http|localhost|[0-9][0-9]?[0-9]?\.)/) !== null
}

module.exports = isUrl
