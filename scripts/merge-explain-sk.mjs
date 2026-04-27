/**
 * Merges lib/learning/sk-explain/d*.json into lib/learning/questions.json (explainSk),
 * then rewrites the QUESTIONS block in public/learning-app/data.js.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const skDir = path.join(root, "lib/learning/sk-explain");
const questionsPath = path.join(root, "lib/learning/questions.json");
const dataJsPath = path.join(root, "public/learning-app/data.js");

const skMap = {};
for (const name of fs.readdirSync(skDir)) {
  if (!name.endsWith(".json")) continue;
  const p = path.join(skDir, name);
  Object.assign(skMap, JSON.parse(fs.readFileSync(p, "utf8")));
}

const questions = JSON.parse(fs.readFileSync(questionsPath, "utf8"));
for (const q of questions) {
  const sk = skMap[q.id];
  if (sk) q.explainSk = sk;
  else delete q.explainSk;
}
fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2) + "\n");

function lineForQuestion(q, prevDomain) {
  let prefix = "  ";
  if (prevDomain !== q.domain) {
    prefix = `\n  /* ===== DOMAIN ${q.domain} ===== */\n  `;
  }
  let line =
    prefix +
    `{ id: ${JSON.stringify(q.id)}, domain: ${q.domain}, q: ${JSON.stringify(q.q)}, options: [${q.options.map((o) => JSON.stringify(o)).join(",")}], answer: ${q.answer}, explain: ${JSON.stringify(q.explain)}`;
  if (q.explainSk) line += `, explainSk: ${JSON.stringify(q.explainSk)}`;
  line += " }";
  return { line, domain: q.domain };
}

let dataJs = fs.readFileSync(dataJsPath, "utf8");
const startMarker = "const QUESTIONS = [";
const endSuffix = "\n];\n\n/* Convenience exports */";
const start = dataJs.indexOf(startMarker);
const end = start === -1 ? -1 : dataJs.indexOf(endSuffix, start);
if (start === -1 || end === -1 || end <= start) {
  console.error("Could not find QUESTIONS block markers in data.js");
  process.exit(1);
}

let prevDomain = null;
const lines = [];
for (const q of questions) {
  const { line, domain } = lineForQuestion(q, prevDomain);
  lines.push(line);
  prevDomain = domain;
}
const newBlock = `${startMarker}\n${lines.join(",\n")}${endSuffix}`;
dataJs = dataJs.slice(0, start) + newBlock + dataJs.slice(end + endSuffix.length);
fs.writeFileSync(dataJsPath, dataJs);

console.log("Merged explainSk for", Object.keys(skMap).length, "keys into", questions.length, "questions.");
console.log("Updated", path.relative(root, questionsPath), "and", path.relative(root, dataJsPath));
