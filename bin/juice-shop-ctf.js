#!/usr/bin/env node
'use strict'

var lib = require('../index')

try {
  lib.juiceShopCtfCli()
} catch (error) {
  console.error(error.message)
}

