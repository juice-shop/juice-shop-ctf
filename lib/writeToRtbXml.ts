/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as fs from "fs";
import { promisify } from "util";
import * as path from "path";
const dateFormat = require("dateformat");

// Polyfill writeFileAsync for compatibility with tests
const writeFileAsync = promisify(fs.writeFile);

interface WriteToRtbXmlOptions {
  report: string;
  desiredFileName?: string;
}

async function writeToRtbXml(
  report: string,
  desiredFileName?: string
): Promise<string> {
  let fileName: string =
    desiredFileName ||
    "OWASP_Juice_Shop." + dateFormat(new Date(), "yyyy-mm-dd") + ".RTB.xml";
  await writeFileAsync(fileName, JSON.stringify(report, null, 2), {
    encoding: "utf8",
  });
  console.log(`Backup archive written to ${path.resolve(fileName).green}`);
  return path.resolve(fileName);
}

export = writeToRtbXml;
