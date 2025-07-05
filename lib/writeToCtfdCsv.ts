/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import dateFormat from "dateformat";
import * as fsModule from "fs";
import * as path from "path";

const fs = fsModule.promises;
interface CtfdCsvRow {
  [key: string]: string | number | boolean | null | undefined;
}

function writeToCtfdCsv(
  data: CtfdCsvRow[],
  desiredFileName?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileName =
      desiredFileName ||
      "OWASP_Juice_Shop." + dateFormat(new Date(), "yyyy-mm-dd") + ".CTFd.csv";
    fs.writeFile(fileName, convertToCSV(data), "utf8")
      .then(() => {
        resolve(path.resolve(fileName));
      })
      .catch(({ message }: { message: string }) => {
        reject(new Error("Failed to write output to file! " + message));
      });
  });
}

interface CsvRow {
  [key: string]: string | number | boolean | null | undefined;
}

function convertToCSV(arr: CsvRow[]): string {
  if (arr.length === 0) return "";
  const header = Object.keys(arr[0]);
  const rows = arr.map((row) =>
    header.map((field) => String(row[field] ?? ""))
  );
  const array = [header, ...rows];

  return array.map((it: string[]) => it.toString()).join("\n");
}

export = writeToCtfdCsv;
