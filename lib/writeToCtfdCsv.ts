/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import dateFormat from "dateformat";
import fs from "node:fs/promises";
import * as path from "node:path";

interface CtfdCsvRow {
  [key: string]: string | number | boolean | null | undefined;
}

 async function writeToCtfdCsv(
  data: CtfdCsvRow[],
  desiredFileName?: string
): Promise<string> {
  const fileName =
    desiredFileName ||
    "OWASP_Juice_Shop." + dateFormat(new Date(), "yyyy-mm-dd") + ".CTFd.csv";

  try {
    const csvContent = convertToCSV(data);
    await fs.writeFile(fileName, csvContent, { encoding: "utf8" });
    return path.resolve(fileName);
  } catch (error) {
    throw new Error(
      "Failed to write output to file! " + (error as Error)?.message
    );
  }
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

export default writeToCtfdCsv;