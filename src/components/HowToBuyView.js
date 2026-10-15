export function renderHowToBuyView(callbacks = {}) {
  const container = document.getElementById('howtobuy-mount');
  if (!container) return;

  container.innerHTML = `
    <section class="section-padding" style="padding-top: calc(var(--navbar-height) + 30px); min-height: 85vh;">
      <div class="container" style="max-width: 920px;">
        
        <!-- BREADCRUMB -->
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:20px;">
          <button class="btn-ghost btn-sm" id="hbuy-back-home" style="gap:6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Inicio
          </button>
          <span style="font-size:0.75rem; color:var(--color-smoke-gray); font-family:var(--font-mono);">/ CÓMO COMPRAR</span>
        </div>

        <div class="section-header" style="text-align: left; margin-bottom: 36px;">
          <span class="section-tag">GUÍA PASO A PASO</span>
          <h1 style="font-family: var(--font-serif); font-size: clamp(2.4rem, 4.5vw, 3.8rem); margin: 6px 0; color: var(--color-white);">
            ¿Cómo adquirir tus <span style="font-style: italic; color: var(--color-neon);">servicios</span>?
          </h1>
          <p style="font-family: var(--font-sans); font-size: 0.88rem; color: var(--color-ash-gray); max-width: 620px; margin: 0; line-height: 1.6;">
            El proceso es rápido, transparente y 100% asistido por nuestro canal de soporte técnico.
          </p>
        </div>

        <!-- 3 STEPS CARDS -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-bottom: 40px;">
          
          <div class="glass-card" style="padding: 24px;">
            <div style="font-family: var(--font-mono); font-size: 1.6rem; font-weight: 700; color: var(--color-neon); margin-bottom: 8px;">01.</div>
            <h3 style="font-family: var(--font-sans); font-size: 1.05rem; font-weight: 700; color: var(--color-white); margin: 0 0 8px 0;">Selecciona el Servicio</h3>
            <p style="font-family: var(--font-sans); font-size: 0.8rem; color: var(--color-ash-gray); line-height: 1.5; margin: 0;">
              Ingresa al catálogo o a paquetes. Puedes elegir planes por mes o por duraciones extendidas con descuento.
            </p>
          </div>

          <div class="glass-card" style="padding: 24px;">
            <div style="font-family: var(--font-mono); font-size: 1.6rem; font-weight: 700; color: var(--color-neon); margin-bottom: 8px;">02.</div>
            <h3 style="font-family: var(--font-sans); font-size: 1.05rem; font-weight: 700; color: var(--color-white); margin: 0 0 8px 0;">Realiza el Pago</h3>
            <p style="font-family: var(--font-sans); font-size: 0.8rem; color: var(--color-ash-gray); line-height: 1.5; margin: 0;">
              Cancela en bolívares mediante Pago Móvil a la tasa oficial del día o utiliza Binance Pay, PayPal y Zinli sin comisión extra.
            </p>
          </div>

          <div class="glass-card" style="padding: 24px;">
            <div style="font-family: var(--font-mono); font-size: 1.6rem; font-weight: 700; color: var(--color-neon); margin-bottom: 8px;">03.</div>
            <h3 style="font-family: var(--font-sans); font-size: 1.05rem; font-weight: 700; color: var(--color-white); margin: 0 0 8px 0;">Entrega y Garantía</h3>
            <p style="font-family: var(--font-sans); font-size: 0.8rem; color: var(--color-ash-gray); line-height: 1.5; margin: 0;">
              Sube la foto del comprobante. Tu pedido se registra de inmediato y recibes tus credenciales y PIN en tu panel con soporte activo.
            </p>
          </div>

        </div>

        <!-- MÉTODOS DE PAGO DISPONIBLES -->
        <div class="glass-panel" style="padding: 28px; margin-bottom: 40px;">
          <h3 style="font-family: var(--font-sans); font-size: 1.15rem; color: var(--color-white); margin: 0 0 16px 0;">Métodos de Pago Aceptados</h3>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px;">
            <div style="padding: 14px; background: var(--color-surface-glass-elevated); border: 1px solid var(--color-border-glass); border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
              <div style="font-weight: 700; font-size: 0.85rem; color: var(--color-white); margin-bottom: 4px;">Pago Móvil (Bs)</div>
              <div style="font-size: 0.75rem; color: var(--color-ash-gray);">BNC y toda la banca nacional a tasa oficial BCV.</div>
            </div>
            
            <div style="padding: 14px; background: var(--color-surface-glass-elevated); border: 1px solid var(--color-border-glass); border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
              <div style="font-weight: 700; font-size: 0.85rem; color: var(--color-white); margin-bottom: 4px;">Binance Pay (USDT)</div>
              <div style="font-size: 0.75rem; color: var(--color-ash-gray);">Transferencias cripto directas al instante.</div>
            </div>

            <div style="padding: 14px; background: var(--color-surface-glass-elevated); border: 1px solid var(--color-border-glass); border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
              <div style="font-weight: 700; font-size: 0.85rem; color: var(--color-white); margin-bottom: 4px;">PayPal (USD)</div>
              <div style="font-size: 0.75rem; color: var(--color-ash-gray);">Envío neto mediante saldo PayPal.</div>
            </div>

            <div style="padding: 14px; background: var(--color-surface-glass-elevated); border: 1px solid var(--color-border-glass); border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
              <div style="font-weight: 700; font-size: 0.85rem; color: var(--color-white); margin-bottom: 4px;">Zinli (USD)</div>
              <div style="font-size: 0.75rem; color: var(--color-ash-gray);">Billeteras digitales internacionales.</div>
            </div>
          </div>
        </div>

        <!-- FAQ -->
        <div style="margin-bottom: 40px;">
          <h3 style="font-family: var(--font-sans); font-size: 1.25rem; color: var(--color-white); margin-bottom: 16px;">Preguntas Frecuentes</h3>
          
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div class="glass-card" style="padding: 18px;">
              <div style="font-weight: 700; font-size: 0.9rem; color: var(--color-neon); margin-bottom: 4px;">¿Cuánto tiempo tarda la entrega?</div>
              <div style="font-size: 0.8rem; color: var(--color-ash-gray); line-height: 1.5;">Una vez validado el comprobante de pago, la activación se procesa normalmente en pocos minutos.</div>
            </div>

            <div class="glass-card" style="padding: 18px;">
              <div style="font-weight: 700; font-size: 0.9rem; color: var(--color-neon); margin-bottom: 4px;">¿Cómo opera la garantía?</div>
              <div style="font-size: 0.8rem; color: var(--color-ash-gray); line-height: 1.5;">Todos los servicios cuentan con respaldo por el período contratado. En caso de inconveniente técnico, nuestro equipo efectúa la reactivación inmediata.</div>
            </div>

            <div class="glass-card" style="padding: 18px;">
              <div style="font-weight: 700; font-size: 0.9rem; color: var(--color-neon); margin-bottom: 4px;">¿Puedo renovar mi misma cuenta?</div>
              <div style="font-size: 0.8rem; color: var(--color-ash-gray); line-height: 1.5;">Sí. En servicios como Spotify, Netflix o Disney+ puedes conservar tu perfil y renovarlo mes a mes desde tu panel de cliente.</div>
            </div>
          </div>
        </div>

        <!-- CTA TO CATALOG -->
        <div style="text-align: center;">
          <button class="btn-primary" id="hbuy-btn-catalog" style="padding: 13px 32px; font-size: 0.9rem;">
            IR AL CATÁLOGO DE PRODUCTOS
          </button>
        </div>

      </div>
    </section>
  `;

  // Attach events
  document.getElementById('hbuy-back-home')?.addEventListener('click', () => {
    callbacks.onNavigate?.('home');
  });

  document.getElementById('hbuy-btn-catalog')?.addEventListener('click', () => {
    callbacks.onNavigate?.('catalog');
  });
}
