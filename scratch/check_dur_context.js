import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, '../admin.html');
let html = fs.readFileSync(filePath, 'utf-8');

const durIdx = html.indexOf('id="div-duracion"');
console.log('div-duracion context:\n', html.slice(durIdx - 50, durIdx + 600));
