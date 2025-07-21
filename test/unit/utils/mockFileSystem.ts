/*
 * Copyright (c) 2016-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { mock } from 'node:test'
import fs from 'fs'

export interface WriteFileCallback {
  (err: NodeJS.ErrnoException | null): void;
}

export interface WriteFileOptions {
  encoding?: string | null;
  mode?: number | string;
  flag?: string;
}

export type WriteFileFn = (
  filePath: string,
  data: string,
  options?: WriteFileOptions | WriteFileCallback,
  callback?: WriteFileCallback
) => void;

export const getFileNamePattern = (extension: string) =>
  new RegExp(`OWASP_Juice_Shop\\.(19|20)\\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])\\.${extension}`);

export function mockWriteFile(impl: WriteFileFn) {
  mock.method(fs, 'writeFile', impl)
}