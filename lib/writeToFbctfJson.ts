/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as fs from "fs";
import { promisify } from "util";
import * as path from "path";
const dateFormat = require("dateformat");


const writeFileAsync = promisify(fs.writeFile);

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

  await writeFileAsync(fileName, JSON.stringify(report, null, 2), {
    encoding: "utf8",
  });
  console.log(`Backup archive written to ${path.resolve(fileName).green}`);
  return path.resolve(fileName);
}
export = writeToFbctfJson;
