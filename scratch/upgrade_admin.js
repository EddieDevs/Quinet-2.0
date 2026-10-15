import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, '../admin.html');
let html = fs.readFileSync(filePath, 'utf-8');

// 1. Remove initial blocking loader
html = html.replace(
  /<!-- PANTALLA DE CARGA -->\s*<div id="loader" class="loader-container">[\s\S]*?<\/div>/,
  '<!-- PANTALLA DE CARGA ELIMINADA PARA INICIO INMEDIATO -->'
);

// 2. Ensure admin-dashboard is displayed without waiting on loader
html = html.replace('id="admin-dashboard" style="display: none;"', 'id="admin-dashboard" style="display: block;"');

// 3. Insert the visual Plans Builder into form-container
const targetDuracion = '</div>\n\n                    <label style="font-size: 0.7rem; color: var(--text-muted); margin-top: 10px; display: block;">Estado / Stock:</label>';
const plansBuilderHtml = `</div>

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
                    </div>

                    <label style="font-size: 0.7rem; color: var(--text-muted); margin-top: 10px; display: block;">Estado / Stock:</label>`;

if (html.includes(targetDuracion)) {
    html = html.replace(targetDuracion, plansBuilderHtml);
    console.log('Plans builder HTML inserted successfully.');
} else {
    console.warn('Target duracion not found, searching alternative insertion point...');
}

// 4. Add the JavaScript handlers for Plans Builder in admin.html
const scriptInjectionMarker = '// ======================= GESTOR DE PRODUCTOS (INVENTARIO) =======================';
const plansJsCode = `// ======================= GESTOR DE PLANES Y DURACIONES =======================
        const PLANS_CONFIG_PREFIX = '<!--PLANS_CONFIG:';
        const PLANS_CONFIG_SUFFIX = '-->';
        window.adminCurrentPlans = [];

        window.renderAdminPlansList = () => {
            const list = document.getElementById('admin-plans-list');
            if (!list) return;
            if (!window.adminCurrentPlans || window.adminCurrentPlans.length === 0) {
                list.innerHTML = '<div style="font-size:0.68rem; color:var(--text-muted); text-align:center; padding:8px;">Sin planes personalizados (usará duración base o cálculo estándar).</div>';
                return;
            }

            list.innerHTML = window.adminCurrentPlans.map((plan, idx) => \`
                <div style="background:rgba(0,0,0,0.4); border:1px solid var(--glass-border); border-radius:6px; padding:8px; font-size:0.75rem;">
                    <div style="display:flex; gap:6px; margin-bottom:6px;">
                        <input type="text" placeholder="Duración (ej. 3 Meses)" value="\${plan.duration || ''}" oninput="window.adminUpdatePlan(\${idx}, 'duration', this.value); window.adminUpdatePlan(\${idx}, 'name', 'Plan ' + this.value);" style="flex:1; padding:4px 6px; font-size:0.75rem; margin:0;">
                        <input type="number" placeholder="Precio ($)" value="\${plan.priceUSD || ''}" step="any" oninput="window.adminUpdatePlan(\${idx}, 'priceUSD', parseFloat(this.value))" style="width:75px; padding:4px 6px; font-size:0.75rem; margin:0;">
                        <button type="button" onclick="window.adminRemovePlanRow(\${idx})" style="padding:2px 6px; font-size:0.7rem; border-color:var(--error); color:var(--error); background:transparent;">✕</button>
                    </div>
                    <div style="display:flex; gap:6px;">
                        <input type="text" placeholder="Ahorro (ej. Ahorra 10%)" value="\${plan.savings || ''}" oninput="window.adminUpdatePlan(\${idx}, 'savings', this.value)" style="flex:1; padding:3px 6px; font-size:0.7rem; margin:0;">
                        <input type="text" placeholder="Caract. (ej. 4K, PIN)" value="\${(plan.features || []).join(', ')}" oninput="window.adminUpdatePlan(\${idx}, 'features', this.value.split(',').map(s=>s.trim()))" style="flex:1.5; padding:3px 6px; font-size:0.7rem; margin:0;">
                    </div>
                </div>
            \`).join('');
        };

        window.adminAddPlanRow = (planObj = null) => {
            const basePrice = parseFloat(document.getElementById('p-price').value) || 4.5;
            const newPlan = planObj || {
                id: 'plan-' + Date.now() + '-' + Math.floor(Math.random() * 100),
                name: 'Plan 1 Mes',
                duration: '1 Mes',
                priceUSD: basePrice,
                savings: '',
                features: ['1 Pantalla privada', 'Ultra HD 4K', 'Garantía activa']
            };
            window.adminCurrentPlans.push(newPlan);
            window.renderAdminPlansList();
        };

        window.adminRemovePlanRow = (idx) => {
            window.adminCurrentPlans.splice(idx, 1);
            window.renderAdminPlansList();
        };

        window.adminUpdatePlan = (idx, field, val) => {
            if (window.adminCurrentPlans[idx]) {
                window.adminCurrentPlans[idx][field] = val;
            }
        };

        window.adminAutoSuggestPlans = () => {
            const basePrice = parseFloat(document.getElementById('p-price').value);
            if (!basePrice || isNaN(basePrice) || basePrice <= 0) {
                return alert('Por favor ingresa primero el precio base en USD ($) del producto.');
            }
            window.adminCurrentPlans = [
                {
                    id: 'plan-1m',
                    name: 'Plan 1 Mes',
                    duration: '1 Mes',
                    priceUSD: basePrice,
                    savings: '',
                    features: ['1 Pantalla privada con PIN', 'Calidad Ultra HD 4K', 'Garantía 30 días']
                },
                {
                    id: 'plan-3m',
                    name: 'Plan 3 Meses',
                    duration: '3 Meses',
                    priceUSD: parseFloat((basePrice * 3 * 0.92).toFixed(2)),
                    savings: 'Ahorra 8%',
                    features: ['1 Pantalla privada con PIN', 'Calidad Ultra HD 4K', 'Garantía 90 días', 'Renovación garantizada']
                },
                {
                    id: 'plan-6m',
                    name: 'Plan 6 Meses',
                    duration: '6 Meses',
                    priceUSD: parseFloat((basePrice * 6 * 0.86).toFixed(2)),
                    savings: 'Ahorra 14%',
                    features: ['1 Pantalla privada con PIN', 'Calidad Ultra HD 4K', 'Garantía semestral', 'Soporte prioritario']
                },
                {
                    id: 'plan-12m',
                    name: 'Plan 1 Año',
                    duration: '12 Meses',
                    priceUSD: parseFloat((basePrice * 12 * 0.80).toFixed(2)),
                    savings: 'Ahorra 20%',
                    features: ['1 Pantalla privada con PIN', 'Calidad Ultra HD 4K', 'Máximo ahorro anual', 'Soporte VIP']
                }
            ];
            window.renderAdminPlansList();
        };

        ${scriptInjectionMarker}`;

