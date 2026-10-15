import { currencyService } from '../services/currency.js';
import { cartService } from '../services/cart.js';
import { parseProductPlans, getCleanDescription, getProductRequirementNotice, getDeliveryInfo } from '../services/products.js';
import { showToast } from './Toast.js';

let activeProduct = null;
let selectedPlan = null;
let currentQuantity = 1;
let recargaAmountUSD = 5;
let playerIdentifier = '';

export function openProductDetail(product, callbacks = {}) {
  activeProduct = product;
  const plans = parseProductPlans(product);
  selectedPlan = plans[0] || null;
  currentQuantity = 1;
  recargaAmountUSD = Math.max(Number(product.price) || 1, 1);
  playerIdentifier = '';

  renderProductModalContent(callbacks);

  const modal = document.getElementById('product-detail-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

export function closeProductDetail() {
  const modal = document.getElementById('product-detail-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  activeProduct = null;
}

export function renderProductModalContent(callbacks = {}) {
  const modalContent = document.getElementById('product-detail-modal-content');
  if (!modalContent || !activeProduct) return;

  const product = activeProduct;
  const plans = parseProductPlans(product);
  const cleanDesc = getCleanDescription(product.description);
  const isCustomAmtRecarga = product.product_type === 'recarga' && plans.length <= 1;
  const notice = getProductRequirementNotice(product);
  const delivery = getDeliveryInfo(product);

  // Calculate pricing
  let unitPriceUSD = 0;
  if (isCustomAmtRecarga) {
    unitPriceUSD = recargaAmountUSD * 1.5;
  } else {
    unitPriceUSD = selectedPlan ? Number(selectedPlan.priceUSD) : (Number(product.price) || 0);
  }

  const totalPriceUSD = unitPriceUSD * currentQuantity;
  const totalDual = currencyService.getDualPrice(totalPriceUSD);
  const formattedTotal = totalDual.main;
  const formattedUnit = currencyService.format(unitPriceUSD);

  modalContent.innerHTML = `
    <div class="product-modal-layout">
      <!-- LEFT COLUMN: IMAGE & TRUST HIGHLIGHTS -->
      <div>
        <div style="background:var(--color-surface-glass-elevated); border:1px solid var(--color-border-glass); border-radius:10px; padding:22px; text-align:center; margin-bottom:16px;">
          <img src="${product.image_url}" 
               alt="${product.name}" 
               style="max-width:100%; max-height:190px; object-fit:contain; filter:drop-shadow(0 0 15px rgba(0, 180, 216,0.18));"
               onerror="this.src='https://alkyktnfhjtaxisykxfp.supabase.co/storage/v1/object/public/products/quinet.png'">
        </div>

        <div class="glass-panel" style="padding:16px; border-radius:10px;">
          <div style="font-size:0.75rem; color:var(--color-ash-gray); display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon)" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <span>Garantía de reposición activa</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              ${delivery.isImmediate 
                ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon)" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`
                : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`}
              <span style="color:${delivery.isImmediate ? 'inherit' : 'var(--color-warning)'}; font-weight:${delivery.isImmediate ? 'normal' : '600'};">${delivery.text}</span>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon)" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              <span>Pago en Bs a tasa oficial BCV</span>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: PRODUCT INFO & DURATION/PLANS SELECTOR -->
      <div>
        <div style="margin-bottom:8px;">
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:6px;">
            <span style="font-family:var(--font-mono); font-size:0.7rem; color:var(--color-neon); background:var(--color-neon-wash); border:1px solid var(--color-border-glass); padding:2px 8px; border-radius:4px; text-transform:uppercase;">
              ${product.product_type}
            </span>
            ${product.platform ? `
              <span style="font-family:var(--font-mono); font-size:0.7rem; color:var(--color-neon); background:var(--color-neon-wash-strong); border:1px solid var(--color-border-glass); padding:2px 8px; border-radius:4px; font-weight:bold;">
                ${product.platform}
              </span>
            ` : ''}
            <span style="font-family:var(--font-mono); font-size:0.7rem; color:${delivery.isImmediate ? 'var(--color-neon)' : 'var(--color-warning)'}; background:${delivery.isImmediate ? 'var(--color-neon-wash)' : 'rgba(245,158,11,0.08)'}; border:1px solid ${delivery.isImmediate ? 'var(--color-border-glass)' : 'rgba(245,158,11,0.25)'}; padding:2px 8px; border-radius:4px;">
              ${delivery.badge}
            </span>
          </div>
          <h2 style="font-size:1.85rem; color:var(--color-white); margin:0;">${product.name}</h2>
        </div>

        <p style="font-size:0.86rem; color:var(--color-ash-gray); line-height:1.5; margin-bottom:18px;">
          ${cleanDesc || 'Servicio digital de alta calidad con garantía completa de funcionamiento y soporte continuo.'}
        </p>

        <!-- NOTICE / INSTRUCTION BANNER -->
        ${notice ? `
          <div style="background:rgba(0, 180, 216, 0.08); border:1px solid rgba(0, 180, 216, 0.25); border-radius:8px; padding:10px 14px; margin-bottom:18px; font-size:0.78rem; color:var(--color-bone-white); line-height:1.45;">
            ${notice.warning ? `<span style="color:#ffca28; font-weight:600;">${notice.warning}</span>` : `<span>${notice.notice || ''}</span>`}
          </div>
        ` : ''}

        <!-- SUBSCRIPTION PLANS / PACKAGE SELECTOR -->
        ${!isCustomAmtRecarga ? `
          <div style="margin-bottom:20px;">
            <label style="font-size:0.78rem; font-weight:600; color:var(--color-white); display:flex; justify-content:space-between; margin-bottom:8px;">
              <span>${product.product_type === 'recarga' ? 'SELECCIONA EL PAQUETE / MONTO:' : 'SELECCIONA LA DURACIÓN DEL SERVICIO:'}</span>
              <span style="color:var(--color-neon); font-family:var(--font-mono); font-size:0.75rem;">
                ${selectedPlan?.name || selectedPlan?.duration || '1 Mes'}
              </span>
            </label>

            <div class="plan-picker-grid">
              ${plans.map(plan => {
                const isSelected = selectedPlan && selectedPlan.id === plan.id;
                const planDual = currencyService.getDualPrice(plan.priceUSD);
                return `
                  <div class="plan-option-card ${isSelected ? 'selected' : ''}" data-plan-id="${plan.id}">
                    <div class="plan-duration-title">${plan.name || plan.duration}</div>
                    <div class="plan-price-val">${planDual.main}</div>
                    <div style="font-family:var(--font-mono); font-size:0.65rem; color:var(--color-smoke-gray);">
                      ${planDual.secondary}
                    </div>
                    ${plan.savings ? `<div class="plan-savings-pill">${plan.savings}</div>` : ''}
                  </div>
                `;
              }).join('')}
            </div>

            <!-- SELECTED PLAN FEATURES LIST -->
            ${selectedPlan && selectedPlan.features ? `
              <div style="background:var(--color-surface-glass-elevated); padding:12px 14px; border-radius:8px; border:1px solid var(--color-border-glass); margin-top:12px;">
                <div style="font-size:0.75rem; font-weight:600; color:var(--color-white); margin-bottom:6px;">
                  Beneficios incluidos:
                </div>
                <ul style="list-style:none; display:flex; flex-direction:column; gap:6px;">
                  ${selectedPlan.features.map(feat => `
                    <li style="font-size:0.78rem; color:var(--color-ash-gray); display:flex; align-items:center; gap:6px;">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span>${feat}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        ` : `
          <!-- CUSTOM RECHARGE AMOUNT CONTROLLER (ONLY FOR UNSTRUCTURED RECARGAS) -->
          <div style="margin-bottom:20px;">
            <label style="font-size:0.78rem; font-weight:600; color:var(--color-white); margin-bottom:6px; display:block;">
              MONTO A RECARGAR (USD):
            </label>
            <div style="display:flex; gap:10px; margin-bottom:10px;">
              <input type="number" id="recarga-amount-input" value="${recargaAmountUSD}" min="1" step="0.5" style="font-family:var(--font-mono); font-size:1.15rem; font-weight:bold; text-align:center;">
            </div>

            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px;">
              ${[1, 2, 3, 5, 10, 20].map(amt => `
                <button class="btn-ghost btn-sm btn-quick-amt ${recargaAmountUSD === amt ? 'active' : ''}" data-amt="${amt}" style="font-family:var(--font-mono); padding:4px 10px;">
                  $${amt}
                </button>
              `).join('')}
            </div>

            <label style="font-size:0.75rem; color:var(--color-smoke-gray); margin-bottom:6px; display:block;">
              ID de Jugador / Nickname para la recarga:
            </label>
            <input type="text" id="recarga-id-input" placeholder="Ej: ID 123456789" value="${playerIdentifier}" style="font-size:0.85rem; margin-bottom:10px;">

            <div style="background:rgba(0, 180, 216,0.06); padding:10px 12px; border-radius:8px; border:1px solid rgba(0, 180, 216,0.2); font-size:0.78rem;">
              <span>Total con factor x1.5: </span>
              <b style="color:var(--color-neon); font-family:var(--font-mono);">${formattedUnit}</b>
              <span style="color:var(--color-smoke-gray); font-family:var(--font-mono);"> ($${unitPriceUSD.toFixed(2)} USD)</span>
            </div>
          </div>
        `}

        <!-- QUANTITY CONTROLS -->
        <div style="display:flex; align-items:center; gap:14px; margin-bottom:20px;">
          <span style="font-size:0.8rem; color:var(--color-ash-gray); font-weight:500;">Cantidad:</span>
          <div style="display:flex; align-items:center; background:var(--color-surface-glass-elevated); border:1px solid var(--color-border-glass); border-radius:6px; overflow:hidden;">
            <button class="btn-ghost" id="qty-minus" style="width:32px; height:32px; padding:0; border:none; font-weight:bold;">-</button>
            <span style="width:36px; text-align:center; font-family:var(--font-mono); font-size:0.9rem; font-weight:bold;">${currentQuantity}</span>
            <button class="btn-ghost" id="qty-plus" style="width:32px; height:32px; padding:0; border:none; font-weight:bold;">+</button>
          </div>
        </div>

        <!-- TOTAL & CHECKOUT ACTIONS -->
        <div style="border-top:1px solid var(--color-graphite-hairline); padding-top:18px;">
          <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:16px;">
            <span style="font-size:0.85rem; color:var(--color-ash-gray);">Total a pagar:</span>
            <div style="text-align:right;">
              <div style="font-family:var(--font-mono); font-size:1.55rem; font-weight:700; color:var(--color-neon);">
                ${totalDual.main}
              </div>
              <div style="font-family:var(--font-mono); font-size:0.75rem; color:var(--color-smoke-gray);">
                ${totalDual.secondary}
              </div>
            </div>
          </div>

          <div style="display:flex; gap:10px;">
            <button class="btn-primary" id="btn-modal-buynow" style="flex:1; padding:12px; font-size:0.9rem;">
              COMPRAR AHORA
            </button>
            <button class="btn-ghost" id="btn-modal-addcart" style="flex:1; padding:12px; font-size:0.9rem; border-color:var(--color-neon); color:var(--color-neon);">
              + AGREGAR AL CARRITO
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  attachModalEvents(callbacks);
}

function attachModalEvents(callbacks) {
  document.querySelectorAll('.plan-option-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const planId = e.currentTarget.getAttribute('data-plan-id');
      const plans = parseProductPlans(activeProduct);
      selectedPlan = plans.find(p => p.id === planId) || selectedPlan;
      renderProductModalContent(callbacks);
    });
  });

  document.getElementById('qty-minus')?.addEventListener('click', () => {
    if (currentQuantity > 1) {
      currentQuantity--;
      renderProductModalContent(callbacks);
    }
  });

  document.getElementById('qty-plus')?.addEventListener('click', () => {
    currentQuantity++;
    renderProductModalContent(callbacks);
  });

  const amtInput = document.getElementById('recarga-amount-input');
  if (amtInput) {
    amtInput.addEventListener('input', (e) => {
      recargaAmountUSD = Math.max(parseFloat(e.target.value) || 1, 1);
      renderProductModalContent(callbacks);
    });
  }

  document.querySelectorAll('.btn-quick-amt').forEach(btn => {
    btn.addEventListener('click', (e) => {
      recargaAmountUSD = parseFloat(e.currentTarget.getAttribute('data-amt')) || 1;
      renderProductModalContent(callbacks);
    });
  });

  const idInput = document.getElementById('recarga-id-input');
  if (idInput) {
    idInput.addEventListener('input', (e) => {
      playerIdentifier = e.target.value;
    });
  }

  document.getElementById('btn-modal-addcart')?.addEventListener('click', () => {
    addToCartAction();
    showToast(`¡${activeProduct.name} agregado al carrito!`);
    closeProductDetail();
  });

  document.getElementById('btn-modal-buynow')?.addEventListener('click', () => {
    addToCartAction();
    closeProductDetail();
    callbacks.onOpenCheckout?.();
  });
}

function addToCartAction() {
  if (!activeProduct) return;
  const plans = parseProductPlans(activeProduct);
  const isCustomAmtRecarga = activeProduct.product_type === 'recarga' && plans.length <= 1;

  let unitPriceUSD = isCustomAmtRecarga 
    ? (recargaAmountUSD * 1.5) 
    : (selectedPlan ? Number(selectedPlan.priceUSD) : Number(activeProduct.price));

  const planTitle = selectedPlan?.name || (isCustomAmtRecarga ? `Recarga $${recargaAmountUSD}` : (selectedPlan?.duration || 'Estándar'));

  cartService.addItem({
    id: activeProduct.id,
    name: activeProduct.name,
    image_url: activeProduct.image_url,
    product_type: activeProduct.product_type,
    planName: planTitle,
    duration: planTitle,
    priceUSD: unitPriceUSD,
    quantity: currentQuantity,
    isRecarga: activeProduct.product_type === 'recarga',
    playerIdentifier: playerIdentifier
  });
}
