import { cartService } from '../services/cart.js';
import { currencyService } from '../services/currency.js';

export function renderCartDrawer(callbacks = {}) {
  const container = document.getElementById('cart-drawer-mount');
  if (!container) return;

  const items = cartService.getItems();
  const totalUSD = cartService.getTotalUSD();
  const totalDual = currencyService.getDualPrice(totalUSD);
  const formattedTotal = totalDual.main;

  container.innerHTML = `
    <div class="cart-drawer-overlay" id="cart-overlay"></div>
    <div class="cart-drawer" id="cart-drawer">
      <!-- HEADER -->
      <div class="cart-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon)" stroke-width="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <h3 style="font-size:1.15rem; color:var(--color-white); margin:0;">Tu Carrito (${cartService.getCount()})</h3>
        </div>
        <button class="modal-close-btn" id="cart-close-btn" style="position:static;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <!-- ITEMS LIST -->
      <div class="cart-items-container">
        ${items.length === 0 ? `
          <div style="text-align:center; padding:60px 20px; color:var(--color-ash-gray);">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--color-smoke-gray)" stroke-width="1.8" style="margin:0 auto 12px auto; display:block;">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <h4 style="color:var(--color-white); margin-bottom:8px;">Tu carrito está vacío</h4>
            <p style="font-size:0.8rem; margin-bottom:20px;">
              Explora el catálogo y añade los servicios o recargas que desees.
            </p>
            <button class="btn-primary" id="cart-btn-explore">
              EXPLORAR SERVICIOS
            </button>
          </div>
        ` : `
          ${items.map((item, idx) => {
            const itemTotalUSD = item.priceUSD * (item.quantity || 1);
            const formattedItemTotal = currencyService.format(itemTotalUSD);

            return `
              <div class="cart-item-card">
                <img src="${item.image_url}" 
                     alt="${item.name}" 
                     class="cart-item-thumb"
                     onerror="this.src='https://alkyktnfhjtaxisykxfp.supabase.co/storage/v1/object/public/products/quinet.png'">
                
                <div style="flex:1; min-width:0;">
                  <div style="font-weight:600; font-size:0.9rem; color:var(--color-white); text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">
                    ${item.name}
                  </div>
                  <div style="font-size:0.75rem; color:var(--color-neon); font-family:var(--font-mono); margin-top:2px;">
                    ${item.duration || '1 Mes'} ${item.isRecarga ? '• Recarga' : ''}
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                    <span style="font-family:var(--font-mono); font-size:0.95rem; font-weight:700; color:var(--color-white);">
                      ${formattedItemTotal}
                    </span>

                    <!-- QUANTITY -->
                    <div style="display:flex; align-items:center; gap:6px;">
                      <div style="display:flex; align-items:center; background:var(--color-surface-glass-elevated); border:1px solid var(--color-border-glass); border-radius:4px;">
                        <button class="btn-ghost btn-item-minus" data-idx="${idx}" style="width:24px; height:24px; padding:0; border:none; font-size:0.8rem;">-</button>
                        <span style="width:26px; text-align:center; font-family:var(--font-mono); font-size:0.8rem; font-weight:bold;">${item.quantity || 1}</span>
                        <button class="btn-ghost btn-item-plus" data-idx="${idx}" style="width:24px; height:24px; padding:0; border:none; font-size:0.8rem;">+</button>
                      </div>

                      <button class="btn-danger btn-item-del" data-idx="${idx}" style="padding:4px 8px; font-size:0.75rem;" title="Eliminar">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        `}
      </div>

      <!-- FOOTER -->
      ${items.length > 0 ? `
        <div class="cart-footer">
          <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:14px;">
            <span style="font-size:0.85rem; color:var(--color-ash-gray);">Total a Pagar:</span>
            <div style="text-align:right;">
              <div style="font-family:var(--font-mono); font-size:1.5rem; font-weight:700; color:var(--color-neon);">
                ${totalDual.main}
              </div>
              <div style="font-family:var(--font-mono); font-size:0.75rem; color:var(--color-smoke-gray);">
                ${totalDual.secondary}
              </div>
            </div>
          </div>

          <div style="display:flex; gap:10px;">
            <button class="btn-primary" id="cart-btn-checkout" style="flex:1; padding:13px; font-size:0.9rem;">
              CONTINUAR AL PAGO
            </button>
            <button class="btn-ghost" id="cart-btn-clear" style="padding:13px 16px;" title="Vaciar carrito">
              Vaciar
            </button>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  attachCartEvents(callbacks);
}

function attachCartEvents(callbacks) {
  const overlay = document.getElementById('cart-overlay');
  const drawer = document.getElementById('cart-drawer');

  const close = () => {
    overlay?.classList.remove('open');
    drawer?.classList.remove('open');
  };

  overlay?.addEventListener('click', close);
  document.getElementById('cart-close-btn')?.addEventListener('click', close);

  document.getElementById('cart-btn-explore')?.addEventListener('click', () => {
    close();
    callbacks.onNavigate?.('catalog');
  });

  document.querySelectorAll('.btn-item-minus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
      const items = cartService.getItems();
      if (items[idx]) {
        cartService.updateQuantity(idx, (items[idx].quantity || 1) - 1);
        renderCartDrawer(callbacks);
      }
    });
  });

  document.querySelectorAll('.btn-item-plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
      const items = cartService.getItems();
      if (items[idx]) {
        cartService.updateQuantity(idx, (items[idx].quantity || 1) + 1);
        renderCartDrawer(callbacks);
      }
    });
  });

  document.querySelectorAll('.btn-item-del').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
      cartService.removeItem(idx);
      renderCartDrawer(callbacks);
    });
  });

  document.getElementById('cart-btn-clear')?.addEventListener('click', () => {
    cartService.clear();
    renderCartDrawer(callbacks);
  });

  document.getElementById('cart-btn-checkout')?.addEventListener('click', () => {
    close();
    callbacks.onOpenCheckout?.();
  });
}

export function openCartDrawer() {
  document.getElementById('cart-overlay')?.classList.add('open');
  document.getElementById('cart-drawer')?.classList.add('open');
}
