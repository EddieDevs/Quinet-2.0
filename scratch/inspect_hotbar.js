import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const orig = fs.readFileSync(path.join(__dirname, '../backup/index.original.html'), 'utf-8');

// Find all matches for dock or hotbar or calc
const dockMatches = [...orig.matchAll(/class="[^"]*(?:dock|bar|bottom)[^"]*"/gi)].map(m => m[0]);
console.log('Dock classes:', Array.from(new Set(dockMatches)));

const dockIdx = orig.indexOf('class="dock"');
if (dockIdx !== -1) {
    console.log('Dock HTML:\n', orig.slice(dockIdx - 50, dockIdx + 2000));
} else {
    // search for calc button or floating bar
    const calcIdx = orig.indexOf('calc-modal');
    console.log('Calc references in HTML:\n', orig.slice(calcIdx - 200, calcIdx + 600));
}

// Check where calculator was opened
const calcOpen = [...orig.matchAll(/calc-modal.*?\n/g)].map(m => m[0]);
console.log('Calc open lines:', calcOpen);
