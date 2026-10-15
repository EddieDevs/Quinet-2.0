import { chatService } from '../services/chat.js';
import { ADMIN_WHATSAPP } from '../config/supabase.js';

export function renderHotbar(callbacks = {}) {
  const mount = document.getElementById('floating-dock-mount');
  if (!mount) return;

  const unread = chatService.getUnreadCount();

  mount.innerHTML = `
    <div class="floating-dock">
      <!-- 1. INFORMACIÓN & TÉRMINOS -->
      <a class="floating-btn" id="dock-btn-info" title="Información y Términos">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <circle cx="12" cy="8" r="1" fill="currentColor"></circle>
        </svg>
      </a>

      <!-- 2. CHAT DE SOPORTE EN VIVO -->
      <a class="floating-btn" id="dock-btn-chat" title="Chat de Soporte">
        <span id="dock-chat-badge" class="dock-chat-badge" style="display:${unread > 0 ? 'flex' : 'none'};">
          ${unread}
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </a>

      <!-- 3. WHATSAPP OFICIAL -->
      <a href="https://wa.me/${ADMIN_WHATSAPP}?text=Hola!%20Vengo%20de%20QuinetShop%20y%20quisiera%20m%C3%A1s%20informaci%C3%B3n." target="_blank" class="floating-btn whatsapp" title="WhatsApp Soporte">
        <svg viewBox="0 0 448 512">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l121.7-31.9c32.4 17.7 68.9 27 105.6 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
        </svg>
      </a>

      <!-- 4. INSTAGRAM OFICIAL -->
      <a href="https://www.instagram.com/quinetshop/" target="_blank" class="floating-btn instagram" title="Instagram @quinetshop">
        <svg viewBox="0 0 448 512">
          <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
        </svg>
      </a>

      <!-- 5. TRUSTPILOT OPINIONES -->
      <a href="https://es.trustpilot.com/review/quinet.shop" target="_blank" class="floating-btn trustpilot" title="Reseñas en Trustpilot">
        <svg viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"/>
        </svg>
      </a>

      <!-- 6. CALCULADORA EXPANDIDA (ICONO + TEXTO "Calculadora") -->
      <div class="floating-btn-calc-expanded" id="dock-btn-calc" title="Calculadora Dólar / Bs">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
          <rect x="4" y="2" width="16" height="20" rx="2"></rect>
          <line x1="8" y1="6" x2="16" y2="6"></line>
          <line x1="16" y1="14" x2="16" y2="18"></line>
          <path d="M16 10h.01"></path>
          <path d="M12 10h.01"></path>
          <path d="M8 10h.01"></path>
          <path d="M12 14h.01"></path>
          <path d="M8 14h.01"></path>
          <path d="M12 18h.01"></path>
          <path d="M8 18h.01"></path>
        </svg>
        <span>Calculadora</span>
      </div>
    </div>
  `;

  // Attach dock button actions
  document.getElementById('dock-btn-info')?.addEventListener('click', () => {
    callbacks.onNavigate?.('info');
  });

  document.getElementById('dock-btn-chat')?.addEventListener('click', () => {
    callbacks.onOpenChat?.();
  });

  document.getElementById('dock-btn-calc')?.addEventListener('click', () => {
    callbacks.onOpenRateModal?.();
  });
}
