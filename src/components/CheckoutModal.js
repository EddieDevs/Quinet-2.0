import { cartService } from '../services/cart.js';
import { currencyService } from '../services/currency.js';
import { authService } from '../services/auth.js';
import { ordersService } from '../services/orders.js';
import { discountsService } from '../services/discounts.js';
import { getProductRequirementNotice, getDeliveryInfo } from '../services/products.js';
import { bncPaymentsService } from '../services/bncPayments.js';
import { showToast } from './Toast.js';

let checkoutStep = 1; // 1: Contact & Custom Details, 2: Payment
let contactPhone = '';
let currentOrderNumber = '';
let appliedDiscount = null;
let selectedPaymentMethod = 'pagomovil';
let pagoMovilRef = '';
let receiptFile = null;
let collectedCustomDetails = {};

export function openCheckoutModal(callbacks = {}) {
  const user = authService.getUser();
  if (!user) {
    callbacks.onOpenAuth?.();
    showToast('Inicia sesión para continuar con tu compra.');
    return;
  }

  const items = cartService.getItems();
  if (items.length === 0) {
    showToast('Tu carrito está vacío.', true);
    return;
  }

  // Generate order number for this session
  if (!currentOrderNumber) {
    currentOrderNumber = ordersService.generateOrderNumber();
  }

  if (!contactPhone && user.user_metadata?.phone) {
    contactPhone = user.user_metadata.phone;
  }

  checkoutStep = 1;

  renderCheckoutContent(callbacks);

  const modal = document.getElementById('checkout-modal-overlay');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

export function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal-overlay');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

export function renderCheckoutContent(callbacks = {}) {
  const content = document.getElementById('checkout-modal-dialog');
  if (!content) return;

  const user = authService.getUser();
  const items = cartService.getItems();
  let baseTotalUSD = cartService.getTotalUSD();

  let discountPct = appliedDiscount ? appliedDiscount.discountPct : 0;
  let finalTotalUSD = baseTotalUSD - (baseTotalUSD * discountPct / 100);

  const rates = currencyService.rates;
  const totalBS = (finalTotalUSD * rates.USD_VES).toFixed(2);
  const formattedTotal = currencyService.format(finalTotalUSD);
  const formattedSubtotal = currencyService.format(baseTotalUSD);

  if (checkoutStep === 1) {
    // PASO 1: DATOS DE CONTACTO Y CAMPOS ESPECÍFICOS SEGÚN PRODUCTO
    const requirementsList = items.map(item => {
      const req = getProductRequirementNotice(item);
      return { item, req };
    }).filter(entry => entry.req !== null);

    content.innerHTML = `
      <div style="max-width:520px; margin:auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
          <div>
            <span class="nav-brand-badge">PASO 1 DE 2</span>
            <h3 style="font-size:1.35rem; color:var(--color-white); margin-top:4px;">Datos de Entrega y Contacto</h3>
          </div>
          <button class="modal-close-btn" id="btn-close-checkout" style="position:static;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <p style="font-size:0.83rem; color:var(--color-ash-gray); line-height:1.5; margin-bottom:18px;">
          Indícanos tu número de WhatsApp y los datos necesarios para entregar tu pedido sin inconvenientes.
        </p>

        <!-- WHATSAPP FIELD -->
        <div style="margin-bottom:18px;">
          <label style="font-size:0.75rem; color:var(--color-smoke-gray); margin-bottom:4px; display:block;">Número de Teléfono / WhatsApp de Contacto: *</label>
          <input type="tel" id="checkout-input-phone" placeholder="Ej: 0424-1234567" value="${contactPhone}">
        </div>

        <!-- DYNAMIC CUSTOM REQUIREMENTS FOR SPECIFIC PRODUCTS -->
        ${requirementsList.length > 0 ? `
          <div style="margin-bottom:20px;">
            <h4 style="font-size:0.85rem; color:var(--color-neon); text-transform:uppercase; letter-spacing:0.5px; margin-bottom:10px; font-family:var(--font-mono);">
              Datos Específicos para tus Artículos:
            </h4>
            
            ${requirementsList.map(({ item, req }, idx) => {
              if (req.type === 'email_required') {
                return `
                  <div style="background:rgba(0,180,216,0.06); border:1px solid rgba(0,180,216,0.25); border-radius:8px; padding:12px; margin-bottom:10px;">
                    <label style="font-size:0.76rem; font-weight:600; color:var(--color-white); margin-bottom:4px; display:block;">
                      ${req.label} (${item.name}) *
                    </label>
                    <input type="email" id="req-google-email" placeholder="${req.placeholder}" value="${collectedCustomDetails['google_email'] || ''}" style="margin-bottom:4px;">
                    <div style="font-size:0.7rem; color:var(--color-ash-gray);">${req.notice}</div>
                  </div>
                `;
              }

              if (req.type === 'credentials_required') {
                const accVal = collectedCustomDetails[`${item.name}_cuenta`] || '';
                const passVal = collectedCustomDetails[`${item.name}_clave`] || '';
                return `
                  <div style="background:rgba(0,180,216,0.06); border:1px solid rgba(0,180,216,0.25); border-radius:8px; padding:12px; margin-bottom:10px;">
                    <div style="font-size:0.8rem; font-weight:600; color:var(--color-white); margin-bottom:6px;">
                      Datos para recarga de ${item.name}:
                    </div>
                    <div style="margin-bottom:8px;">
                      <label style="font-size:0.72rem; color:var(--color-smoke-gray); display:block; margin-bottom:3px;">${req.accountLabel} *</label>
                      <input type="text" class="req-cred-account" data-item="${item.name}" placeholder="Usuario / Correo" value="${accVal}">
                    </div>
                    <div style="margin-bottom:8px;">
                      <label style="font-size:0.72rem; color:var(--color-smoke-gray); display:block; margin-bottom:3px;">${req.passwordLabel} *</label>
                      <input type="password" class="req-cred-password" data-item="${item.name}" placeholder="Contraseña" value="${passVal}">
                    </div>
                    <div style="background:rgba(255,193,7,0.1); border:1px solid rgba(255,193,7,0.3); border-radius:6px; padding:8px; font-size:0.72rem; color:#ffca28; line-height:1.4;">
                      ${req.warning}
                    </div>
                  </div>
                `;
              }

              if (req.type === 'player_id_required') {
                const idVal = collectedCustomDetails[`${item.name}_id`] || '';
                return `
                  <div style="background:rgba(0,180,216,0.06); border:1px solid rgba(0,180,216,0.25); border-radius:8px; padding:12px; margin-bottom:10px;">
                    <label style="font-size:0.76rem; font-weight:600; color:var(--color-white); margin-bottom:4px; display:block;">
                      ${req.idLabel} (${item.name}) *
                    </label>
                    <input type="text" class="req-player-id" data-item="${item.name}" placeholder="Ej: 123456789" value="${idVal}" style="margin-bottom:4px;">
                    <div style="font-size:0.7rem; color:var(--color-ash-gray);">${req.notice}</div>
                  </div>
                `;
              }

              if (req.type === 'mlbb_ids_required') {
                const userVal = collectedCustomDetails['ml_userid'] || '';
                const zoneVal = collectedCustomDetails['ml_zoneid'] || '';
                return `
                  <div style="background:rgba(0,180,216,0.06); border:1px solid rgba(0,180,216,0.25); border-radius:8px; padding:12px; margin-bottom:10px;">
                    <div style="font-size:0.8rem; font-weight:600; color:var(--color-white); margin-bottom:6px;">
                      Datos de cuenta Mobile Legends:
                    </div>
                    <div style="display:grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 4px; align-items: end;">
                      <label style="font-size:0.72rem; color:var(--color-smoke-gray); margin:0; line-height:1.2;">${req.idLabel} *</label>
                      <label style="font-size:0.72rem; color:var(--color-smoke-gray); margin:0; line-height:1.2;">${req.zoneLabel} *</label>
                    </div>
                    <div style="display:grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 6px;">
                      <input type="text" id="req-ml-userid" placeholder="Ej: 12345678" value="${userVal}" style="margin:0; width:100%; box-sizing:border-box;">
                      <input type="text" id="req-ml-zoneid" placeholder="2045" maxlength="5" value="${zoneVal}" style="margin:0; width:100%; box-sizing:border-box; text-align:center;">
                    </div>
                    <div style="font-size:0.7rem; color:var(--color-ash-gray); margin-top:4px;">${req.notice}</div>
                  </div>
                `;
              }

              if (req.type === 'gift_code' || req.type === 'info_link') {
                return `
                  <div style="background:rgba(0,180,216,0.06); border:1px solid rgba(0,180,216,0.25); border-radius:8px; padding:10px; margin-bottom:10px; font-size:0.76rem; color:var(--color-bone-white); line-height:1.5;">
                    ${req.notice}
                  </div>
                `;
              }

              return '';
            }).join('')}
          </div>
        ` : ''}

        <label style="display:flex; align-items:flex-start; gap:10px; font-size:0.78rem; color:var(--color-ash-gray); cursor:pointer; margin-bottom:24px;">
          <input type="checkbox" id="checkout-check-terms" checked style="width:16px; height:16px; margin-top:2px;">
          <span>He leído y acepto los Términos de Servicio y Garantía de QuinetShop.</span>
        </label>

        <div style="display:flex; gap:10px;">
          <button class="btn-primary" id="btn-step1-continue" style="flex:1; padding:12px;">
            CONTINUAR AL PAGO
          </button>
          <button class="btn-ghost" id="btn-step1-cancel" style="padding:12px;">
            Cancelar
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-close-checkout')?.addEventListener('click', closeCheckoutModal);
    document.getElementById('btn-step1-cancel')?.addEventListener('click', closeCheckoutModal);

    document.getElementById('btn-step1-continue')?.addEventListener('click', () => {
      const phoneVal = document.getElementById('checkout-input-phone')?.value.trim();
      const termsVal = document.getElementById('checkout-check-terms')?.checked;

      if (!phoneVal) {
        showToast('Ingresa tu número de WhatsApp para continuar.', true);
        return;
      }
      if (!termsVal) {
        showToast('Debes aceptar los términos y condiciones.', true);
        return;
      }

      // Check Google One email requirement
      const googleInput = document.getElementById('req-google-email');
      if (googleInput) {
        const gEmail = googleInput.value.trim();
        if (!gEmail || !gEmail.includes('@')) {
          showToast('Debes ingresar tu correo Gmail para la suscripción de Google One.', true);
          googleInput.focus();
          return;
        }
        collectedCustomDetails['Google One - Correo'] = gEmail;
      }

      // Check Credentials required
      let credError = false;
      document.querySelectorAll('.req-cred-account').forEach(accIn => {
        const itemName = accIn.getAttribute('data-item');
        const passIn = document.querySelector(`.req-cred-password[data-item="${itemName}"]`);
        const acc = accIn.value.trim();
        const pass = passIn ? passIn.value : '';
        if (!acc || !pass) {
          showToast(`Ingresa cuenta y contraseña para ${itemName}.`, true);
          credError = true;
          return;
        }
        collectedCustomDetails[`${itemName} - Cuenta`] = acc;
        collectedCustomDetails[`${itemName} - Clave`] = pass;
      });
      if (credError) return;

      // Check Player IDs
      let idError = false;
      document.querySelectorAll('.req-player-id').forEach(idIn => {
        const itemName = idIn.getAttribute('data-item');
        const pId = idIn.value.trim();
        if (!pId) {
          showToast(`Ingresa el ID de Jugador para ${itemName}.`, true);
          idError = true;
          return;
        }
        collectedCustomDetails[`${itemName} - ID de Jugador`] = pId;
      });
      if (idError) return;

      // Check MLBB IDs
      const mlUserIn = document.getElementById('req-ml-userid');
      const mlZoneIn = document.getElementById('req-ml-zoneid');
      if (mlUserIn && mlZoneIn) {
        const uid = mlUserIn.value.trim();
        const zid = mlZoneIn.value.trim();
        if (!uid || !zid) {
          showToast('Ingresa tu ID de Usuario y los 4 dígitos de servidor de Mobile Legends.', true);
          return;
        }
        collectedCustomDetails['Mobile Legends - ID Usuario'] = uid;
        collectedCustomDetails['Mobile Legends - Server/Zone ID'] = zid;
      }

      contactPhone = phoneVal;
      checkoutStep = 2;
      renderCheckoutContent(callbacks);
    });

  } else {
    // PASO 2: RESUMEN, MÉTODOS DE PAGO Y SUBIDA DE COMPROBANTE
    content.innerHTML = `
      <div style="max-width:620px; margin:auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px;">
          <div>
            <span class="nav-brand-badge">PASO 2 DE 2</span>
            <h3 style="font-size:1.35rem; color:var(--color-white); margin-top:4px;">Procesar Pago</h3>
          </div>
          <button class="modal-close-btn" id="btn-close-checkout" style="position:static;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <!-- RESUMEN DE LA ORDEN -->
        <div class="glass-card" style="padding:18px; margin-bottom:18px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--color-graphite-hairline); padding-bottom:8px;">
            <span><b>Pedido:</b> <span style="color:var(--color-neon); font-family:var(--font-mono); font-weight:bold;">${currentOrderNumber}</span></span>
            <button class="btn-ghost btn-sm" id="btn-copy-ordernum" style="font-size:0.7rem; padding:4px 8px; gap:4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              Copiar N°
            </button>
          </div>

          <!-- LIST OF ITEMS -->
          <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:14px;">
            ${items.map(it => {
              const delivery = getDeliveryInfo(it);
              return `
                <div style="display:flex; justify-content:space-between; align-items:flex-start; font-size:0.8rem; color:var(--color-ash-gray); border-bottom:1px dashed rgba(255,255,255,0.06); padding-bottom:6px;">
                  <div>
                    <div>${it.quantity}x ${it.name} <b style="color:var(--color-white);">(${it.duration})</b></div>
                    <div style="font-size:0.68rem; font-family:var(--font-mono); color:${delivery.isImmediate ? 'var(--color-neon)' : 'var(--color-warning)'}; display:flex; align-items:center; gap:5px; margin-top:2px;">
                      ${delivery.isImmediate 
                        ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg><span>Entrega Inmediata</span>` 
                        : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><span>Entrega estimada: 5 minutos</span>`}
                    </div>
                  </div>
                  <span style="font-family:var(--font-mono); color:var(--color-white);">${currencyService.format(it.priceUSD * it.quantity)}</span>
                </div>
              `;
            }).join('')}
          </div>

          <!-- COUPON CODE INPUT -->
          <div style="display:flex; gap:8px; margin-bottom:10px;">
            <input type="text" id="coupon-input" placeholder="Código de descuento (Ej: PROMO)" value="${appliedDiscount ? appliedDiscount.code : ''}" style="flex:1; padding:8px 12px; font-size:0.8rem;">
            <button class="btn-ghost btn-sm" id="btn-apply-coupon" style="padding:8px 14px;">APLICAR</button>
          </div>
          ${appliedDiscount ? `
            <div style="font-size:0.75rem; color:var(--color-neon); margin-bottom:10px; font-family:var(--font-mono); display:flex; align-items:center; gap:6px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>${appliedDiscount.message}</span>
            </div>
          ` : ''}

          <!-- TOTALS -->
          <div style="border-top:1px solid var(--color-graphite-hairline); padding-top:10px; text-align:right;">
            ${discountPct > 0 ? `
              <div style="font-size:0.75rem; color:var(--color-smoke-gray);">Subtotal: ${formattedSubtotal}</div>
            ` : ''}
            <div style="font-size:1.35rem; font-weight:700; color:var(--color-neon); font-family:var(--font-mono);">
              Total: ${formattedTotal}
            </div>
            <div style="font-size:0.8rem; color:var(--color-smoke-gray); font-family:var(--font-mono);">
              Equivalente: ${totalBS} BS (Tasa BCV: ${rates.USD_VES.toFixed(2)})
            </div>
          </div>
        </div>

        <!-- PAYMENT METHOD SELECTOR -->
        <div class="glass-card" style="padding:18px; margin-bottom:18px;">
          <h4 style="font-size:0.95rem; color:var(--color-white); margin-bottom:12px;">Selecciona el Método de Pago:</h4>

          <div style="display:flex; gap:10px; margin-bottom:16px; flex-wrap:wrap;">
            <label class="btn-ghost" style="flex:1; min-width:130px; cursor:pointer; justify-content:flex-start; ${selectedPaymentMethod === 'pagomovil' ? 'border-color:var(--color-neon); background:var(--color-neon-wash); color:var(--color-neon);' : ''}">
              <input type="radio" name="checkout_pay_method" value="pagomovil" ${selectedPaymentMethod === 'pagomovil' ? 'checked' : ''} style="width:auto; margin-right:8px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
              <span>Pago Móvil (Bs)</span>
            </label>

            <label class="btn-ghost" style="flex:1; min-width:130px; cursor:pointer; justify-content:flex-start; ${selectedPaymentMethod === 'binance' ? 'border-color:var(--color-neon); background:var(--color-neon-wash); color:var(--color-neon);' : ''}">
              <input type="radio" name="checkout_pay_method" value="binance" ${selectedPaymentMethod === 'binance' ? 'checked' : ''} style="width:auto; margin-right:8px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v12M6 12h12"></path></svg>
              <span>Binance Pay</span>
            </label>

            <label class="btn-ghost" style="flex:1; min-width:130px; cursor:pointer; justify-content:flex-start; ${selectedPaymentMethod === 'zinli' ? 'border-color:var(--color-neon); background:var(--color-neon-wash); color:var(--color-neon);' : ''}">
              <input type="radio" name="checkout_pay_method" value="zinli" ${selectedPaymentMethod === 'zinli' ? 'checked' : ''} style="width:auto; margin-right:8px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;"><rect x="1" y="4" width="22" height="16" rx="3"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              <span>Zinli (USD)</span>
            </label>

            <label class="btn-ghost" style="flex:1; min-width:130px; cursor:pointer; justify-content:flex-start; ${selectedPaymentMethod === 'paypal' ? 'border-color:var(--color-neon); background:var(--color-neon-wash); color:var(--color-neon);' : ''}">
              <input type="radio" name="checkout_pay_method" value="paypal" ${selectedPaymentMethod === 'paypal' ? 'checked' : ''} style="width:auto; margin-right:8px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px;"><path d="M7 11V7a5 5 0 0 1 10 0v4"></path><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect></svg>
              <span>PayPal (USD)</span>
            </label>
          </div>

          <!-- PAYMENT DETAILS BOX -->
          <div style="background:var(--color-surface-glass-elevated); padding:16px; border-radius:10px; border:1px solid var(--color-border-glass); font-size:0.8rem; line-height:1.6; box-shadow:0 4px 15px rgba(0,0,0,0.04);">
            ${selectedPaymentMethod === 'pagomovil' ? `
              <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span><b>Banco:</b> 0191 BNC (Banco Nacional de Crédito)</span>
                <button class="btn-ghost btn-sm btn-copy-txt" data-copy="0191" style="padding:2px 6px;">Copiar</button>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span><b>Teléfono:</b> 0422-8328706</span>
                <button class="btn-ghost btn-sm btn-copy-txt" data-copy="04228328706" style="padding:2px 6px;">Copiar</button>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span><b>Cédula:</b> V-33727699</span>
                <button class="btn-ghost btn-sm btn-copy-txt" data-copy="33727699" style="padding:2px 6px;">Copiar</button>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom:10px; border-top:1px solid var(--color-graphite-hairline); padding-top:6px;">
                <span><b>Monto Exacto en Bolívares:</b> <b style="color:var(--color-neon);">${totalBS} BS</b></span>
                <button class="btn-ghost btn-sm btn-copy-txt" data-copy="${totalBS}" style="padding:2px 6px;">Copiar</button>
              </div>
              <button class="btn-ghost btn-sm" id="btn-copy-all-pm" style="width:100%; font-size:0.75rem; gap:6px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                Copiar Todos los Datos de Pago Móvil
              </button>
            ` : selectedPaymentMethod === 'binance' ? `
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; background:var(--color-neon-wash); padding:8px 12px; border-radius:6px; border:1px solid var(--color-border-glass);">
                <div>
                  <span style="font-size:0.7rem; color:var(--color-ash-gray); display:block;">Correo Binance Pay:</span>
                  <b style="color:var(--color-white); font-family:var(--font-mono); font-size:0.85rem;">Betancalfred@gmail.com</b>
                </div>
                <button class="btn-ghost btn-sm btn-copy-txt" data-copy="Betancalfred@gmail.com" style="padding:3px 10px; border-color:var(--color-neon); color:var(--color-neon);">Copiar</button>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span><b>Monto a Enviar:</b> <b style="color:var(--color-neon);">$${finalTotalUSD.toFixed(2)} USDT</b></span>
                <button class="btn-ghost btn-sm btn-copy-txt" data-copy="${finalTotalUSD.toFixed(2)}" style="padding:2px 6px;">Copiar</button>
              </div>
              <p style="font-size:0.72rem; color:var(--color-smoke-gray); margin-top:6px;">
                Transfiere desde tu app Binance a <b>Betancalfred@gmail.com</b> y sube la captura de la confirmación de pago abajo.
              </p>
            ` : selectedPaymentMethod === 'zinli' ? `
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; background:var(--color-neon-wash); padding:8px 12px; border-radius:6px; border:1px solid var(--color-border-glass);">
                <div>
                  <span style="font-size:0.7rem; color:var(--color-ash-gray); display:block;">Correo de Cuenta Zinli:</span>
                  <b style="color:var(--color-white); font-family:var(--font-mono); font-size:0.85rem;">Betancalfred@gmail.com</b>
                </div>
                <button class="btn-ghost btn-sm btn-copy-txt" data-copy="Betancalfred@gmail.com" style="padding:3px 10px; border-color:var(--color-neon); color:var(--color-neon);">Copiar</button>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span><b>Monto a Enviar:</b> <b style="color:var(--color-neon);">$${finalTotalUSD.toFixed(2)} USD</b></span>
                <button class="btn-ghost btn-sm btn-copy-txt" data-copy="${finalTotalUSD.toFixed(2)}" style="padding:2px 6px;">Copiar</button>
              </div>
              <p style="font-size:0.72rem; color:var(--color-smoke-gray); margin-top:6px;">
                Envía el monto a la billetera Zinli <b>Betancalfred@gmail.com</b> y adjunta el comprobante con el número de transacción.
              </p>
            ` : `
              <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span><b>Correo PayPal:</b> quinteroaleanna@gmail.com</span>
                <button class="btn-ghost btn-sm btn-copy-txt" data-copy="quinteroaleanna@gmail.com" style="padding:2px 6px;">Copiar</button>
              </div>
              <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span><b>Monto Neto:</b> <b style="color:var(--color-neon);">$${finalTotalUSD.toFixed(2)} USD</b></span>
                <button class="btn-ghost btn-sm btn-copy-txt" data-copy="${finalTotalUSD.toFixed(2)}" style="padding:2px 6px;">Copiar</button>
              </div>
              <div style="background:rgba(255,77,79,0.1); border:1px solid rgba(255,77,79,0.3); border-radius:6px; padding:10px; font-size:0.72rem; color:var(--color-bone-white); display:flex; gap:8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" stroke-width="2" style="flex-shrink:0; margin-top:2px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span><b>Importante:</b> Envía el pago en modalidad "Amigos y Familiares". Cubre la comisión de PayPal para que llegue el monto neto exacto. No coloques palabras como "compra", "streaming" ni "servicio" en la nota.</span>
              </div>
            `}
          </div>
        </div>

        <!-- CASILLA REFERENCIA PAGO MÓVIL (REQUERIMIENTO 7) -->
        ${selectedPaymentMethod === 'pagomovil' ? `
          <div class="glass-card" style="padding:16px 18px; margin-bottom:14px; border-color:var(--color-border-glow);">
            <label for="checkout-pm-ref" style="font-size:0.78rem; font-weight:700; color:var(--color-white); display:flex; align-items:center; gap:6px; margin-bottom:6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Referencia de Pago Móvil (Últimos 4 dígitos o Completa): *</span>
            </label>
            <input type="text" id="checkout-pm-ref" maxlength="12" placeholder="Ej: 1286 o 856391286" value="${pagoMovilRef}" style="letter-spacing:2px; font-family:var(--font-mono); font-size:1.15rem; font-weight:700; text-align:center; padding:10px;" autocomplete="off" inputmode="numeric">
            <div style="font-size:0.7rem; color:var(--color-neon); margin-top:4px; text-align:center; font-family:var(--font-mono); display:flex; align-items:center; justify-content:center; gap:5px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              <span>Validación rápida y segura</span>
            </div>
          </div>
        ` : ''}

        <!-- RECEIPT FILE DROPZONE -->
        <div class="glass-card" style="padding:18px; margin-bottom:20px; text-align:center;">
          <label for="checkout-file-receipt" style="cursor:pointer; display:block;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon)" stroke-width="2" style="margin:0 auto 8px auto; display:block;">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <div style="font-size:0.85rem; font-weight:600; color:var(--color-white); margin-bottom:4px;">
              ${receiptFile ? `Archivo: ${receiptFile.name}` : 'Adjuntar Comprobante de Pago'}
            </div>
            <div style="font-size:0.75rem; color:var(--color-smoke-gray);">
              ${receiptFile ? 'Haz clic para cambiar archivo' : 'Sube la captura o foto del comprobante (JPG, PNG, PDF)'}
            </div>
          </label>
          <input type="file" id="checkout-file-receipt" accept="image/*,application/pdf" style="display:none;">
        </div>

        <!-- ACTIONS -->
        <div style="display:flex; gap:10px;">
          <button class="btn-ghost" id="btn-step2-back" style="padding:12px;">
            Atrás
          </button>
          <button class="btn-primary" id="btn-step2-confirm" style="flex:1; padding:13px; font-size:0.95rem;">
            CONFIRMAR PAGO Y VER MI PEDIDO
          </button>
        </div>
      </div>
    `;

    // Event attachments for Step 2
    document.getElementById('btn-close-checkout')?.addEventListener('click', closeCheckoutModal);
    document.getElementById('btn-step2-back')?.addEventListener('click', () => {
      checkoutStep = 1;
      renderCheckoutContent(callbacks);
    });

    // Reference input tracking
    document.getElementById('checkout-pm-ref')?.addEventListener('input', (e) => {
      pagoMovilRef = e.target.value.replace(/\D/g, '').slice(0, 12);
      e.target.value = pagoMovilRef;
    });

    // Copy order number
    document.getElementById('btn-copy-ordernum')?.addEventListener('click', () => {
      navigator.clipboard.writeText(currentOrderNumber);
      showToast('N° de pedido copiado.');
    });

    // Copy text buttons
    document.querySelectorAll('.btn-copy-txt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const text = e.currentTarget.getAttribute('data-copy');
        if (text) {
          navigator.clipboard.writeText(text);
          showToast('Copiado al portapapeles.');
        }
      });
    });

    // Copy all Pago Móvil
    document.getElementById('btn-copy-all-pm')?.addEventListener('click', () => {
      const allText = `Banco: 0191 BNC\nTelefono: 04228328706\nCedula: 33727699\nMonto: ${totalBS} BS\nPedido: ${currentOrderNumber}`;
      navigator.clipboard.writeText(allText);
      showToast('Todos los datos copiados.');
    });

    // Apply Coupon
    document.getElementById('btn-apply-coupon')?.addEventListener('click', async () => {
      const code = document.getElementById('coupon-input')?.value.trim();
      const res = await discountsService.validateCode(code, user.id);
      if (res.valid) {
        appliedDiscount = res;
        showToast(res.message);
      } else {
        appliedDiscount = null;
        showToast(res.message, true);
      }
      renderCheckoutContent(callbacks);
    });

    // Payment method radios
    document.querySelectorAll('input[name="checkout_pay_method"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        selectedPaymentMethod = e.target.value;
        renderCheckoutContent(callbacks);
      });
    });

    // File input
    document.getElementById('checkout-file-receipt')?.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        receiptFile = e.target.files[0];
        renderCheckoutContent(callbacks);
        showToast(`Comprobante seleccionado: ${receiptFile.name}`);
      }
    });

    // Confirm Payment
    document.getElementById('btn-step2-confirm')?.addEventListener('click', async () => {
      let validatedPmRef = null;
      if (selectedPaymentMethod === 'pagomovil') {
        const refInp = document.getElementById('checkout-pm-ref');
        const refVal = refInp ? refInp.value.trim() : pagoMovilRef;
        if (!refVal || refVal.length < 4 || !/^\d{4,12}$/.test(refVal)) {
          showToast('Ingresa los últimos 4 dígitos o la referencia completa de tu Pago Móvil.', true);
          return;
        }
        validatedPmRef = refVal;
        pagoMovilRef = refVal;
      }

      if (!receiptFile) {
        showToast('Debes adjuntar el comprobante de pago para continuar.', true);
        return;
      }

      const btn = document.getElementById('btn-step2-confirm');
      if (btn) {
        btn.disabled = true;
        btn.innerText = 'VERIFICANDO PAGO...';
      }

      try {
        let initialStatus = 'PENDIENTE';
        let matchedBncPayment = null;

        // Si es pago móvil, intentamos conciliar de inmediato con pagos BNC recibidos
        if (selectedPaymentMethod === 'pagomovil' && validatedPmRef) {
          matchedBncPayment = await bncPaymentsService.findMatchingPayment(validatedPmRef, parseFloat(totalBS));
          if (matchedBncPayment) {
            console.log('¡Pago BNC verificado en tiempo real!', matchedBncPayment);
            initialStatus = 'COMPLETADO';
          }
        }

        const newOrder = await ordersService.createOrder({
          user: user,
          phone: contactPhone,
          cartItems: items,
          totalUSD: finalTotalUSD,
          discountId: appliedDiscount?.id,
          discountPct: discountPct,
          receiptFile: receiptFile,
          tasaBCV: rates.USD_VES,
          paymentMethod: selectedPaymentMethod,
          paymentReference: validatedPmRef,
          customDetails: collectedCustomDetails,
          initialStatus: initialStatus
        });

        if (matchedBncPayment) {
          // Asociar el pago BNC con el número de orden y conciliar
          await bncPaymentsService.reconcilePayment(matchedBncPayment.id, newOrder.orderNumber);

          // Si hay stock, entregar credenciales automáticamente al instante
          if (newOrder.orderData) {
            await ordersService.deliverCredentialsForOrder(newOrder.orderData);
          }
          showToast('Pago verificado con éxito. Tu servicio ha sido activado.', false);
        } else {
          showToast('¡Pedido registrado! Validando pago, esto puede tomar unos minutos.');
        }

        cartService.clear();
        closeCheckoutModal();

        // Reset state
        currentOrderNumber = '';
        appliedDiscount = null;
        pagoMovilRef = '';
        receiptFile = null;
        collectedCustomDetails = {};

        // Navigate directly to dedicated client portal so the customer can track their order and talk to support!
        callbacks.onNavigate?.('portal');

      } catch (err) {
        console.error(err);
        showToast(err.message || 'Error al procesar el pedido.', true);
        if (btn) {
          btn.disabled = false;
          btn.innerText = 'CONFIRMAR PAGO Y VER MI PEDIDO';
        }
      }
    });
  }
}
