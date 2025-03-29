const { describe, test, beforeEach, after } = require("node:test");
const assert = require("assert");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const dateFormat = require("dateformat");

const outputFile =
  "OWASP_Juice_Shop." + dateFormat(new Date(), "yyyy-mm-dd") + ".CTFd.csv";
const desiredCtfdOutputFile = "./output.zip";
const desiredFbctfOutputFile = "./output.json";
const desiredRtbOutputFile = "./output.xml";
const configFile = "config.yml";

const ENTER = "\n";
const DOWN = "\x1B[B";

const TIMEOUT = 30000;

const cleanup = () => {
  if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
  if (fs.existsSync(configFile)) fs.unlinkSync(configFile);
  if (fs.existsSync(desiredCtfdOutputFile))
    fs.unlinkSync(desiredCtfdOutputFile);
  if (fs.existsSync(desiredFbctfOutputFile))
    fs.unlinkSync(desiredFbctfOutputFile);
  if (fs.existsSync(desiredRtbOutputFile)) fs.unlinkSync(desiredRtbOutputFile);
};
const runJuiceShopCtf = async (inputs, options = {}) => {
  return new Promise((resolve, reject) => {
    const { expectError = false, config, output } = options;
    const args = [path.join(__dirname, "../../bin/juice-shop-ctf.js")];

    if (config) args.push("--config", path.resolve(config));
    if (output) args.push("--output", path.resolve(output));
    if (options.ignoreSslWarnings) args.push("--ignoreSslWarnings");

    const cliProcess = spawn("node", args, {
      stdio: ["pipe", "pipe", "pipe"],
      shell: true,
    });

    let stdout = "";
    let stderr = "";
    let timeoutId;

    if (TIMEOUT) {
      timeoutId = setTimeout(() => {
        cliProcess.kill("SIGTERM");
        reject(new Error(`Process timed out after ${TIMEOUT}ms`));
      }, TIMEOUT);
    }

    cliProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    cliProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    cliProcess.on("close", (code) => {
      clearTimeout(timeoutId);
      const combinedOutput = stderr || stdout;

      if (code !== 0 || expectError) {
        if (!combinedOutput) {
          reject(
            new Error(`Process failed with code ${code} but produced no output`)
          );
        } else {
          resolve(combinedOutput);
        }
      } else {
        resolve(stdout);
      }
    });

    cliProcess.on("error", (err) => {
      clearTimeout(timeoutId);
      reject(err);
    });

    if (inputs && inputs.length > 0) {
      const writeInputs = () => {
        if (inputs.length === 0) {
          cliProcess.stdin.end();
          return;
        }
        const input = inputs.shift();
        cliProcess.stdin.write(input);
        setTimeout(writeInputs, 200);
      };
      setTimeout(writeInputs, 1000);
    } else {
      cliProcess.stdin.end();
    }
  });
};

const createConfigFile = (config) => {
  fs.writeFileSync(configFile, config);
};

