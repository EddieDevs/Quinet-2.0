import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminHtml = fs.readFileSync(path.join(__dirname, '../admin.html'), 'utf-8');

const cancelIdx = adminHtml.indexOf("document.getElementById('btnCancelEdit').onclick");
if (cancelIdx !== -1) {
    console.log(adminHtml.slice(cancelIdx - 50, cancelIdx + 1200));
}
