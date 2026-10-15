import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, '../admin.html');
let html = fs.readFileSync(filePath, 'utf-8');

const targetStr = `                        <select id="p-duracion" class="admin-select">
                            <option value="1 mes">1 mes</option>
                            <option value="3 meses">3 meses</option>
                            <option value="6 meses">6 meses</option>
                            <option value="1 año">1 año</option>
                        </select>
                    </div>`;

const replacementStr = `                        <select id="p-duracion" class="admin-select">
                            <option value="1 mes">1 mes</option>
                            <option value="3 meses">3 meses</option>
                            <option value="6 meses">6 meses</option>
                            <option value="1 año">1 año</option>
                        </select>
                    </div>

                    <!-- GESTOR VISUAL DE PLANES Y DURACIONES -->
                    <div id="div-plans-builder" style="margin-top: 15px; background: rgba(0, 255, 136, 0.05); border: 1px solid rgba(0, 255, 136, 0.2); border-radius: 8px; padding: 12px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <label style="font-size: 0.72rem; color: var(--neon); font-weight: bold; margin:0;">
                                PLANES Y DURACIONES (CLIENTE):
                            </label>
                            <button type="button" onclick="window.adminAutoSuggestPlans()" class="btn-small" style="font-size:0.65rem; padding:3px 8px; border-color:var(--neon); color:var(--neon); background:transparent;">
                                ⚡ Sugerir Planes
                            </button>
                        </div>
                        <p style="font-size:0.65rem; color:var(--text-muted); margin-bottom:10px; line-height:1.3;">
                            Personaliza las opciones de duración y precios para suscripciones. El cliente podrá elegir entre estos planes.
                        </p>
                        <div id="admin-plans-list" style="display:flex; flex-direction:column; gap:8px; margin-bottom:10px;"></div>
                        <button type="button" onclick="window.adminAddPlanRow()" class="btn-small" style="width:100%; font-size:0.72rem; padding:7px; border-color:var(--neon); color:var(--neon); background:rgba(0,255,136,0.08);">
                            + AGREGAR DURACIÓN / PLAN
                        </button>
                    </div>`;

if (html.includes(targetStr)) {
    html = html.replace(targetStr, replacementStr);
    fs.writeFileSync(filePath, html, 'utf-8');
    console.log('Successfully inserted plans builder HTML into admin.html!');
} else {
    console.error('Target string not found in admin.html!');
}
