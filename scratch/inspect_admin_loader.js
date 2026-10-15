import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminHtml = fs.readFileSync(path.join(__dirname, '../admin.html'), 'utf-8');

// Check loader hide code
const loaderMatches = [...adminHtml.matchAll(/loader/gi)].map(m => m[0]);
console.log('Loader occurrences:', loaderMatches.length);

const loaderHideIdx = adminHtml.indexOf("document.getElementById('loader')");
if (loaderHideIdx !== -1) {
    console.log('Loader hide code:\n', adminHtml.slice(loaderHideIdx - 50, loaderHideIdx + 300));
}

// Check where resetProductForm or btnCancelEdit is
const resetProdIdx = adminHtml.indexOf('btnCancelEdit');
if (resetProdIdx !== -1) {
    console.log('Cancel edit / reset prod code:\n', adminHtml.slice(resetProdIdx - 50, resetProdIdx + 800));
}
