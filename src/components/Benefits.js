import { ADMIN_WHATSAPP } from '../config/supabase.js';

export function renderBenefits(callbacks = {}) {
  const container = document.getElementById('benefits-mount');
  if (!container) return;

  container.innerHTML = `
    <section id="beneficios" class="section-padding" style="border-top: 1px solid var(--color-graphite-hairline);">
      <div class="container">
        <!-- HOW IT WORKS -->
        <div class="section-header">
          <span class="section-tag">PROCESO DE COMPRA</span>
          <h2 class="section-title">¿Cómo adquirir tus servicios?</h2>
          <p class="section-desc">
            Activación rápida y segura en 3 pasos directos.
          </p>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:20px; margin-bottom:50px;">
          <div class="glass-card" style="padding:24px;">
            <div style="font-family:var(--font-mono); font-size:1.6rem; font-weight:700; color:var(--color-neon); margin-bottom:10px;">01.</div>
            <h3 style="font-size:1.25rem; margin-bottom:8px; color:var(--color-white);">Selecciona el Servicio</h3>
            <p style="font-size:0.85rem; color:var(--color-ash-gray); line-height:1.5;">
              Escoge el servicio de streaming, recarga o juego. En servicios por suscripción puedes seleccionar la duración que prefieras.
            </p>
          </div>

          <div class="glass-card" style="padding:24px;">
            <div style="font-family:var(--font-mono); font-size:1.6rem; font-weight:700; color:var(--color-neon); margin-bottom:10px;">02.</div>
            <h3 style="font-size:1.25rem; margin-bottom:8px; color:var(--color-white);">Realiza el Pago</h3>
            <p style="font-size:0.85rem; color:var(--color-ash-gray); line-height:1.5;">
              Paga en bolívares a la tasa oficial del BCV mediante Pago Móvil, o utiliza Binance Pay, PayPal y Zinli sin comisión extra.
            </p>
          </div>

          <div class="glass-card" style="padding:24px;">
            <div style="font-family:var(--font-mono); font-size:1.6rem; font-weight:700; color:var(--color-neon); margin-bottom:10px;">03.</div>
            <h3 style="font-size:1.25rem; margin-bottom:8px; color:var(--color-white);">Entrega y Soporte</h3>
            <p style="font-size:0.85rem; color:var(--color-ash-gray); line-height:1.5;">
              Adjunta tu comprobante y se generará tu canal de soporte para recibir tus credenciales con garantía respaldada.
            </p>
          </div>
        </div>

        <!-- PAYMENT METHODS ACCEPTED -->
        <div class="glass-panel" style="padding:28px; margin-bottom:50px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:20px;">
            <div>
              <span class="section-tag">MÉTODOS DE PAGO DISPONIBLES</span>
              <h3 style="font-size:1.5rem; color:var(--color-white); margin:0;">Opciones de pago directo</h3>
            </div>
            <div class="rate-indicator-pill">
              <span class="status-dot"></span>
              <span>Tasa oficial BCV</span>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px;">
            <div style="background:var(--color-surface-glass-elevated); padding:16px; border-radius:8px; border:1px solid var(--color-border-glass); box-shadow:0 2px 8px rgba(0,0,0,0.04);">
              <div style="font-weight:600; color:var(--color-white); margin-bottom:4px;">
                Pago Móvil (Bs)
              </div>
              <p style="font-size:0.75rem; color:var(--color-ash-gray); margin:0;">
                Banco BNC (0191) y cualquier entidad bancaria nacional a tasa oficial.
              </p>
            </div>

            <div style="background:var(--color-surface-glass-elevated); padding:16px; border-radius:8px; border:1px solid var(--color-border-glass); box-shadow:0 2px 8px rgba(0,0,0,0.04);">
              <div style="font-weight:600; color:var(--color-white); margin-bottom:4px;">
                Binance Pay (USDT)
              </div>
              <p style="font-size:0.75rem; color:var(--color-ash-gray); margin:0;">
                Transferencias cripto directas sin comisiones internas.
              </p>
            </div>

            <div style="background:var(--color-surface-glass-elevated); padding:16px; border-radius:8px; border:1px solid var(--color-border-glass); box-shadow:0 2px 8px rgba(0,0,0,0.04);">
              <div style="font-weight:600; color:var(--color-white); margin-bottom:4px;">
                PayPal (USD)
              </div>
              <p style="font-size:0.75rem; color:var(--color-ash-gray); margin:0;">
                Envío neto mediante saldo PayPal en dólares.
              </p>
            </div>

            <div style="background:var(--color-surface-glass-elevated); padding:16px; border-radius:8px; border:1px solid var(--color-border-glass); box-shadow:0 2px 8px rgba(0,0,0,0.04);">
              <div style="font-weight:600; color:var(--color-white); margin-bottom:4px;">
                Zinli (USD)
              </div>
              <p style="font-size:0.75rem; color:var(--color-ash-gray); margin:0;">
                Billeteras digitales y tarjetas internacionales.
              </p>
            </div>
          </div>
        </div>

        <!-- FAQ SECTION -->
        <div class="section-header">
          <span class="section-tag">PREGUNTAS FRECUENTES</span>
          <h2 class="section-title">Dudas habituales</h2>
        </div>

        <div style="display:flex; flex-direction:column; gap:14px; max-width:860px;">
          <div class="glass-card" style="padding:18px;">
            <h4 style="font-size:0.95rem; color:var(--color-neon); margin-bottom:6px;">¿Cómo recibo mis accesos o recarga?</h4>
            <p style="font-size:0.85rem; color:var(--color-ash-gray); line-height:1.5; margin:0;">
              Al confirmar el pago con tu comprobante, se habilita de inmediato tu canal de soporte en vivo y panel de cliente donde se hace la entrega con PIN y datos de acceso.
            </p>
          </div>

          <div class="glass-card" style="padding:18px;">
            <h4 style="font-size:0.95rem; color:var(--color-neon); margin-bottom:6px;">¿Qué tipo de garantía ofrecen?</h4>
            <p style="font-size:0.85rem; color:var(--color-ash-gray); line-height:1.5; margin:0;">
              Todos los servicios cuentan con respaldo durante el período contratado. En caso de alguna eventualidad técnica, se solventa de inmediato.
            </p>
          </div>

          <div class="glass-card" style="padding:18px;">
            <h4 style="font-size:0.95rem; color:var(--color-neon); margin-bottom:6px;">¿Puedo renovar mi mismo perfil?</h4>
            <p style="font-size:0.85rem; color:var(--color-ash-gray); line-height:1.5; margin:0;">
              Sí. En servicios como Spotify, Netflix o Disney+ puedes conservar tu mismo perfil y renovarlo mes a mes desde tu panel.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- MINIMALIST TECH FOOTER -->
    <footer style="border-top:1px solid var(--color-graphite-hairline); padding:36px 0; background:var(--color-void-black);">
      <div class="container" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-family:var(--font-serif); font-size:1.3rem; color:var(--color-white);">Quinet<b style="color:var(--color-neon);">SHOP</b></span>
          <span style="font-size:0.75rem; color:var(--color-smoke-gray); font-family:var(--font-mono);">© 2026 • Eddie</span>
        </div>
        <div style="display:flex; gap:20px; font-size:0.8rem; font-family:var(--font-mono);">
          <a href="https://wa.me/${ADMIN_WHATSAPP}" target="_blank" style="color:var(--color-neon); text-decoration:none;">WhatsApp Soporte</a>
          <span style="color:var(--color-charcoal);">|</span>
          <span style="color:var(--color-smoke-gray);">Tasa Oficial BCV</span>
          <span style="color:var(--color-charcoal);">|</span>
          <span style="color:var(--color-ash-gray);">Garantía 100%</span>
        </div>
      </div>
    </footer>
  `;
}
