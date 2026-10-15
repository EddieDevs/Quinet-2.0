import { authService } from '../services/auth.js';
import { chatService } from '../services/chat.js';
import { ADMIN_WHATSAPP } from '../config/supabase.js';
import { showToast } from './Toast.js';

let isChatOpen = false;
let pendingFile = null;

export function renderChatWidget(callbacks = {}) {
  const mount = document.getElementById('chat-widget-mount');
  if (!mount) return;

  const unread = chatService.getUnreadCount();
  const user = authService.getUser();

  mount.innerHTML = `
    <!-- FLOATING DOCK BUTTON -->
    <div class="chat-dock-btn" id="chat-dock-trigger" title="Chat de Soporte en Vivo">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span id="chat-unread-badge" style="position:absolute; top:-4px; right:-4px; background:var(--color-neon); color:var(--color-void-black); font-family:var(--font-mono); font-size:0.65rem; font-weight:bold; width:18px; height:18px; border-radius:50%; display:${unread > 0 ? 'flex' : 'none'}; align-items:center; justify-content:center;">
        ${unread}
      </span>
    </div>

    <!-- FLOATING CHAT WINDOW -->
    <div class="chat-window-floating ${isChatOpen ? 'open' : ''}" id="chat-window-container">
      <!-- HEADER -->
      <div style="padding:14px 18px; border-bottom:1px solid var(--color-border-glass); display:flex; justify-content:space-between; align-items:center; background:var(--color-surface-glass-elevated);">
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="status-dot"></span>
          <div>
            <div style="font-weight:600; font-size:0.88rem; color:var(--color-white);">Soporte QuinetShop</div>
            <div style="font-size:0.68rem; color:var(--color-neon); font-family:var(--font-mono);">Canal Oficial Activo</div>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:6px;">
          <a href="https://wa.me/${ADMIN_WHATSAPP}" target="_blank" class="btn-ghost btn-sm" style="padding:4px 8px; font-size:0.7rem; color:#25D366; text-decoration:none;" title="Abrir WhatsApp">
            WhatsApp
          </a>
          <button class="modal-close-btn" id="chat-btn-close" style="position:static; width:28px; height:28px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      <!-- MESSAGES AREA -->
      <div id="chat-messages-scroll" style="flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; background:var(--color-surface-glass);">
        ${!user ? `
          <div style="text-align:center; padding:40px 10px; color:var(--color-ash-gray);">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon)" stroke-width="1.8" style="margin:0 auto 12px auto; display:block;">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <p style="font-size:0.85rem; margin-bottom:14px;">Inicia sesión para consultar tus pedidos y comunicarte con el equipo.</p>
            <button class="btn-primary btn-sm" id="chat-login-btn">INICIAR SESIÓN</button>
            <div style="margin-top:16px;">
              <span style="font-size:0.75rem; color:var(--color-smoke-gray);">O escríbenos directamente por </span>
              <a href="https://wa.me/${ADMIN_WHATSAPP}" target="_blank" style="color:var(--color-neon); font-size:0.75rem; text-decoration:underline;">WhatsApp</a>
            </div>
          </div>
        ` : `
          <!-- Welcome Admin message -->
          <div style="align-self:flex-start; max-width:85%; background:var(--color-surface-glass-elevated); border:1px solid var(--color-border-glass); border-radius:10px; padding:10px 14px; font-size:0.8rem; color:var(--color-bone-white); line-height:1.4; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            Bienvenido al canal de soporte de <b>QuinetShop</b>. Envíanos tu número de pedido o consulta y te atenderemos de inmediato.
          </div>
          <div id="chat-dynamic-messages" style="display:flex; flex-direction:column; gap:10px;"></div>
        `}
      </div>

      <!-- INPUT BAR -->
      ${user ? `
        <div style="padding:12px; border-top:1px solid var(--color-border-glass); background:var(--color-surface-glass-elevated);">
          ${pendingFile ? `
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0, 180, 216,0.08); border:1px solid var(--color-neon); border-radius:6px; padding:4px 8px; margin-bottom:8px; font-size:0.75rem;">
              <span style="color:var(--color-neon); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display:flex; align-items:center; gap:4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                ${pendingFile.name}
              </span>
              <button id="btn-cancel-file" style="background:none; border:none; color:var(--color-danger); cursor:pointer; display:inline-flex; align-items:center;" title="Cancelar archivo">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          ` : ''}

          <div style="display:flex; gap:8px;">
            <label for="chat-file-upload" class="btn-ghost btn-icon" style="flex-shrink:0; cursor:pointer;" title="Adjuntar comprobante o imagen">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
            </label>
            <input type="file" id="chat-file-upload" accept="image/*" style="display:none;">

            <input type="text" id="chat-input-field" placeholder="Escribe tu mensaje..." style="flex:1; padding:8px 12px; font-size:0.82rem;">

            <button class="btn-primary btn-icon" id="chat-btn-send" style="flex-shrink:0;" title="Enviar">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  attachChatEvents(callbacks);
  if (user) {
    updateChatMessagesList();
  }
}

