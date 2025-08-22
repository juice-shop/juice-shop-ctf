/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import calculateScore from '../calculateScore'
import calculateHintCost from '../calculateHintCost'
import hmacSha1 from '../hmac'
import { options as juiceShopOptions } from '../options'
import { type Challenge, type BaseExportSettings, type CtfdChallengeData } from '../types/types'

async function createCtfdExport (
  challenges: Record<string, Challenge>,
  { insertHints, insertHintUrls, insertHintSnippets, ctfKey, vulnSnippets }: BaseExportSettings
): Promise<CtfdChallengeData[]> {
  function insertChallengeHints (challenge: Challenge): string[] {
    const hints: string[] = []
    if (challenge.hint != null && challenge.hint !== '' && insertHints !== juiceShopOptions.noTextHints) {
      hints.push(challenge.hint.replace(/"/g, '""').replace(/,/g, '٬'))
    }
    if (challenge.hintUrl != null && challenge.hintUrl !== '' && insertHintUrls !== juiceShopOptions.noHintUrls) {
      hints.push(challenge.hintUrl)
    }
    const snippet = vulnSnippets?.[challenge.key]
    if (snippet != null && snippet !== '' && insertHintSnippets !== juiceShopOptions.noHintSnippets) {
      hints.push('<pre><code>' + snippet.replace(/"/g, '""').replace(/,/g, '٬') + '</code></pre>')
    }
    return hints
  }

  function insertChallengeHintCosts (challenge: Challenge): number[] {
    const hintCosts: number[] = []
    if (challenge.hint != null && challenge.hint !== '') {
      hintCosts.push(calculateHintCost(challenge, insertHints))
    }
    if (challenge.hintUrl != null && challenge.hintUrl !== '') {
      hintCosts.push(calculateHintCost(challenge, insertHintUrls))
    }
    const snippet = vulnSnippets?.[challenge.key]
    if (snippet != null && snippet !== '') {
      hintCosts.push(calculateHintCost(challenge, insertHintSnippets))
    }
    return hintCosts
  }

  //  In the flags section of the returned data we iterate through the result of string splitting by comma, and compute the hash of the single flag key + challenge name.
  //  Format expected is: challenge3,challenge description,category3,100,dynamic,visible,0,"flag1,flag2,flag3","tag1,tag2,tag3","hint1,hint2,hint3","{""initial"":100, ""minimum"":10, ""decay"":10}"
  //  If we provide a single key with no commas, we do not incapsulate the output in a "" pair.
  return await new Promise<CtfdChallengeData[]>((resolve, reject) => {
    try {
      const data: CtfdChallengeData[] = []
      for (const key in challenges) {
        if (Object.prototype.hasOwnProperty.call(challenges, key)) {
          const challenge = challenges[key]
          const row: CtfdChallengeData = {
            name: challenge.name,
            description: `"${challenge.description.replace(/"/g, '""')} (Difficulty Level: ${challenge.difficulty})"`,
            category: challenge.category,
            value: calculateScore(challenge.difficulty),
            type: 'standard',
            state: 'visible',
            max_attempts: 0,
            flags: ctfKey.split(',').length === 1 ? hmacSha1(ctfKey, challenge.name) : `"${ctfKey.split(',').map(key => `${hmacSha1(key, challenge.name)}`).join(',')}"`,
            tags: (challenge.tags != null && challenge.tags !== '') ? `"${challenge.tags}"` : '',
            hints_raw: insertChallengeHints(challenge),
            hint_cost: insertChallengeHintCosts(challenge),
            type_data: '',
            hints: ''
          }
          const hints: Array<{ content: string, cost: number }> = []
          if (Array.isArray(row.hints_raw) && row.hints_raw.length > 0) {
            for (let index = 0; index < row.hints_raw.length; index++) {
              const hint = {
                content: row.hints_raw[index],
                cost: Array.isArray(row.hint_cost) && row.hint_cost[index] !== undefined ? row.hint_cost[index] : 0
              }
              hints.push(hint)
            }
            const hintsObject = JSON.stringify(hints).replace(/"/g, '""')
            row.hints = `"${hintsObject}"`
          } else {
            row.hints = ''
          }
          delete row.hints_raw
          delete row.hint_cost
          data.push(row)
        }
      }
      resolve(data)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      reject(new Error(`Failed to generate challenge data! ${message}`))
    }
  })
}

export default createCtfdExport
