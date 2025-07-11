/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
const hmacSha1 = require("../../lib/hmac");

describe("Flag", () => {
  it("should be a SHA256 HMAC from plain text and given secret key", () => {
    assert.strictEqual(
      hmacSha1("ZJnHOTckstBeJP!QC2T", "text"),
      "5188938396d17832dd26fbabd5ac4d79518a87da"
    );
  });

  it("should be a SHA256 HMAC from plain text and empty secret key", () => {
    assert.strictEqual(
      hmacSha1("", "text"),
      "f3f276f5001644013dbd202f1854bd61f9123d0f"
    );
  });

  it("should be different for different plain texts with same secret key", () => {
    const result1 = hmacSha1("key", "text1");
    const result2 = hmacSha1("key", "text2");
    assert.notEqual(result1, result2);
  });
});
