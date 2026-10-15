import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const origCss = fs.readFileSync(path.join(__dirname, '../backup/styles.original.css'), 'utf-8');

const dockCssIdx = origCss.indexOf('.floating-dock');
if (dockCssIdx !== -1) {
    console.log(origCss.slice(dockCssIdx, dockCssIdx + 1200));
}
