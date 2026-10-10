import fs from 'node:fs';

const code = fs.readFileSync('script.js', 'utf8');
const stack = [];
let inStr = null;
let inLineComment = false;
let inBlockComment = false;

const lines = code.split('\n');

for (let lineNum = 1; lineNum <= lines.length; lineNum++) {
  const line = lines[lineNum - 1];
  for (let col = 0; col < line.length; col++) {
    const ch = line[col];
    const next = line[col + 1];

    if (inLineComment) continue;

    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        col++;
      }
      continue;
    }

    if (inStr) {
      if (ch === '\\') {
        col++;
      } else if (ch === inStr) {
        inStr = null;
      }
      continue;
    }

    if (ch === '/' && next === '/') {
      inLineComment = true;
      break;
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true;
      col++;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === '`') {
      inStr = ch;
      continue;
    }

    if (ch === '{' || ch === '(' || ch === '[') {
      stack.push({ ch, line: lineNum, col: col + 1, text: line.trim() });
    } else if (ch === '}' || ch === ')' || ch === ']') {
      const last = stack[stack.length - 1];
      if (
        (ch === '}' && last?.ch === '{') ||
        (ch === ')' && last?.ch === '(') ||
        (ch === ']' && last?.ch === '[')
      ) {
        stack.pop();
      }
    }
  }
  inLineComment = false;
}

console.log("Unclosed items count:", stack.length);
console.log("Last 5 unclosed items:", JSON.stringify(stack.slice(-5), null, 2));
