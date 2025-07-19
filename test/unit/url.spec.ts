/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
import assert from "node:assert";
import { describe, it } from "node:test";
const isUrl = require("../../lib/url"); 
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

  it("should be recognized on given localhost URL", () => {
    assert.strictEqual(isUrl("localhost"), true);
    assert.strictEqual(isUrl("localhost:3000"), true);
    assert.strictEqual(isUrl("http://localhost:3000"), true);
  });

  it("should be recognized on given subdomain HTTP URL", () => {
    assert.strictEqual(isUrl("http://sub.domain.com"), true);
  });

  it("should not be recognized on random string", () => {
    assert.strictEqual(isUrl("notAUrl"), false);
    assert.strictEqual(isUrl("example"), false);
  });

  it("should not be recognized on empty string", () => {
    assert.strictEqual(isUrl(""), false);
  });

  it("should be recognized on given IP with port", () => {
    assert.strictEqual(isUrl("192.168.1.1:8080"), true);
  });

  it("should not be recognized on email address", () => {
    assert.strictEqual(isUrl("user@example.com"), false);
  });

  it("should be recognized on given HTTP URL with path", () => {
    assert.strictEqual(isUrl("http://domain/path/to/resource"), true);
  });

  it("should be recognized on given HTTPS URL with query", () => {
    assert.strictEqual(isUrl("https://domain?query=1"), true);
  });
});

