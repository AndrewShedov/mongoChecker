#!/usr/bin/env node
import { runMongoChecker } from "./mongo-checker.js";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

/* --- load user config --- */
const configPath = path.resolve(process.cwd(), "./mongo-checker.config.js");

if (!fs.existsSync(configPath)) {
  console.error("❌ Configuration file - mongo-checker.config.js, not found.");
  process.exit(1);
}

let config;
try {
  const configUrl = pathToFileURL(configPath).href;
  const imported = await import(configUrl);
  config = imported.default || imported;
} catch (err) {
  console.error("❌ Error loading configuration file:", err.message);
  process.exit(1);
}

/* --- run tool --- */
runMongoChecker(config).catch((err) => {
  console.error("❌ Execution error:", err.message);
  process.exit(1);
});

export { runMongoChecker };
