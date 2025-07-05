/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import * as fs from "fs";
import { promisify } from "util";
import * as path from "path";
const dateFormat = require("dateformat");

// Polyfill writeFileAsync for compatibility with tests
if (!(fs as any).writeFileAsync) {
  (fs as any).writeFileAsync = promisify(fs.writeFile);
}

interface WriteToRtbXmlOptions {
  report: string;
  desiredFileName?: string;
}

async function writeToRtbXml(report: string, desiredFileName?: string): Promise<string> {
  let fileName: string = desiredFileName || 'OWASP_Juice_Shop.' + dateFormat(new Date(), 'yyyy-mm-dd') + '.RTB.xml';
  return (fs as any).writeFileAsync(fileName, report,  { encoding: 'utf8' })
    .then((): string => path.resolve(fileName))
    .catch((err: Error): never => {
      throw new Error("Failed to write output to file! " + err.message);
    });
}

export = writeToRtbXml;
