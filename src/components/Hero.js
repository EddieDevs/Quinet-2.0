import { authService } from '../services/auth.js';

export function renderHero(callbacks = {}) {
  const heroContainer = document.getElementById('hero-mount');
  if (!heroContainer) return;

  const user = authService.getUser();

  heroContainer.innerHTML = `
    <section class="section-padding" style="min-height: calc(100vh - var(--navbar-height)); display: flex; align-items: center; justify-content: center; padding-top: calc(var(--navbar-height) + 20px);">
      <div class="container" style="max-width: 820px; text-align: center;">
        
        <!-- BIENVENIDA INSTRUMENT SERIF -->
        <span class="section-tag" style="margin-bottom: 16px;">PLATAFORMA DIGITAL // <span class="text-venezuela-flag">VENEZUELA</span></span>
        
        <h1 style="font-family: var(--font-serif); font-size: clamp(3rem, 7vw, 5.2rem); font-weight: 400; line-height: 1.05; margin: 0 0 16px 0; color: var(--color-white); letter-spacing: -0.02em;">
          Bienvenido a <span style="font-style: italic; color: var(--color-neon);">QuinetShop</span>
        </h1>

        <p style="font-family: var(--font-sans); font-size: clamp(0.85rem, 1.8vw, 0.98rem); color: var(--color-ash-gray); line-height: 1.6; max-width: 580px; margin: 0 auto 32px auto;">
          Suscripciones de streaming, recargas gamer y cuentas digitales al instante. Todo en bolívares para toda Venezuela a tasa oficial BCV y divisas seguras.
        </p>

        <!-- ACCIONES PRINCIPALES: EXPLORAR PRODUCTOS E INICIAR SESIÓN -->
        <div style="display: flex; justify-content: center; align-items: center; gap: 14px; flex-wrap: wrap; margin-bottom: 48px;">
          <button class="btn-primary" id="hero-btn-explore" style="padding: 13px 28px; font-size: 0.88rem; gap: 8px;">
            <span>EXPLORAR PRODUCTOS</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>

          ${user ? `
            <button class="btn-ghost" id="hero-btn-account" style="padding: 13px 26px; font-size: 0.88rem; gap: 8px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span>MI PANEL DE CLIENTE</span>
            </button>
          ` : `
            <button class="btn-ghost" id="hero-btn-login" style="padding: 13px 26px; font-size: 0.88rem; gap: 8px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span>INICIAR SESIÓN</span>
            </button>
          `}
        </div>

        <!-- INFORMACIÓN: ACTIVACIÓN INMEDIATA, GARANTÍA Y PAGO MÓVIL -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 16px; text-align: left;">
          
          <div class="glass-card" style="padding: 20px;">
            <div style="width: 36px; height: 36px; border-radius: 6px; background: var(--color-neon-wash); border: 1px solid var(--color-border-glass); display: flex; align-items: center; justify-content: center; color: var(--color-neon); margin-bottom: 12px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            </div>
            <h3 style="font-family: var(--font-sans); font-size: 0.9rem; font-weight: 700; color: var(--color-white); margin: 0 0 4px 0;">Activación Inmediata</h3>
            <p style="font-family: var(--font-sans); font-size: 0.78rem; color: var(--color-ash-gray); margin: 0; line-height: 1.5;">Entrega rápida de credenciales por canal privado y soporte en vivo.</p>
          </div>

          <div class="glass-card" style="padding: 20px;">
            <div style="width: 36px; height: 36px; border-radius: 6px; background: var(--color-neon-wash); border: 1px solid var(--color-border-glass); display: flex; align-items: center; justify-content: center; color: var(--color-neon); margin-bottom: 12px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <h3 style="font-family: var(--font-sans); font-size: 0.9rem; font-weight: 700; color: var(--color-white); margin: 0 0 4px 0;">Garantía Total</h3>
            <p style="font-family: var(--font-sans); font-size: 0.78rem; color: var(--color-ash-gray); margin: 0; line-height: 1.5;">Respaldo y reposición continua durante toda la duración de tu plan.</p>
          </div>

          <div class="glass-card" style="padding: 20px;">
            <div style="width: 36px; height: 36px; border-radius: 6px; background: var(--color-neon-wash); border: 1px solid var(--color-border-glass); display: flex; align-items: center; justify-content: center; color: var(--color-neon); margin-bottom: 12px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            </div>
            <h3 style="font-family: var(--font-sans); font-size: 0.9rem; font-weight: 700; color: var(--color-white); margin: 0 0 4px 0;">Pago Móvil Nacional</h3>
            <p style="font-family: var(--font-sans); font-size: 0.78rem; color: var(--color-ash-gray); margin: 0; line-height: 1.5;">Paga en bolívares a tasa oficial BCV. También Binance y PayPal.</p>
          </div>

        </div>

      </div>
    </section>
  `;

  // Attach button events
  document.getElementById('hero-btn-explore')?.addEventListener('click', () => {
    callbacks.onNavigate?.('catalog');
  });

  document.getElementById('hero-btn-login')?.addEventListener('click', () => {
    callbacks.onOpenAuth?.();
  });

  document.getElementById('hero-btn-account')?.addEventListener('click', () => {
    callbacks.onNavigate?.('portal');
  });
}
