import { currencyService } from '../services/currency.js';
import { productsService } from '../services/products.js';
import { cartService } from '../services/cart.js';
import { showToast } from './Toast.js';

export function renderPackagesView(callbacks = {}) {
  const container = document.getElementById('packages-mount');
  if (!container) return;

  const combos = productsService.getCombos();

  container.innerHTML = `
    <section class="section-padding" style="padding-top: calc(var(--navbar-height) + 30px); min-height: 85vh;">
      <div class="container">
        
        <!-- BREADCRUMB -->
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:20px;">
          <button class="btn-ghost btn-sm" id="pkg-back-home" style="gap:6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Inicio
          </button>
          <span style="font-size:0.75rem; color:var(--color-smoke-gray); font-family:var(--font-mono);">/ PAQUETES & COMBOS</span>
        </div>

        <div class="section-header" style="text-align: left; margin-bottom: 36px;">
          <span class="section-tag">PROMOCIONES ESPECIALES</span>
          <h1 style="font-family: var(--font-serif); font-size: clamp(2.4rem, 4.5vw, 3.8rem); margin: 6px 0; color: var(--color-white);">
            Paquetes con <span style="font-style: italic; color: var(--color-neon);">Descuento</span>
          </h1>
          <p style="font-family: var(--font-sans); font-size: 0.88rem; color: var(--color-ash-gray); max-width: 600px; margin: 0; line-height: 1.6;">
            Adquiere múltiples plataformas digitales en un solo paquete y ahorra en comparación a comprarlas por separado.
          </p>
        </div>

        ${combos.length === 0 ? `
          <div class="glass-panel" style="padding: 48px 24px; text-align: center; max-width: 580px; margin: 40px auto;">
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon)" stroke-width="1.8" style="margin: 0 auto 14px auto; display: block;">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            <h3 style="font-family: var(--font-sans); font-size: 1.15rem; color: var(--color-white); margin-bottom: 8px;">Combos en Preparación</h3>
            <p style="font-family: var(--font-sans); font-size: 0.82rem; color: var(--color-ash-gray); margin-bottom: 24px; line-height: 1.5;">
              Puedes armar tu pedido personalizado directamente seleccionando los servicios desde el catálogo.
            </p>
            <button class="btn-primary" id="pkg-btn-explore">
              EXPLORAR CATÁLOGO
            </button>
          </div>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;">
            ${combos.map(combo => {
              const finalPriceUSD = Number(combo.price) || 0;
              const finalDual = currencyService.getDualPrice(finalPriceUSD);
              const discountText = combo.discount_pct ? `-${combo.discount_pct}% OFF` : 'COMBO';

              let normalPriceUSD = finalPriceUSD;
              if (combo.discount_pct && combo.discount_pct > 0) {
                normalPriceUSD = parseFloat((finalPriceUSD / (1 - combo.discount_pct / 100)).toFixed(2));
              }
              const normalDual = currencyService.getDualPrice(normalPriceUSD);

              return `
                <div class="glass-card" style="padding: 24px; display: flex; flex-direction: column; justify-content: space-between;">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                      <span style="font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; padding: 3px 8px; border-radius: 4px; background: var(--color-neon-wash); color: var(--color-neon); border: 1px solid var(--color-border-glass);">
                        ${discountText}
                      </span>
                      <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-smoke-gray);">
                        ${combo.duration || '1 Mes'}
                      </span>
                    </div>

                    <h2 style="font-family: var(--font-sans); font-size: 1.15rem; font-weight: 700; margin: 0 0 10px 0; color: var(--color-white); line-height: 1.3;">
                      ${combo.name}
                    </h2>

                    <p style="font-family: var(--font-sans); font-size: 0.8rem; color: var(--color-ash-gray); line-height: 1.5; margin-bottom: 20px;">
                      ${combo.description || 'Paquete exclusivo con activación inmediata y soporte.'}
                    </p>
                  </div>

                  <div>
                    <div style="margin-bottom: 18px; padding: 12px 14px; background: rgba(2, 132, 199, 0.04); border: 1px solid var(--color-border-glass); border-radius: 8px; display: flex; justify-content: space-between; align-items: baseline; gap: 8px;">
                      <div style="display: flex; align-items: baseline; gap: 8px;">
                        <span style="font-family: var(--font-mono); font-size: 1.45rem; font-weight: 700; color: var(--color-neon);">
                          ${finalDual.main}
                        </span>
                        ${normalPriceUSD > finalPriceUSD ? `
                          <span style="font-family: var(--font-mono); font-size: 0.82rem; text-decoration: line-through; color: var(--color-smoke-gray);">
                            ${normalDual.main}
                          </span>
                        ` : ''}
                      </div>
                      <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-smoke-gray); white-space: nowrap;">
                        ${finalDual.secondary}
                      </span>
                    </div>

                    <div style="display: flex; gap: 8px;">
                      <button class="btn-primary btn-buy-pkg" data-id="${combo.id}" style="flex: 1; padding: 11px;">
                        COMPRAR AHORA
                      </button>
                      <button class="btn-ghost btn-cart-pkg" data-id="${combo.id}" style="padding: 11px 14px;" title="Agregar al carrito">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    </section>
  `;

  // Attach events
  document.getElementById('pkg-back-home')?.addEventListener('click', () => {
    callbacks.onNavigate?.('home');
  });

  document.getElementById('pkg-btn-explore')?.addEventListener('click', () => {
    callbacks.onNavigate?.('catalog');
  });

  container.querySelectorAll('.btn-buy-pkg').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const combo = combos.find(c => c.id === id);
      if (combo) {
        cartService.addItem({
          id: combo.id,
          name: combo.name,
          image_url: combo.image_url || 'https://alkyktnfhjtaxisykxfp.supabase.co/storage/v1/object/public/products/quinet.png',
          product_type: 'combo',
          planName: 'Combo Especial',
          duration: combo.duration || '1 Mes',
          priceUSD: Number(combo.price) || 0,
          quantity: 1
        });
        callbacks.onOpenCheckout?.();
      }
    });
  });

  container.querySelectorAll('.btn-cart-pkg').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const combo = combos.find(c => c.id === id);
      if (combo) {
        cartService.addItem({
          id: combo.id,
          name: combo.name,
          image_url: combo.image_url || 'https://alkyktnfhjtaxisykxfp.supabase.co/storage/v1/object/public/products/quinet.png',
          product_type: 'combo',
          planName: 'Combo Especial',
          duration: combo.duration || '1 Mes',
          priceUSD: Number(combo.price) || 0,
          quantity: 1
        });
        showToast(`¡${combo.name} agregado al carrito!`);
      }
    });
  });
}
