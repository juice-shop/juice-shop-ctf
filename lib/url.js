function isUrl (text) {
  return text.match(/^(http|localhost|[0-9][0-9]?[0-9]?\.)/) !== null
}

module.exports = isUrl