const assertOutputMatches = (output, pattern, message) => {
  assert.match(output.replace(/\x1B\[\d+m/g, ""), pattern, message);
};

const assertOutputFileExists = (filePath) => {
  assert.ok(
    fs.existsSync(filePath),
    `Expected output file "${filePath}" to exist`
  );
};

describe("juice-shop-ctf", () => {
  beforeEach(cleanup);
  after(cleanup);

  test("should accept defaults for all input questions", async () => {
    const output = await runJuiceShopCtf([
      ENTER, // CTFd
      ENTER, // Default URL
      ENTER, // Default ctf.key
      ENTER, // No text hints
      ENTER, // No hint URLs
      ENTER, // No hint snippets
      ENTER, // Final confirmation
    ]);

    assertOutputMatches(
      output,
      /Backup archive written to .*OWASP_Juice_Shop.*\.CTFd\.csv/i
    );
    assertOutputMatches(output, /CTF framework to generate data for.*CTFd/i);
    assertOutputMatches(
      output,
      /Insert a text hint along with each challenge.*No text hints/i
    );
    assertOutputMatches(
      output,
      /Insert a hint URL along with each challenge.*No hint URLs/i
    );
    assertOutputMatches(
      output,
      /Insert a code snippet as hint for each challenge.*No hint snippets/i
    );
  });

  test("should insert free hints when chosen", async () => {
    const output = await runJuiceShopCtf([
      ENTER, // CTFd
      ENTER, // Default URL
      ENTER, // Default ctf.key
      DOWN,
      ENTER, // Free hints
      ENTER, // No hint URLs
      ENTER, // No hint snippets
    ]);

    assertOutputMatches(
      output,
      /Insert a text hint along with each challenge.*Free text hints/i
    );
  });

  test("should insert paid hints when chosen", async () => {
    const output = await runJuiceShopCtf([
      ENTER, // CTFd
      ENTER, // Default URL
      ENTER, // Default ctf.key
      DOWN,
      DOWN,
      ENTER, // Paid hints
      ENTER, // No hint URLs
      ENTER, // No hint snippets
    ]);

    assertOutputMatches(
      output,
      /Insert a text hint along with each challenge.*Paid text hints/i
    );
  });

  test("should insert free hint URLs when chosen", async () => {
    const output = await runJuiceShopCtf([
      ENTER, // CTFd
      ENTER, // Default URL
      ENTER, // Default ctf.key
      ENTER, // No text hints
      DOWN,
      ENTER, // Free hint URLs
      ENTER, // No hint snippets
    ]);

    assertOutputMatches(
      output,
      /Insert a hint URL along with each challenge.*Free hint URLs/i
    );
  });

  test("should insert paid hint URLs when chosen", async () => {
    const output = await runJuiceShopCtf([
      ENTER, // CTFd
      ENTER, // Default URL
      ENTER, // Default ctf.key
      ENTER, // No text hints
      DOWN,
      DOWN,
      ENTER, // Paid hint URLs
      ENTER, // No hint snippets
    ]);

    assertOutputMatches(
      output,
      /Insert a hint URL along with each challenge.*Paid hint URLs/i
    );
  });

  test("should fail on invalid Juice Shop URL", async () => {
    const output = await runJuiceShopCtf([
      ENTER, // CTFd
      "localhorst",
      ENTER, // Invalid URL
      ENTER, // Default ctf.key
      ENTER, // No text hints
      ENTER, // No hint URLs
      ENTER, // No hint snippets
    ]);

    assertOutputMatches(
      output,
      /Failed to fetch challenges from API!|invalid URL|ECONNREFUSED|Invalid Juice Shop URL|Unable to connect/i
    );
  });

  test("should fail on invalid ctf.key URL", async () => {
    const output = await runJuiceShopCtf([
      ENTER, // CTFd
      ENTER, // Default URL
      "httpx://invalid/ctf-key",
      ENTER, // Invalid ctf.key
      ENTER, // No text hints
      ENTER, // No hint URLs
      ENTER, // No hint snippets
    ]);

    assertOutputMatches(
      output,
      /Failed to fetch secret key from URL!/i, 
    );
  });

  test("should generate a FBCTF export when chosen", async () => {
    const output = await runJuiceShopCtf([
      DOWN,
      ENTER, // FBCTF
      ENTER, // Default URL
      ENTER, // Default ctf.key
      ENTER, // No text hints
      ENTER, // No hint URLs
      ENTER, // No hint snippets
    ]);

    assertOutputMatches(output, /CTF framework to generate data for.*FBCTF/i);
  });

  test("should generate a RootTheBox export when chosen", async () => {
    const output = await runJuiceShopCtf([
      DOWN,
      DOWN,
      ENTER, // RootTheBox
      ENTER, // Default URL
      ENTER, // Default ctf.key
      ENTER, // No text hints
      ENTER, // No hint URLs
      ENTER, // No hint snippets
    ]);

    assertOutputMatches(
      output,
      /CTF framework to generate data for.*RootTheBox/i
    );
  });

  test("should accept a config file", async () => {
    createConfigFile(`
  juiceShopUrl: https://juice-shop.herokuapp.com
  ctfKey: https://raw.githubusercontent.com/bkimminich/juice-shop/master/ctf.key
  insertHints: paid
  insertHintUrls: paid
  insertHintSnippets: paid`);

    const output = await runJuiceShopCtf([], { config: configFile });
    assertOutputMatches(output, /Backup archive written to /i);
  });

  test("should be able to ignore SslWarnings", async () => {
    createConfigFile(`
  juiceShopUrl: https://juice-shop.herokuapp.com
  ctfKey: https://raw.githubusercontent.com/bkimminich/juice-shop/master/ctf.key
  insertHints: paid
  insertHintUrls: paid
  insertHintSnippets: paid`);

    const output = await runJuiceShopCtf([], {
      config: configFile,
      ignoreSslWarnings: true,
    });
    assertOutputMatches(output, /Backup archive written to /i);
  });

  test("should fail when the config file cannot be parsed", async function () {
    createConfigFile(`
  juiceShopUrl: https://juice-shop.herokuapp.com
  ctfKey: https://raw.githubusercontent.com/bkimminich/juice-shop/master/ctf.key
  insertHints`);

    const output = await runJuiceShopCtf([], {
      config: configFile,
      expectError: true,
    });

    assertOutputMatches(
      output,
      /can not read an implicit mapping pair; a colon is missed/i,
    );
  });

  test("should fail when the config file contains invalid values", async () => {
    createConfigFile(`
  juiceShopUrl: https://juice-shop.herokuapp.com
  ctfKey: https://raw.githubusercontent.com/bkimminich/juice-shop/master/ctf.key
  insertHints: paid
  insertHintUrls: invalidValue
  insertHintSnippets: paid`);

    const output = await runJuiceShopCtf([], {
      config: configFile,
    });

    assertOutputMatches(
      output,
      /"insertHintUrls" must be one of \[none, free, paid\]/i,
    );
  });

  test("should write the output file to the specified location", async () => {
    createConfigFile(`
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/bkimminich/juice-shop/master/ctf.key
insertHints: paid
insertHintUrls: paid
insertHintSnippets: paid`);

    await runJuiceShopCtf([], {
      config: configFile,
      output: desiredCtfdOutputFile,
    });
    assertOutputFileExists(desiredCtfdOutputFile);
  });

  test("should be possible to create a CTFd export with a config file", async () => {
    createConfigFile(`
ctfFramework: CTFd
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/bkimminich/juice-shop/master/ctf.key
insertHints: paid
insertHintUrls: paid
insertHintSnippets: paid`);

    await runJuiceShopCtf([], {
      config: configFile,
      output: desiredCtfdOutputFile,
    });
    assertOutputFileExists(desiredCtfdOutputFile);
  });

  test("should be possible to create a FBCTF export with a config file", async () => {
    createConfigFile(`
ctfFramework: FBCTF
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/bkimminich/juice-shop/master/ctf.key
countryMapping: https://raw.githubusercontent.com/bkimminich/juice-shop/master/config/fbctf.yml
insertHints: paid
insertHintUrls: paid
insertHintSnippets: paid`);

    await runJuiceShopCtf([], {
      config: configFile,
      output: desiredFbctfOutputFile,
    });
    assertOutputFileExists(desiredFbctfOutputFile);
  });

  test("should be possible to create a RootTheBox export with a config file", async () => {
    createConfigFile(`
ctfFramework: RootTheBox
juiceShopUrl: https://juice-shop.herokuapp.com
ctfKey: https://raw.githubusercontent.com/bkimminich/juice-shop/master/ctf.key
insertHints: paid
insertHintUrls: paid
insertHintSnippets: paid`);

    await runJuiceShopCtf([], {
      config: configFile,
      output: desiredRtbOutputFile,
    });
    assertOutputFileExists(desiredRtbOutputFile);
  });

  test("should fail when output file cannot be written", async () => {
    
    fs.writeFileSync(outputFile, "");
    fs.chmodSync(outputFile, 0o400); 

    const output = await runJuiceShopCtf([
      ENTER, // CTFd
      ENTER, // Default URL
      ENTER, // Default ctf.key
      ENTER, // No text hints
      ENTER, // No hint URLs
      ENTER, // No hint snippets
    ]);
    
    fs.chmodSync(outputFile, 0o600);

    assertOutputMatches(
      output,
      /Failed to write output to file!/i,
    );
  });
});
