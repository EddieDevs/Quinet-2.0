import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminHtml = fs.readFileSync(path.join(__dirname, '../admin.html'), 'utf-8');

const loadProdIdx = adminHtml.indexOf('window.loadProductToEditById =');
if (loadProdIdx !== -1) {
    console.log(adminHtml.slice(loadProdIdx, loadProdIdx + 1500));
}