function attachChatEvents(callbacks) {
  const dock = document.getElementById('chat-dock-trigger');
  const win = document.getElementById('chat-window-container');
  const closeBtn = document.getElementById('chat-btn-close');

  dock?.addEventListener('click', () => {
    isChatOpen = !isChatOpen;
    win?.classList.toggle('open', isChatOpen);
    if (isChatOpen) {
      chatService.markAsRead();
    }
  });

  closeBtn?.addEventListener('click', () => {
    isChatOpen = false;
    win?.classList.remove('open');
  });

  document.getElementById('chat-login-btn')?.addEventListener('click', () => {
    callbacks.onOpenAuth?.();
  });

  // File upload
  document.getElementById('chat-file-upload')?.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      pendingFile = e.target.files[0];
      renderChatWidget(callbacks);
    }
  });

  document.getElementById('btn-cancel-file')?.addEventListener('click', () => {
    pendingFile = null;
    renderChatWidget(callbacks);
  });

  // Send message
  const send = async () => {
    const input = document.getElementById('chat-input-field');
    const text = input?.value.trim() || '';
    const user = authService.getUser();
    if (!text && !pendingFile) return;

    if (input) input.value = '';
    const fileToSend = pendingFile;
    pendingFile = null;

    try {
      await chatService.sendMessage(user, text, fileToSend);
      renderChatWidget(callbacks);
      updateChatMessagesList();
    } catch (e) {
      showToast('Error al enviar mensaje: ' + e.message, true);
    }
  };

  document.getElementById('chat-btn-send')?.addEventListener('click', send);
  document.getElementById('chat-input-field')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') send();
  });
}

export function formatChatMessage(text) {
  if (!text) return '';
  let safe = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  safe = safe.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--color-neon); text-decoration:underline;">$1</a>');
  safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--color-white); font-weight:700;">$1</strong>');
  safe = safe.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return safe;
}

export function updateChatMessagesList() {
  const container = document.getElementById('chat-dynamic-messages');
  if (!container) return;

  const msgs = chatService.getMessages();
  container.innerHTML = msgs.map(m => {
    const isClient = m.sender === 'user' || m.sender_role === 'client';
    const fileUrl = m.file_url || m.image_url;
    const msgText = m.text || m.content || '';

    return `
      <div style="align-self:${isClient ? 'flex-end' : 'flex-start'}; max-width:85%; background:${isClient ? 'var(--color-neon-wash-strong)' : 'var(--color-surface-glass-elevated)'}; border:1px solid ${isClient ? 'var(--color-border-glass)' : 'var(--color-graphite-hairline)'}; border-radius:10px; padding:10px 12px; font-size:0.8rem; color:var(--color-bone-white); line-height:1.4; box-shadow:0 2px 6px rgba(0,0,0,0.05);">
        ${fileUrl ? `
          <div style="cursor:pointer; margin-bottom:6px; position:relative; overflow:hidden; border-radius:6px; border:1px solid var(--color-graphite-hairline);" onclick="window.openImageViewer ? window.openImageViewer('${fileUrl}', 'Adjunto / Comprobante de Chat') : window.open('${fileUrl}')" title="Haz clic para ampliar imagen">
            <img src="${fileUrl}" style="max-width:100%; max-height:160px; display:block; border-radius:6px;" alt="Adjunto">
            <div style="position:absolute; bottom:4px; right:4px; background:rgba(0,0,0,0.65); border-radius:4px; padding:2px 6px; font-size:0.65rem; color:#fff; display:flex; align-items:center; gap:3px;">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
              <span>Ver</span>
            </div>
          </div>
        ` : ''}
        <div style="white-space:pre-wrap; word-break:break-word;">${formatChatMessage(msgText)}</div>
        <div style="font-size:0.65rem; color:var(--color-smoke-gray); text-align:right; margin-top:4px; font-family:var(--font-mono);">
          ${new Date(m.created_at).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    `;
  }).join('');

  // Scroll to bottom
  const scrollContainer = document.getElementById('chat-messages-scroll');
  if (scrollContainer) {
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
  }
}

export function openChatWindow() {
  isChatOpen = true;
  document.getElementById('chat-window-container')?.classList.add('open');
  chatService.markAsRead();
}
