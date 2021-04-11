/*
 * Copyright (c) 2016-2021 Bjoern Kimminich.
 * SPDX-License-Identifier: MIT
 */

function isUrl (text) {
  return text.match(/^(http|localhost|[0-9][0-9]?[0-9]?\.)/) !== null
}

module.exports = isUrl
