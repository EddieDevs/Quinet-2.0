import { authService } from '../services/auth.js';
import { showToast } from './Toast.js';

let authMode = 'login'; // 'login' | 'register' | 'forgot_password'

export function openAuthModal(callbacks = {}) {
  const modal = document.getElementById('auth-modal-overlay');
  if (!modal) return;

  renderAuthContent(callbacks);
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

export function closeAuthModal() {
  const modal = document.getElementById('auth-modal-overlay');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

export function renderAuthContent(callbacks = {}) {
  const dialog = document.getElementById('auth-modal-dialog');
  if (!dialog) return;

  dialog.innerHTML = `
    <div style="max-width:390px; margin:auto; position:relative;">
      <button class="modal-close-btn" id="auth-close-btn" style="position:absolute; top:-10px; right:-10px;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      <!-- BRAND LOGO (CLEAN, NO CROPPING) -->
      <div style="text-align:center; margin-bottom:20px;">
        <img src="https://alkyktnfhjtaxisykxfp.supabase.co/storage/v1/object/public/products/quinet.png" 
             alt="QuinetShop" 
             style="width:auto; max-width:56px; height:50px; margin:0 auto 10px auto; display:block; filter:drop-shadow(0 0 14px rgba(0, 180, 216,0.35)); object-fit:contain; border-radius:6px;"
             onerror="this.style.display='none'">
        <h3 style="font-size:1.45rem; color:var(--color-white); margin-bottom:4px;">
          ${authMode === 'login' ? 'Bienvenido a QuinetShop' : authMode === 'register' ? 'Crear Cuenta en QuinetShop' : 'Recuperar Contraseña'}
        </h3>
        <p style="font-size:0.8rem; color:var(--color-ash-gray); margin:0;">
          ${authMode === 'login' ? 'Ingresa para gestionar tus pedidos y servicios.' : authMode === 'register' ? 'Regístrate para comprar y rastrear tus suscripciones.' : 'Ingresa tu correo para recibir un enlace seguro de restablecimiento.'}
        </p>
      </div>

      ${authMode !== 'forgot_password' ? `
        <!-- GOOGLE OAUTH BUTTON -->
        <button class="btn-ghost" id="btn-auth-google" style="width:100%; padding:11px; margin-bottom:18px; font-size:0.85rem; gap:10px;">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continuar con Google</span>
        </button>

        <div style="display:flex; align-items:center; gap:12px; margin-bottom:18px;">
          <div style="flex:1; height:1px; background:var(--color-graphite-hairline);"></div>
          <span style="font-size:0.75rem; color:var(--color-smoke-gray); font-family:var(--font-mono);">O CON CORREO</span>
          <div style="flex:1; height:1px; background:var(--color-graphite-hairline);"></div>
        </div>
      ` : ''}

      <!-- FORM FIELDS -->
      <form id="auth-form" style="display:flex; flex-direction:column; gap:12px;">
        ${authMode === 'register' ? `
          <div>
            <label style="font-size:0.75rem; color:var(--color-smoke-gray); margin-bottom:4px; display:block;">Nombre Completo:</label>
            <input type="text" id="auth-name" placeholder="Tu nombre" required>
          </div>
          <div>
            <label style="font-size:0.75rem; color:var(--color-smoke-gray); margin-bottom:4px; display:block;">Teléfono / WhatsApp:</label>
            <input type="tel" id="auth-phone" placeholder="0424-1234567" required>
          </div>
        ` : ''}

        <div>
          <label style="font-size:0.75rem; color:var(--color-smoke-gray); margin-bottom:4px; display:block;">Correo Electrónico:</label>
          <input type="email" id="auth-email" placeholder="usuario@gmail.com" required>
        </div>

        ${authMode !== 'forgot_password' ? `
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <label style="font-size:0.75rem; color:var(--color-smoke-gray);">Contraseña:</label>
              ${authMode === 'login' ? `
                <a href="#" id="auth-link-forgot" style="font-size:0.72rem; color:var(--color-neon); text-decoration:none;">
                  ¿Olvidaste tu contraseña?
                </a>
              ` : ''}
            </div>
            <input type="password" id="auth-pass" placeholder="••••••••" required>
          </div>
        ` : ''}

        <button type="submit" class="btn-primary" id="btn-auth-submit" style="width:100%; padding:12px; margin-top:8px;">
          ${authMode === 'login' ? 'INICIAR SESIÓN' : authMode === 'register' ? 'CREAR MI CUENTA' : 'ENVIAR ENLACE DE RECUPERACIÓN'}
        </button>
      </form>

      <!-- SWITCH MODE -->
      <div style="text-align:center; margin-top:16px; font-size:0.8rem; color:var(--color-ash-gray);">
        ${authMode === 'login' ? `
          <span>¿No tienes una cuenta? </span>
          <a href="#" id="auth-toggle-mode" style="color:var(--color-neon); text-decoration:underline;">Regístrate</a>
        ` : authMode === 'register' ? `
          <span>¿Ya tienes cuenta? </span>
          <a href="#" id="auth-toggle-mode" style="color:var(--color-neon); text-decoration:underline;">Inicia sesión</a>
        ` : `
          <a href="#" id="auth-back-to-login" style="color:var(--color-neon); text-decoration:underline;">Volver a Iniciar Sesión</a>
        `}
      </div>
    </div>
  `;

  document.getElementById('auth-close-btn')?.addEventListener('click', closeAuthModal);

  document.getElementById('auth-toggle-mode')?.addEventListener('click', (e) => {
    e.preventDefault();
    authMode = authMode === 'login' ? 'register' : 'login';
    renderAuthContent(callbacks);
  });

  document.getElementById('auth-link-forgot')?.addEventListener('click', (e) => {
    e.preventDefault();
    authMode = 'forgot_password';
    renderAuthContent(callbacks);
  });

  document.getElementById('auth-back-to-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    authMode = 'login';
    renderAuthContent(callbacks);
  });

  document.getElementById('btn-auth-google')?.addEventListener('click', async () => {
    try {
      await authService.signInWithGoogle();
    } catch (e) {
      showToast('Error con Google: ' + e.message, true);
    }
  });

  document.getElementById('auth-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email')?.value.trim();
    const btn = document.getElementById('btn-auth-submit');

    if (!email) return;

    if (authMode === 'forgot_password') {
      if (btn) btn.innerText = 'ENVIANDO...';
      try {
        await authService.resetPassword(email);
        showToast('Enlace de recuperación enviado a tu correo. Revisa tu bandeja de entrada.');
        authMode = 'login';
        renderAuthContent(callbacks);
      } catch (err) {
        showToast(err.message || 'Error al solicitar recuperación.', true);
        if (btn) btn.innerText = 'ENVIAR ENLACE DE RECUPERACIÓN';
      }
      return;
    }

    const pass = document.getElementById('auth-pass')?.value;
    if (!pass) return;

    if (btn) btn.innerText = 'PROCESANDO...';

    try {
      if (authMode === 'login') {
        await authService.signIn(email, pass);
        showToast('¡Sesión iniciada con éxito!');
      } else {
        const name = document.getElementById('auth-name')?.value.trim();
        const phone = document.getElementById('auth-phone')?.value.trim();
        await authService.signUp(email, pass, { display_name: name, phone: phone });
        showToast('¡Cuenta creada con éxito! Bienvenido.');
      }
      closeAuthModal();
    } catch (err) {
      showToast(err.message || 'Error de autenticación.', true);
      if (btn) btn.innerText = authMode === 'login' ? 'INICIAR SESIÓN' : 'CREAR MI CUENTA';
    }
  });
}
