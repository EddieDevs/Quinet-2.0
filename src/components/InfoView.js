import { ADMIN_WHATSAPP } from '../config/supabase.js';

export function renderInfoView(callbacks = {}) {
  const container = document.getElementById('info-mount');
  if (!container) return;

  container.innerHTML = `
    <section class="section-padding" style="padding-top: calc(var(--navbar-height) + 30px); min-height: 85vh;">
      <div class="container" style="max-width: 820px;">
        
        <!-- BREADCRUMB -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <button class="btn-ghost btn-sm" id="info-back-home" style="gap:6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              Inicio
            </button>
            <span style="font-size:0.75rem; color:var(--color-smoke-gray); font-family:var(--font-mono);">/ INFORMACIÓN</span>
          </div>

          <button class="btn-ghost btn-sm" id="info-btn-to-shop">
            VOLVER A TIENDA
          </button>
        </div>

        <div class="section-header" style="text-align: left; margin-bottom: 28px;">
          <span class="section-tag">SOBRE EL PROYECTO</span>
          <h1 style="font-family: var(--font-serif); font-size: clamp(2.4rem, 4.5vw, 3.8rem); margin: 6px 0; color: var(--color-white);">
            Información // <span style="font-style: italic; color: var(--color-neon);">QuinetShop</span>
          </h1>
        </div>

        <!-- ORIGINAL EXACT CONTENT CARD -->
        <div class="glass-card" style="padding: 32px; margin-bottom: 30px; line-height: 1.8;">
          <p style="font-family: var(--font-sans); font-size: 0.92rem; color: var(--color-bone-white); margin-bottom: 24px;">
            Quinet Shop es una tienda virtual de servicios de streaming, juegos y recargas de plataformas digitales, todo en bolívares venezolanos, con pago móvil y al mejor precio. La tasa es 0,5% sobre el valor del dólar para garantizar la adquisición de activos digitales y el mantenimiento de este emprendimiento. Quinet Shop es un proyecto desarrollado por Eddie. Te invitamos a recomendarnos para seguir creciendo juntos. Gracias por confiar en nosotros.
          </p>

          <div style="border-top: 1px solid var(--color-graphite-hairline); padding-top: 24px; margin-top: 24px;">
            <h3 style="font-family: var(--font-sans); font-size: 1.05rem; font-weight: 700; color: var(--color-neon); margin: 0 0 14px 0; display:flex; align-items:center; gap:8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Términos de Servicio y Garantía
            </h3>

            <div style="font-family: var(--font-sans); font-size: 0.8rem; color: var(--color-ash-gray); line-height: 1.7; display: flex; flex-direction: column; gap: 10px;">
              <p style="margin: 0;">
                1. <b>Validez y Duración:</b> Cada servicio contratado tiene una vigencia garantizada correspondiente al período seleccionado al momento de la compra (1 mes, 3 meses, etc.).
              </p>
              <p style="margin: 0;">
                2. <b>Soporte Técnico:</b> En caso de que se presente alguna interrupción o caída de acceso durante el período activo, el cliente debe reportarlo por el canal de chat o WhatsApp para su reactivación o reposición inmediata.
              </p>
              <p style="margin: 0;">
                3. <b>Uso de Cuentas:</b> En cuentas con perfiles y pantallas asignadas, se debe respetar el uso del perfil asignado sin modificar contraseñas ni datos maestros de la cuenta.
              </p>
              <p style="margin: 0;">
                4. <b>Pagos y Tasas:</b> Los pagos se procesan en bolívares a la tasa oficial del BCV del día, o en divisas netas por los canales verificados.
              </p>
            </div>
          </div>
        </div>

        <!-- CONTACT CHANNELS -->
        <div class="glass-panel" style="padding: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="font-family: var(--font-sans); font-weight: 700; font-size: 0.95rem; color: var(--color-white); margin-bottom: 4px;">¿Deseas comunicarte directamente?</div>
            <div style="font-family: var(--font-sans); font-size: 0.78rem; color: var(--color-ash-gray);">Atención y canal oficial disponible 24/7.</div>
          </div>
          <a href="https://wa.me/${ADMIN_WHATSAPP}" target="_blank" class="btn-primary" style="padding: 11px 22px; font-size: 0.82rem; gap: 8px; text-decoration: none;">
            <span>CONTACTAR POR WHATSAPP</span>
          </a>
        </div>

      </div>
    </section>
  `;

  document.getElementById('info-back-home')?.addEventListener('click', () => {
    callbacks.onNavigate?.('home');
  });

  document.getElementById('info-btn-to-shop')?.addEventListener('click', () => {
    callbacks.onNavigate?.('catalog');
  });
}
