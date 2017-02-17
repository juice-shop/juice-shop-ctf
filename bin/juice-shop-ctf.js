#!/usr/bin/env node
'use strict'

var juiceShopCtfCli = require('../index')

try {
  juiceShopCtfCli()
} catch (error) {
  console.error(error.message)
}

