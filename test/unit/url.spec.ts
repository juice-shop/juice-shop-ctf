/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import assert from "node:assert";
import { describe, it } from "node:test";
import {isUrl} from "../../lib/url";

describe("URL", () => {
  it("should be recognized on given valid HTTP URL", () => {
    assert.strictEqual(isUrl("http://domain"), true);
  });

  it("should be recognized on given valid HTTPS URL", () => {
    assert.strictEqual(isUrl("https://domain"), true);
  });

  it("should be recognized on given valid IP address", () => {
    assert.strictEqual(isUrl("127.0.0.1"), true);
  });

  it("should not be recognized on given HMAC key", () => {
    assert.strictEqual(isUrl("ZRwakRJnHOTckstBeyJbyswgP!QC2T"), false);
  });
});
