/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { options } from "../options"

export interface Challenge {
  key: string
  name: string
  description: string
  difficulty: number
  category: string
  hint?: string
  hintUrl?: string
  tags?: string | null
  id?: number
  [key: string]: any
}

export interface BaseExportSettings {
  insertHints: typeof options.freeTextHints | typeof options.paidTextHints | typeof options.noTextHints
  insertHintUrls: typeof options.freeHintUrls | typeof options.paidHintUrls | typeof options.noHintUrls
  insertHintSnippets: typeof options.freeHintSnippets | typeof options.paidHintSnippets | typeof options.noHintSnippets
  ctfKey: string
  outputLocation: string
  vulnSnippets: Record<string, string>
  juiceShopUrl: string
}

export interface FbctfExportSettings extends BaseExportSettings {
  countryMapping: Record<string, {code: string, name?: string}>
}

export interface CountryMapping {
  [key: string]: { 
    code: string
    name?: string 
  }
}

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

