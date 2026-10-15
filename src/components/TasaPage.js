import { currencyService } from '../services/currency.js';

export function renderTasaPage(callbacks = {}) {
  const container = document.getElementById('tasa-mount');
  if (!container) return;

  const rates = currencyService.rates;
  const usdVes = rates.USD_VES ? rates.USD_VES.toFixed(2) : '--';

  container.innerHTML = `
    <section class="section-padding" style="padding-top: calc(var(--navbar-height) + 30px); min-height: 85vh;">
      <div class="container" style="max-width: 820px;">
        
        <!-- BREADCRUMB -->
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:20px;">
          <button class="btn-ghost btn-sm" id="tasa-back-home" style="gap:6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Inicio
          </button>
          <span style="font-size:0.75rem; color:var(--color-smoke-gray); font-family:var(--font-mono);">/ TASA OFICIAL BCV</span>
        </div>

        <!-- HERO DISPLAY RATE (ONLY USD TO VES) -->
        <div class="glass-panel" style="padding: 48px 24px; text-align: center; margin-bottom: 32px; border-color: var(--color-border-glow);">
          <div class="rate-indicator-pill" style="margin-bottom: 18px;">
            <span class="status-dot"></span>
            <span>TASA ACTIVA DE CAMBIO OFICIAL BCV</span>
          </div>

          <h1 style="font-family: var(--font-serif); font-size: clamp(2.4rem, 4.5vw, 3.8rem); margin-bottom: 8px; color: var(--color-white);">
            Cotización Oficial del <span style="font-style: italic; color: var(--color-neon);">Dólar</span>
          </h1>

          <p style="font-family: var(--font-sans); font-size: 0.85rem; color: var(--color-ash-gray); max-width: 540px; margin: 0 auto 32px auto; line-height: 1.6;">
            En QuinetShop todos los precios en bolívares se calculan estrictamente con base en la tasa oficial emitida por el Banco Central de Venezuela.
          </p>

          <!-- GIANT DISPLAY RATE IN INSTRUMENT SERIF -->
          <div class="glass-card" style="padding: 36px 24px; max-width: 480px; margin: 0 auto 20px auto; border-color: var(--color-border-glow); background: var(--color-surface-glass-elevated);">
            <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-smoke-gray); text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 6px;">
              Dólar Oficial (USD / VES)
            </span>
            <div style="font-family: var(--font-serif); font-size: clamp(4rem, 8vw, 6rem); color: var(--color-neon); line-height: 1; font-weight: 400; margin: 8px 0;">
              ${usdVes} <span style="font-size: 0.35em; color: var(--color-white); font-family: var(--font-sans); font-weight: 700;">BS</span>
            </div>
            <div style="font-size: 0.8rem; color: var(--color-ash-gray); font-family: var(--font-mono); margin-top: 6px;">
              1.00 USD = ${usdVes} Bolívares
            </div>
          </div>
        </div>

        <!-- CALCULADORA RÁPIDA DÓLAR <-> BOLÍVARES -->
        <div class="glass-panel" style="padding: 28px; max-width: 520px; margin: 0 auto 40px auto;">
          <h3 style="font-family: var(--font-sans); font-size: 1.15rem; color: var(--color-white); margin-bottom: 6px; text-align: center;">
            Conversor Dólar / Bolívares
          </h3>
          <p style="font-family: var(--font-sans); font-size: 0.78rem; color: var(--color-ash-gray); text-align: center; margin-bottom: 20px;">
            Ingresa el monto para calcular la equivalencia exacta al instante.
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
            <div>
              <label style="font-size: 0.72rem; color: var(--color-smoke-gray); margin-bottom: 4px; display: block; font-family: var(--font-mono);">Dólares ($ USD):</label>
              <input type="number" id="tasa-in-usd" value="10" step="any" style="font-family: var(--font-mono); font-size: 1.05rem; font-weight: bold;">
            </div>

            <div>
              <label style="font-size: 0.72rem; color: var(--color-smoke-gray); margin-bottom: 4px; display: block; font-family: var(--font-mono);">Bolívares (Bs VES):</label>
              <input type="number" id="tasa-in-ves" step="any" style="font-family: var(--font-mono); font-size: 1.05rem; font-weight: bold;">
            </div>
          </div>

          <div style="display: flex; justify-content: center;">
            <button class="btn-primary" id="tasa-btn-goto-catalog" style="padding: 12px 28px; font-size: 0.85rem;">
              EXPLORAR CATÁLOGO DE PRODUCTOS
            </button>
          </div>
        </div>

      </div>
    </section>
  `;

  document.getElementById('tasa-back-home')?.addEventListener('click', () => {
    callbacks.onNavigate?.('home');
  });

  document.getElementById('tasa-btn-goto-catalog')?.addEventListener('click', () => {
    callbacks.onNavigate?.('catalog');
  });

  const inUsd = document.getElementById('tasa-in-usd');
  const inVes = document.getElementById('tasa-in-ves');

  const updateUSD = () => {
    const usd = parseFloat(inUsd?.value) || 0;
    if (inVes) inVes.value = (usd * rates.USD_VES).toFixed(2);
  };

  const updateVES = () => {
    const ves = parseFloat(inVes?.value) || 0;
    const usd = rates.USD_VES > 0 ? ves / rates.USD_VES : 0;
    if (inUsd) inUsd.value = usd.toFixed(2);
  };

  inUsd?.addEventListener('input', updateUSD);
  inVes?.addEventListener('input', updateVES);

  updateUSD();
}
