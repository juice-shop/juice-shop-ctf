/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import assert from "node:assert";
import { describe, it } from "node:test";
import fetchChallenges from "../../lib/fetchChallenges";

describe("Challenges", () => {
  it("should be fetched from the given URL", async () => {
    const result = await fetchChallenges("http://localhost:3000", false, {
      fetch: async () => {
        return new Response(JSON.stringify({ data: { c1: {}, c2: {} } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    });

    assert.deepEqual(result, { c1: {}, c2: {} });
  });

  it("should log retrieval error to console", async () => {
    await assert.rejects(
      () => fetchChallenges("http://localh_%&$§rst:3000", false, {
        fetch: async () => {
          throw new Error("Argh!");
        }
      }),
      /Failed to fetch challenges from API! Argh!/
    );
  });
});
