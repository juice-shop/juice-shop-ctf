/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

function isUrl (text: string): boolean {
  return text.match(/^(http|localhost|[0-9][0-9]?[0-9]?\.)/) !== null
}


export = isUrl