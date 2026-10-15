import { currencyService } from '../services/currency.js';
import { productsService } from '../services/products.js';
import { cartService } from '../services/cart.js';
import { showToast } from './Toast.js';

export function renderPackages(callbacks = {}) {
  const container = document.getElementById('packages-mount');
  if (!container) return;

  const combos = productsService.getCombos();

  container.innerHTML = `
    <section id="paquetes" class="section-padding" style="border-top:1px solid var(--color-graphite-hairline);">
      <div class="container">
        <div class="section-header">
          <span class="section-tag">COMBOS & PROMOCIONES</span>
          <h2 class="section-title">Paquetes con Descuento Especial</h2>
          <p class="section-desc">
            Combina tus servicios preferidos a un precio menor que comprarlos por separado.
          </p>
        </div>

        ${combos.length === 0 ? `
          <div class="glass-panel" style="padding:40px 24px; text-align:center; max-width:620px; margin:auto;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon)" stroke-width="1.8" style="margin:0 auto 12px auto; display:block;">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            <h3 style="font-size:1.4rem; color:var(--color-white); margin-bottom:8px;">Combos en Preparación</h3>
            <p style="font-size:0.85rem; color:var(--color-ash-gray); margin-bottom:20px; line-height:1.5;">
              Puedes armar tu pedido personalizado agregando múltiples servicios directamente desde el catálogo.
            </p>
            <button class="btn-primary" id="btn-explore-from-packages">
              VER CATÁLOGO COMPLETO
            </button>
          </div>
        ` : `
          <div class="packages-grid">
            ${combos.map(combo => {
              const finalDual = currencyService.getDualPrice(finalPriceUSD);
              const discountText = combo.discount_pct ? `-${combo.discount_pct}% Descuento` : 'Precio Combo';

              // Extract normal price if saved in description
              let normalPriceUSD = finalPriceUSD;
              let cleanDesc = combo.description || '';
              if (combo.discount_pct && combo.discount_pct > 0) {
                normalPriceUSD = parseFloat((finalPriceUSD / (1 - combo.discount_pct / 100)).toFixed(2));
              }
              const normalDual = currencyService.getDualPrice(normalPriceUSD);

              return `
                <div class="glass-card" style="padding:28px; display:flex; flex-direction:column; justify-content:space-between;">
                  <div>
                    <div style="display:inline-block; font-family:var(--font-mono); font-size:0.7rem; padding:3px 8px; border-radius:4px; background:var(--color-neon-wash); color:var(--color-neon); border:1px solid var(--color-border-glass); margin-bottom:12px;">
                      ${discountText}
                    </div>

                    <h3 style="font-size:1.4rem; margin-bottom:8px; color:var(--color-white);">${combo.name}</h3>

                    <p style="font-size:0.82rem; color:var(--color-ash-gray); line-height:1.5; margin-bottom:18px;">
                      ${cleanDesc || 'Paquete especial con activación inmediata y soporte.'}
                    </p>

                    <div style="margin-bottom:20px; padding:12px 14px; background:rgba(2, 132, 199, 0.04); border:1px solid var(--color-border-glass); border-radius:8px;">
                      <div style="display:flex; justify-content:space-between; align-items:baseline; gap:8px;">
                        <div style="display:flex; align-items:baseline; gap:8px;">
                          <span style="font-family:var(--font-mono); font-size:1.5rem; font-weight:700; color:var(--color-neon);">
                            ${finalDual.main}
                          </span>
                          ${normalPriceUSD > finalPriceUSD ? `
                            <span style="font-family:var(--font-mono); font-size:0.82rem; text-decoration:line-through; color:var(--color-smoke-gray);">
                              ${normalDual.main}
                            </span>
                          ` : ''}
                        </div>
                        <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--color-smoke-gray); white-space:nowrap;">
                          ${finalDual.secondary}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style="display:flex; gap:10px;">
                    <button class="btn-primary btn-buy-combo" data-id="${combo.id}" style="flex:1;">
                      COMPRAR COMBO
                    </button>
                    <button class="btn-ghost btn-cart-combo" data-id="${combo.id}" style="padding:10px;" title="Agregar al carrito">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    </section>
  `;

  document.getElementById('btn-explore-from-packages')?.addEventListener('click', () => {
    callbacks.onNavigate?.('catalog');
  });

  // Attach dynamic combo buttons
  container.querySelectorAll('.btn-buy-combo').forEach(btn => {
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

  container.querySelectorAll('.btn-cart-combo').forEach(btn => {
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