html = html.replace(scriptInjectionMarker, plansJsCode);

// 5. Update saveProduct handler to serialize plans into description
html = html.replace(
  'const description = document.getElementById(\'p-desc\').value.trim();',
  `let cleanDescription = document.getElementById('p-desc').value.trim();
            // Serializar planes si existen
            let description = cleanDescription;
            if (window.adminCurrentPlans && window.adminCurrentPlans.length > 0 && tipo === 'suscripcion') {
                description = cleanDescription + '\\n\\n' + PLANS_CONFIG_PREFIX + JSON.stringify(window.adminCurrentPlans) + PLANS_CONFIG_SUFFIX;
            }`
);

// 6. Update loadProductToEditById to parse plans and clean description
html = html.replace(
  'document.getElementById(\'p-desc\').value = prod.description || \'\';',
  `let rawDesc = prod.description || '';
            window.adminCurrentPlans = [];
            if (rawDesc.includes(PLANS_CONFIG_PREFIX)) {
                try {
                    const start = rawDesc.indexOf(PLANS_CONFIG_PREFIX) + PLANS_CONFIG_PREFIX.length;
                    const end = rawDesc.indexOf(PLANS_CONFIG_SUFFIX, start);
                    if (end !== -1) {
                        const jsonStr = rawDesc.slice(start, end).trim();
                        window.adminCurrentPlans = JSON.parse(jsonStr);
                        rawDesc = (rawDesc.slice(0, rawDesc.indexOf(PLANS_CONFIG_PREFIX)) + rawDesc.slice(end + PLANS_CONFIG_SUFFIX.length)).trim();
                    }
                } catch(e) { console.warn('Error parsing plans in admin load:', e); }
            }
            document.getElementById('p-desc').value = rawDesc;
            window.renderAdminPlansList();`
);

// 7. Update resetProductForm to clear plans
html = html.replace(
  'document.getElementById(\'p-duracion\').value = \'1 mes\';',
  `document.getElementById('p-duracion').value = '1 mes';
            window.adminCurrentPlans = [];
            window.renderAdminPlansList();`
);

fs.writeFileSync(filePath, html, 'utf-8');
console.log('admin.html successfully upgraded with visual plans & duration editor!');
