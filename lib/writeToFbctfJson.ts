/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as fs from "fs";
import { promisify } from "util";
import * as path from "path";
const dateFormat = require("dateformat");

if (!(fs as any).writeFileAsync) {
  (fs as any).writeFileAsync = promisify(fs.writeFile);
}

interface FbctfReport {
  [key: string]: any;
}

async function writeToFbctfJson(
  report: FbctfReport,
  desiredFileName?: string
): Promise<string> {
  const fileName =
    desiredFileName ||
    "OWASP_Juice_Shop." + dateFormat(new Date(), "yyyy-mm-dd") + ".FBCTF.json";

  return (fs as any)
    .writeFileAsync(fileName, JSON.stringify(report, null, 2),  { encoding: 'utf8' })
    .then(() => path.resolve(fileName))
    .catch((err: Error) => {
      throw new Error("Failed to write output to file! " + err.message);
    });
}

export = writeToFbctfJson;
