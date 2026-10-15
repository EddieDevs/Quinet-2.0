import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const orig = fs.readFileSync(path.join(__dirname, '../backup/index.original.html'), 'utf-8');

const dockIdx = orig.indexOf('class="floating-dock"');
if (dockIdx !== -1) {
    console.log(orig.slice(dockIdx, dockIdx + 4000));
}
