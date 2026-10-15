import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stylesCss = fs.readFileSync(path.join(__dirname, '../styles.css'), 'utf-8');

console.log('styles.css total length:', stylesCss.length);
// Check occurrences of --neon and color properties
const neonMatches = [...stylesCss.matchAll(/--neon[a-zA-Z-]*:\s*([^;]+);/g)].map(m => m[0]);
console.log('Neon color vars in styles.css:', neonMatches);
