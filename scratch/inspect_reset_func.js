import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminHtml = fs.readFileSync(path.join(__dirname, '../admin.html'), 'utf-8');

const rIdx = adminHtml.indexOf('function resetProductForm');
if (rIdx !== -1) {
    console.log(adminHtml.slice(rIdx, rIdx + 800));
}
