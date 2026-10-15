import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, '../styles.css');
let css = fs.readFileSync(filePath, 'utf-8');

css = css.replace(
  /:root\s*\{[\s\S]*?\}/,
  `:root { 
    --bg: #03070a; 
    --bg-secondary: #060e13;
    --text: #ffffff;
    --text-muted: #a1b5be;
    --accent: #00F0FF; 
    --glass: rgba(7, 16, 22, 0.78); 
    --glass-border: rgba(0, 240, 255, 0.18);
    --glass-hover: rgba(14, 28, 38, 0.88);
    --radius: 12px; 
    --radius-sm: 6px;
    --radius-pill: 9999px;
    --neon: #00F0FF; 
    --neon-hover: #00d9e6;
    --neon-glow: rgba(0, 240, 255, 0.35);
    --error: #ff4d4f;
    --warning: #ffca16;
    --success: #00F0FF;
    --whatsapp: #25D366;
    --trustpilot: #00b67a;
    --modal-bg: rgba(2, 6, 8, 0.92);
    --admin-input-bg: rgba(6, 14, 20, 0.85);
    --admin-card-bg: rgba(7, 16, 22, 0.78);
    --admin-msg-bg: rgba(0, 0, 0, 0.65);
    --admin-msg-user: rgba(0, 240, 255, 0.12);
}`
);

css = css.replace(
  /:root\.light-mode\s*\{[\s\S]*?\}/,
  `:root.light-mode {
    --bg: #03070a; 
    --bg-secondary: #060e13;
    --text: #ffffff; 
    --text-muted: #a1b5be;
    --accent: #00F0FF;
    --glass: rgba(7, 16, 22, 0.78); 
    --glass-border: rgba(0, 240, 255, 0.18);
    --glass-hover: rgba(14, 28, 38, 0.88);
    --neon: #00F0FF; 
    --neon-hover: #00d9e6;
    --neon-glow: rgba(0, 240, 255, 0.35);
    --modal-bg: rgba(2, 6, 8, 0.92);
    --admin-input-bg: rgba(6, 14, 20, 0.85);
    --admin-card-bg: rgba(7, 16, 22, 0.78);
    --admin-msg-bg: rgba(0, 0, 0, 0.65);
    --admin-msg-user: rgba(0, 240, 255, 0.12);
}`
);

fs.writeFileSync(filePath, css, 'utf-8');
console.log('styles.css updated with turquoise neon values!');
