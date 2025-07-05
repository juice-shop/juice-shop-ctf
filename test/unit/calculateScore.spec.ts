/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import calculateScore from "../../lib/calculateScore";

describe("Score", () => {
  it("should be 100 points for a * challenge", () => {
    assert.strictEqual(calculateScore(1), 100);
  });

  it("should be 250 points for a ** challenge", () => {
    assert.strictEqual(calculateScore(2), 250);
  });

  it("should be 450 points for a *** challenge", () => {
    assert.strictEqual(calculateScore(3), 450);
  });

  it("should be 700 points for a **** challenge", () => {
    assert.strictEqual(calculateScore(4), 700);
  });

  it("should be 1000 points for a ***** challenge", () => {
    assert.strictEqual(calculateScore(5), 1000);
  });

  it("should be 1350 points for a ****** challenge", () => {
    assert.strictEqual(calculateScore(6), 1350);
  });
});
