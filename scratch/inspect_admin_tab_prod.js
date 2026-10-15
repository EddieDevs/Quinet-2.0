import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminHtml = fs.readFileSync(path.join(__dirname, '../admin.html'), 'utf-8');

const prodTabIdx = adminHtml.indexOf('id="tab-productos"');
if (prodTabIdx !== -1) {
    console.log(adminHtml.slice(prodTabIdx, prodTabIdx + 2500));
}
