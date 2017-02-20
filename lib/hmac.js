'use strict'
var jsSHA = require('jssha')

function hmac (text, secretKey) {
  var shaObj = new jsSHA('SHA-1', 'TEXT') // eslint-disable-line new-cap
  shaObj.setHMACKey(secretKey, 'TEXT')
  shaObj.update(text)
  return shaObj.getHMAC('HEX')
}
module.exports = hmac
