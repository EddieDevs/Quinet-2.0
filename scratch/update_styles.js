import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, '../styles.css');
let css = fs.readFileSync(filePath, 'utf-8');

// Replace CSS variables at the root
css = css.replace(
  /:root\s*\{[\s\S]*?\}/,
  `:root { 
    --bg: #000000; 
    --bg-secondary: #060a08;
    --text: #ffffff;
    --text-muted: #a1b0a6;
    --accent: #00FF88; 
    --glass: rgba(10, 16, 12, 0.72); 
    --glass-border: rgba(0, 255, 136, 0.14);
    --glass-hover: rgba(18, 30, 24, 0.85);
    --radius: 16px; 
    --radius-sm: 8px;
    --radius-pill: 9999px;
    --neon: #00FF88; 
    --neon-hover: #33ff9f;
    --neon-glow: rgba(0, 255, 136, 0.35);
    --error: #ff4d4f;
    --warning: #ffca16;
    --success: #00FF88;
    --whatsapp: #25D366;
    --trustpilot: #00FF88;
    --modal-bg: rgba(0, 0, 0, 0.9);
    --admin-input-bg: rgba(10, 16, 12, 0.85);
    --admin-card-bg: rgba(10, 16, 12, 0.72);
    --admin-msg-bg: rgba(0, 0, 0, 0.65);
    --admin-msg-user: rgba(0, 255, 136, 0.12);
}`
);

// Replace light mode to also stay dark tech green & black
css = css.replace(
  /:root\.light-mode\s*\{[\s\S]*?\}/,
  `:root.light-mode {
    --bg: #000000; 
    --bg-secondary: #060a08;
    --text: #ffffff; 
    --text-muted: #a1b0a6;
    --accent: #00FF88;
    --glass: rgba(10, 16, 12, 0.72); 
    --glass-border: rgba(0, 255, 136, 0.14);
    --glass-hover: rgba(18, 30, 24, 0.85);
    --neon: #00FF88; 
    --neon-hover: #33ff9f;
    --neon-glow: rgba(0, 255, 136, 0.35);
    --modal-bg: rgba(0, 0, 0, 0.9);
    --admin-input-bg: rgba(10, 16, 12, 0.85);
    --admin-card-bg: rgba(10, 16, 12, 0.72);
    --admin-msg-bg: rgba(0, 0, 0, 0.65);
    --admin-msg-user: rgba(0, 255, 136, 0.12);
}`
);

fs.writeFileSync(filePath, css, 'utf-8');
console.log('styles.css updated with tech green and void black tokens successfully!');
