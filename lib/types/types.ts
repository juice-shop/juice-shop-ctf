/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type options } from '../options'

export interface Challenge {
  key: string
  name: string
  description: string
  difficulty: number
  category: string
  tags?: string | null
  id?: number
  hasCodingChallenge: boolean
  [key: string]: any
}

export interface Hint {
  ChallengeId: number
  id: number
  text: string
  order: number
  unlocked: boolean
}

export interface BaseExportSettings {
  insertHints: typeof options.freeHints | typeof options.paidHints | typeof options.noHints
  ctfKey: string
  outputLocation: string
  juiceShopUrl: string
  countryMapping: CountryMapping
}

export type CountryMapping = Record<string, {
  code: string
  name?: string
}>

export interface CtfdChallengeData {
  name: string
  description: string
  category: string
  value: number
  type: string
  state: string
  max_attempts: number
  flags: string
  tags: string
  hints: string
  type_data: string
  hints_raw?: string[]
  hint_cost?: number[]
}

export interface FbctfTemplate {
  teams: {
    teams: any[]
  }
  levels: {
    levels: any[]
  }
}
