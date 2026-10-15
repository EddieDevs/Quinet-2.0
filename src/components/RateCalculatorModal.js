import { currencyService } from '../services/currency.js';

export function openRateCalculator() {
  const modal = document.getElementById('calc-modal-overlay');
  const dialog = document.getElementById('calc-modal-dialog');
  if (!modal || !dialog) return;

  const rates = currencyService.rates;

  dialog.innerHTML = `
    <div style="max-width:340px; margin:auto; text-align:center; position:relative;">
      <button class="modal-close-btn" id="calc-close-btn" style="position:absolute; top:-10px; right:-10px;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:12px;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon)" stroke-width="2">
          <rect x="4" y="2" width="16" height="20" rx="2"></rect>
          <line x1="8" y1="6" x2="16" y2="6"></line>
          <line x1="16" y1="14" x2="16" y2="18"></line>
          <path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path>
          <path d="M12 14h.01"></path><path d="M8 14h.01"></path>
          <path d="M12 18h.01"></path><path d="M8 18h.01"></path>
        </svg>
        <h3 style="color:var(--color-neon); margin:0; font-size:1.15rem;">Calculadora de Divisas</h3>
      </div>

      <p style="font-size:0.75rem; color:var(--color-ash-gray); margin-bottom:18px;">
        Convierte entre Dólares y Bolívares a la tasa oficial BCV del día.
      </p>

      <div style="display:flex; flex-direction:column; gap:12px; text-align:left;">
        <div>
          <label style="font-size:0.72rem; color:var(--color-smoke-gray); margin-bottom:4px; display:block;">Dólares ($ USD):</label>
          <input type="number" id="calc-in-usd" placeholder="0.00" step="any" value="5" style="font-family:var(--font-mono); font-weight:bold;">
        </div>

        <div>
          <label style="font-size:0.72rem; color:var(--color-smoke-gray); margin-bottom:4px; display:block;">Bolívares (Bs VES):</label>
          <input type="number" id="calc-in-ves" placeholder="0.00" step="any" style="font-family:var(--font-mono); font-weight:bold;">
        </div>
      </div>

      <div style="margin-top:20px; padding:12px; border-radius:8px; background:var(--color-surface-glass-elevated); border:1px solid var(--color-border-glass); font-size:0.75rem; font-family:var(--font-mono); box-shadow:0 2px 8px rgba(0,0,0,0.04);">
        <div>Tasa Oficial BCV: <b style="color:var(--color-neon);">${rates.USD_VES ? rates.USD_VES.toFixed(2) : '--'} Bs/USD</b></div>
      </div>
    </div>
  `;

  document.getElementById('calc-close-btn')?.addEventListener('click', closeRateCalculator);

  const inUsd = document.getElementById('calc-in-usd');
  const inVes = document.getElementById('calc-in-ves');

  const updateFromUSD = () => {
    const usd = parseFloat(inUsd?.value) || 0;
    if (inVes) inVes.value = (usd * rates.USD_VES).toFixed(2);
  };

  const updateFromVES = () => {
    const ves = parseFloat(inVes?.value) || 0;
    const usd = rates.USD_VES > 0 ? ves / rates.USD_VES : 0;
    if (inUsd) inUsd.value = usd.toFixed(2);
  };

  inUsd?.addEventListener('input', updateFromUSD);
  inVes?.addEventListener('input', updateFromVES);

  // Initialize with USD = 5
  updateFromUSD();

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

export function closeRateCalculator() {
  const modal = document.getElementById('calc-modal-overlay');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}
