/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import assert from "node:assert";
import { describe, it } from "node:test";
import rewire from "rewire";

const fetchChallengesModule = rewire("../../lib/fetchChallenges");
const fetchChallenges = fetchChallengesModule.default || fetchChallengesModule;

describe("Challenges", () => {
  it("should be fetched from the given URL", async () => {
    fetchChallengesModule.__set__({
      fetch: async () => {
        return {
          ok: true,
          json: async () => ({ data: { c1: {}, c2: {} } }),
        };
      },
    });
    const result = await fetchChallenges("http://localhost:3000");
    assert.deepEqual(result, { c1: {}, c2: {} });
  });
  it("should log retrieval error to console", async () => {
    fetchChallengesModule.__set__({
      fetch: async () => {
        throw new Error("Argh!");
      },
    });
    await assert.rejects(
      () => fetchChallenges("http://localh_%&$§rst:3000"),
      /Failed to fetch challenges from API! Argh!/
    );
  });
});
