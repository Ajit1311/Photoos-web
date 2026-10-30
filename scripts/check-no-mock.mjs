#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const SCAN_DIRS = ["app", "components", "lib", "services", "context"];
const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

const BANNED_PATTERNS = [
  { regex: /picsum\.photos/i, name: "Picsum placeholder URL" },
  { regex: /placeholder\.com/i, name: "Placeholder.com URL" },
  { regex: /pravatar\.cc/i, name: "Pravatar dummy avatar URL" },
  { regex: /images\.unsplash\.com/i, name: "Unsplash stock photo URL" },
  { regex: /lorem\s+ipsum/i, name: "Lorem ipsum text" },
  { regex: /\bfaker\b/i, name: "Faker library / generator" },
  { regex: /"demo-gallery-id"/, name: "Demo gallery ID" },
  { regex: /"lead_demo_01"/, name: "Demo lead ID" },
  { regex: /SEED_MARKETPLACE_STUDIOS/, name: "Fake marketplace studio seed" },
  { regex: /\b(?:Sandeep\s+More|Pooja\s+Kulkarni|Rajesh\s+Shinde)\b/, name: "Hardcoded fake user name" },
  { regex: /\b9822012345\b/, name: "Hardcoded fake phone number" },
];

function shouldScanFile(filePath) {
  const ext = path.extname(filePath);
  if (!EXTENSIONS.includes(ext)) return false;

  const base = path.basename(filePath);
  if (base.includes(".bak") || base.includes(".backup") || base.includes(".tmp")) {
    return false;
  }
  return true;
}

function scanDirectory(dir, violations) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") {
        continue;
      }
      scanDirectory(fullPath, violations);
    } else if (entry.isFile() && shouldScanFile(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, lineIdx) => {
        // Skip comment lines mentioning check-no-mock or policy explanations
        if (line.includes("check:no-mock") || line.includes("NO MOCK DATA POLICY")) {
          return;
        }

        for (const pattern of BANNED_PATTERNS) {
          if (pattern.regex.test(line)) {
            violations.push({
              file: fullPath,
              line: lineIdx + 1,
              rule: pattern.name,
              preview: line.trim(),
            });
          }
        }
      });
    }
  }
}

function runCheck() {
  const violations = [];

  for (const dir of SCAN_DIRS) {
    scanDirectory(path.resolve(process.cwd(), dir), violations);
  }

  if (violations.length > 0) {
    console.error("\n❌ [check:no-mock] Found mock/placeholder data violations:");
    violations.forEach((v) => {
      console.error(`  - ${v.file}:${v.line} [${v.rule}] -> "${v.preview}"`);
    });
    console.error(`\nTotal violations: ${violations.length}. Please replace with real DB queries or clean empty states.\n`);
    process.exit(1);
  }

  console.log("\n✅ [check:no-mock] Passed! Zero mock, dummy, or fake data detected across codebase.\n");
  process.exit(0);
}

runCheck();

