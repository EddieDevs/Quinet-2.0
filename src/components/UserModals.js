import { authService } from '../services/auth.js';
import { ordersService } from '../services/orders.js';
import { productsService } from '../services/products.js';
import { currencyService } from '../services/currency.js';
import { showToast } from './Toast.js';

export function openOrdersModal() {
  const user = authService.getUser();
  if (!user) return showToast('Inicia sesión para ver tus pedidos.', true);

  const modal = document.getElementById('user-modal-overlay');
  const dialog = document.getElementById('user-modal-dialog');
  if (!modal || !dialog) return;

  dialog.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <h3 style="font-size:1.3rem; color:var(--color-white); margin:0; display:flex; align-items:center; gap:8px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon)" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        Historial de Pedidos
      </h3>
      <button class="modal-close-btn" id="btn-close-user-modal" style="position:static;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    <div id="user-orders-list" style="max-height:60vh; overflow-y:auto; display:flex; flex-direction:column; gap:12px;">
      <div style="text-align:center; padding:30px; color:var(--color-ash-gray);">Cargando tus pedidos...</div>
    </div>
  `;

  document.getElementById('btn-close-user-modal')?.addEventListener('click', closeUserModal);
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  loadOrdersData(user);
}

async function loadOrdersData(user) {
  const container = document.getElementById('user-orders-list');
  if (!container) return;

  const orders = await ordersService.fetchUserOrders(user);
  if (orders.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px; color:var(--color-ash-gray);">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon)" stroke-width="1.8" style="margin:0 auto 10px auto; display:block;">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
        <p>Aún no has realizado pedidos.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = orders.map(o => {
    let statusClass = 'color: var(--color-neon);';
    let statusBg = 'rgba(0, 180, 216,0.1)';
    let statusBorder = 'rgba(0, 180, 216,0.3)';
    const isPending = o.status === 'PENDIENTE';
    const isCompleted = o.status === 'COMPLETADO';
    const isCancelled = o.status === 'CANCELADO' || o.status?.startsWith('CANCELADO');
    let statusLabel = o.status;

    if (isPending) {
      statusClass = 'color: #ffca16;';
      statusBg = 'rgba(255,202,22,0.1)';
      statusBorder = 'rgba(255,202,22,0.3)';
    } else if (isCancelled) {
      statusClass = 'color: var(--color-danger);';
      statusBg = 'rgba(255,77,79,0.1)';
      statusBorder = 'rgba(255,77,79,0.3)';
      let meta = o.user_metadata;
      if (typeof meta === 'string') {
        try { meta = JSON.parse(meta); } catch(e) { meta = {}; }
      }
      const cancelledBy = meta?.cancelled_by || (o.status === 'CANCELADO_POR_USUARIO' ? 'usuario' : (o.status === 'CANCELADO_POR_ADMIN' ? 'admin' : null));
      if (cancelledBy === 'usuario') {
        statusLabel = 'CANCELADO POR TI';
      } else if (cancelledBy === 'admin') {
        statusLabel = 'CANCELADO POR ADMIN';
      } else {
        statusLabel = 'CANCELADO';
      }
    } else if (isCompleted) {
      statusClass = 'color: #10b981;';
      statusBg = 'rgba(16,185,129,0.12)';
      statusBorder = 'rgba(16,185,129,0.3)';
    }

    const prods = Array.isArray(o.products) ? o.products.join(', ') : o.products;
    const dateStr = new Date(o.created_at).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' });

    return `
      <div class="glass-card" style="padding:16px; ${isPending ? 'border-color:rgba(255,202,22,0.35);' : isCancelled ? 'border-color:rgba(255,77,79,0.25); opacity:0.85;' : ''}">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-family:var(--font-mono); font-weight:bold; color:var(--color-white); font-size:0.9rem;">
            ${o.order_number || '#ORDEN'}
          </span>
          <span style="font-family:var(--font-mono); font-size:0.68rem; padding:3px 8px; border-radius:4px; ${statusClass} background:${statusBg}; border:1px solid ${statusBorder}; font-weight:600; display:inline-flex; align-items:center; gap:5px;">
            ${isPending ? '<span class="status-dot" style="background:#ffca16; box-shadow:0 0 6px #ffca16; width:5px; height:5px;"></span>' : ''}
            ${statusLabel}
          </span>
        </div>
        <div style="font-size:0.82rem; color:var(--color-bone-white); margin-bottom:6px;">
          <b>Productos:</b> ${prods}
        </div>
        ${isPending ? `
          <div style="font-size:0.72rem; color:#ffca16; background:rgba(255,202,22,0.08); border-radius:6px; padding:6px 10px; margin-bottom:8px; display:flex; align-items:center; gap:6px;">
            <span>Validando pago, esto puede tomar unos minutos...</span>
          </div>
        ` : ''}
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; color:var(--color-smoke-gray); border-top:1px solid var(--color-graphite-hairline); padding-top:8px;">
          <span>${dateStr}</span>
          <span style="font-family:var(--font-mono); font-weight:bold; color:var(--color-white);">
            Total: $${Number(o.total || 0).toFixed(2)} USD <span style="font-size:0.7rem; color:var(--color-smoke-gray);">(~${(Number(o.total || 0) * (currencyService.rates.USD_VES || 1)).toFixed(2)} BS)</span>
          </span>
        </div>
        ${o.payment_reference ? `
          <div style="font-size:0.72rem; color:var(--color-neon); font-family:var(--font-mono); margin-top:6px; display:flex; justify-content:flex-end;">
            <span>Ref. Pago Móvil: <b>${o.payment_reference}</b></span>
          </div>
        ` : ''}
        <div style="display:flex; justify-content:flex-end; gap:6px; margin-top:8px; border-top:1px dashed var(--color-graphite-hairline); padding-top:6px;">
          ${!isCancelled ? `
            <button class="btn-ghost btn-sm btn-modal-cancel-order" data-id="${o.id}" data-ordernum="${o.order_number || ''}" style="color:var(--color-danger); border-color:rgba(255,77,79,0.3); font-size:0.68rem; padding:2px 8px;">
              Cancelar Orden
            </button>
          ` : `
            <button class="btn-ghost btn-sm btn-modal-dismiss-order" data-id="${o.id}" data-ordernum="${o.order_number || ''}" style="color:var(--color-ash-gray); border-color:rgba(255,255,255,0.15); font-size:0.68rem; padding:2px 8px;">
              Eliminar del historial
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.btn-modal-cancel-order').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const orderId = e.currentTarget.getAttribute('data-id');
      const orderNum = e.currentTarget.getAttribute('data-ordernum');
      if (!confirm(`¿Estás seguro de que deseas cancelar la orden ${orderNum}? Se marcará como cancelada.`)) return;
      try {
        await ordersService.cancelOrder(orderId, user.id, 'usuario');
        showToast('Orden cancelada exitosamente.');
        loadOrdersData(user);
      } catch (err) {
        showToast('Error al cancelar la orden: ' + err.message, true);
      }
    });
  });

  container.querySelectorAll('.btn-modal-dismiss-order').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const orderId = e.currentTarget.getAttribute('data-id');
      const orderNum = e.currentTarget.getAttribute('data-ordernum');
      if (!confirm(`¿Deseas eliminar la orden ${orderNum} de tu historial?`)) return;
      ordersService.dismissOrder(orderId, orderNum);
      showToast('Orden eliminada de tu historial.');
      loadOrdersData(user);
    });
  });
}

export function openServicesModal(callbacks = {}) {
  const user = authService.getUser();
  if (!user) return showToast('Inicia sesión para ver tus servicios.', true);

  const modal = document.getElementById('user-modal-overlay');
  const dialog = document.getElementById('user-modal-dialog');
  if (!modal || !dialog) return;

  dialog.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <h3 style="font-size:1.3rem; color:var(--color-white); margin:0; display:flex; align-items:center; gap:8px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        Mis Servicios y Cuentas Activas
      </h3>
      <button class="modal-close-btn" id="btn-close-user-modal" style="position:static;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    <div id="user-services-list" style="max-height:60vh; overflow-y:auto; display:flex; flex-direction:column; gap:12px;">
      <div style="text-align:center; padding:30px; color:var(--color-ash-gray);">Consultando servicios y credenciales...</div>
    </div>
  `;

  document.getElementById('btn-close-user-modal')?.addEventListener('click', closeUserModal);
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  loadServicesData(user, callbacks);
}

async function loadServicesData(user, callbacks) {
  const container = document.getElementById('user-services-list');
  if (!container) return;

  const [orders, assignedAccounts] = await Promise.all([
    ordersService.fetchUserOrders(user),
    ordersService.fetchAssignedAccounts(user)
  ]);
  const completedOrders = orders.filter(o => o.status === 'COMPLETADO');
  const activeAccounts = assignedAccounts || [];

  if (completedOrders.length === 0 && activeAccounts.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px; color:var(--color-ash-gray);">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon)" stroke-width="1.8" style="margin:0 auto 10px auto; display:block;">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
        <p>No tienes suscripciones activas aún.</p>
      </div>
    `;
    return;
  }

  let html = '';

  if (activeAccounts.length > 0) {
    html += `
      <div style="margin-bottom:8px;">
        <span style="font-size:0.75rem; text-transform:uppercase; letter-spacing:1px; color:var(--color-neon); font-weight:bold;">Credenciales Asignadas</span>
      </div>
      ${activeAccounts.map(acc => `
        <div class="glass-card" style="padding:16px; border-color:rgba(0,180,216,0.35);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <h4 style="font-size:0.95rem; color:var(--color-white); margin:0;">${acc.service_name}</h4>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-family:var(--font-mono); font-size:0.68rem; color:#10b981; background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.3); padding:2px 8px; border-radius:4px;">
                ACTIVA
              </span>
              <button class="btn-ghost btn-sm btn-modal-delete-acc" data-id="${acc.id}" data-ordernum="${acc.assigned_order_number || ''}" data-service="${acc.service_name}" title="Eliminar servicio" style="color:var(--color-danger); border-color:rgba(255,77,79,0.3); font-size:0.65rem; padding:1px 6px;">
                Eliminar
              </button>
            </div>
          </div>
          <div style="background:var(--color-surface-glass-elevated); padding:10px; border-radius:6px; font-family:var(--font-mono); font-size:0.75rem; margin-bottom:8px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="color:var(--color-smoke-gray);">Correo:</span>
              ${acc.email ? `
                <div style="display:flex; align-items:center; gap:6px;">
                  <span style="color:var(--color-white); font-weight:bold;">${acc.email}</span>
                  <button class="btn-ghost btn-sm btn-portal-copy" data-copy="${acc.email}" style="padding:1px 5px; font-size:0.65rem;">Copiar</button>
                </div>
              ` : `
                <span style="color:var(--color-ash-gray); font-style:italic; font-size:0.72rem;">(Por suministrar)</span>
              `}
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="color:var(--color-smoke-gray);">Contraseña:</span>
              ${acc.password ? `
                <div style="display:flex; align-items:center; gap:6px;">
                  <span class="cred-pass-val" data-pass="${acc.password}" style="color:var(--color-neon); font-weight:bold;">••••••••</span>
                  <button class="btn-ghost btn-sm btn-portal-reveal" style="padding:1px 5px; font-size:0.65rem;">Ver</button>
                  <button class="btn-ghost btn-sm btn-portal-copy" data-copy="${acc.password}" style="padding:1px 5px; font-size:0.65rem;">Copiar</button>
                </div>
              ` : `
                <span style="color:var(--color-ash-gray); font-style:italic; font-size:0.72rem;">(Por suministrar)</span>
              `}
            </div>
            ${acc.profile_name ? `
              <div style="display:flex; justify-content:space-between; margin-bottom:4px; border-top:1px dashed var(--color-graphite-hairline); padding-top:4px;">
                <span style="color:var(--color-smoke-gray);">Perfil:</span>
                <span style="color:var(--color-white);">${acc.profile_name}</span>
              </div>
            ` : ''}
            ${acc.pin ? `
              <div style="display:flex; justify-content:space-between; ${!acc.profile_name ? 'border-top:1px dashed var(--color-graphite-hairline); padding-top:4px;' : ''}">
                <span style="color:var(--color-smoke-gray);">PIN:</span>
                <span style="color:var(--color-neon);">${acc.pin}</span>
              </div>
            ` : ''}
          </div>
        </div>
      `).join('')}
    `;
  }

  if (completedOrders.length > 0) {
    html += `
      <div style="margin-top:10px; margin-bottom:8px;">
        <span style="font-size:0.75rem; text-transform:uppercase; letter-spacing:1px; color:var(--color-smoke-gray); font-weight:bold;">Historial de Suscripciones</span>
      </div>
      ${completedOrders.map(o => {
        const productsArr = Array.isArray(o.products) ? o.products : [o.products];
        const orderDate = new Date(o.created_at);

        return productsArr.map(pName => {
          const expDate = new Date(orderDate.getTime() + 30 * 24 * 60 * 60 * 1000);
          const isExpired = new Date() > expDate;

          return `
            <div class="glass-card" style="padding:14px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <h4 style="font-size:0.9rem; color:var(--color-white); margin:0;">${pName}</h4>
                <span style="font-family:var(--font-mono); font-size:0.68rem; padding:2px 8px; border-radius:4px; ${isExpired ? 'color:var(--color-danger); background:rgba(255,77,79,0.1); border:1px solid rgba(255,77,79,0.3);' : 'color:var(--color-neon); background:var(--color-neon-wash); border:1px solid var(--color-border-glass);'}">
                  ${isExpired ? 'EXPIRADO' : 'ACTIVO'}
                </span>
              </div>
              <div style="font-size:0.75rem; color:var(--color-ash-gray); margin-bottom:6px;">
                <div><b>Adquirido:</b> ${orderDate.toLocaleDateString('es-VE')}</div>
                <div><b>Vence:</b> ${expDate.toLocaleDateString('es-VE')}</div>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed var(--color-graphite-hairline); padding-top:6px; margin-top:6px;">
                <span style="font-size:0.7rem; color:var(--color-smoke-gray); font-family:var(--font-mono);">${o.order_number || ''}</span>
                <button class="btn-ghost btn-sm btn-modal-cancel-approved-order" data-id="${o.id}" data-ordernum="${o.order_number || ''}" data-service="${pName}" style="color:var(--color-danger); border-color:rgba(255,77,79,0.3); font-size:0.65rem; padding:1px 8px;">
                  Cancelar / Eliminar
                </button>
              </div>
            </div>
          `;
        }).join('');
      }).join('')}
    `;
  }

  container.innerHTML = html;

  container.querySelectorAll('.btn-modal-cancel-approved-order').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const orderId = e.currentTarget.getAttribute('data-id');
      const orderNum = e.currentTarget.getAttribute('data-ordernum');
      const sName = e.currentTarget.getAttribute('data-service') || 'esta suscripción';
      if (!confirm(`¿Estás seguro de que deseas cancelar la suscripción de "${sName}" (${orderNum})? Se marcará como cancelada.`)) return;
      try {
        await ordersService.cancelOrder(orderId, user.id, 'usuario');
        showToast('Suscripción cancelada exitosamente.');
        loadServicesData(user, callbacks);
      } catch (err) {
        showToast('Error al cancelar: ' + err.message, true);
      }
    });
  });

  container.querySelectorAll('.btn-modal-delete-acc').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const accId = e.currentTarget.getAttribute('data-id');
      const orderNum = e.currentTarget.getAttribute('data-ordernum');
      const sName = e.currentTarget.getAttribute('data-service') || 'este servicio';
      if (!confirm(`¿Estás seguro de que deseas eliminar "${sName}" de tu lista de servicios?`)) return;
      await ordersService.removeAssignedAccount(accId, user.id, orderNum);
      showToast('Servicio eliminado de tu lista.');
      loadServicesData(user, callbacks);
    });
  });

  container.querySelectorAll('.btn-portal-copy').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const text = e.currentTarget.getAttribute('data-copy');
      if (text) {
        navigator.clipboard.writeText(text);
        showToast('Copiado al portapapeles.');
      }
    });
  });

  container.querySelectorAll('.btn-portal-reveal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const span = e.currentTarget.parentElement.querySelector('.cred-pass-val');
      if (span) {
        const pass = span.getAttribute('data-pass');
        if (span.innerText === '••••••••') {
          span.innerText = pass;
          e.currentTarget.innerText = 'Ocultar';
        } else {
          span.innerText = '••••••••';
          e.currentTarget.innerText = 'Ver';
        }
      }
    });
  });

  container.querySelectorAll('.btn-renew-service').forEach(btn => {
    btn.addEventListener('click', () => {
      closeUserModal();
      callbacks.onNavigate?.('catalog');
    });
  });
}

export function openProfileModal() {
  const user = authService.getUser();
  if (!user) return showToast('Inicia sesión para editar tu perfil.', true);

  const modal = document.getElementById('user-modal-overlay');
  const dialog = document.getElementById('user-modal-dialog');
  if (!modal || !dialog) return;

  dialog.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <h3 style="font-size:1.3rem; color:var(--color-white); margin:0; display:flex; align-items:center; gap:8px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon)" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        Editar Perfil
      </h3>
      <button class="modal-close-btn" id="btn-close-user-modal" style="position:static;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>

    <div style="display:flex; flex-direction:column; gap:14px; max-width:400px; margin:auto;">
      <div>
        <label style="font-size:0.75rem; color:var(--color-smoke-gray); margin-bottom:4px; display:block;">Correo Electrónico:</label>
        <input type="text" value="${user.email}" disabled style="opacity:0.6; cursor:not-allowed;">
      </div>

      <div>
        <label style="font-size:0.75rem; color:var(--color-smoke-gray); margin-bottom:4px; display:block;">Nombre Completo:</label>
        <input type="text" id="profile-input-name" value="${user.user_metadata?.display_name || ''}" placeholder="Tu nombre">
      </div>

      <div>
        <label style="font-size:0.75rem; color:var(--color-smoke-gray); margin-bottom:4px; display:block;">Número de Teléfono / WhatsApp:</label>
        <input type="tel" id="profile-input-phone" value="${user.user_metadata?.phone || ''}" placeholder="0424-1234567">
      </div>

      <div>
        <label style="font-size:0.75rem; color:var(--color-smoke-gray); margin-bottom:4px; display:block;">Nueva Contraseña (opcional):</label>
        <input type="password" id="profile-input-pass" placeholder="Dejar en blanco para conservar actual">
      </div>

      <div style="margin-top:10px;">
        <button class="btn-primary" id="btn-save-profile" style="width:100%; padding:12px;">
          GUARDAR CAMBIOS
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-close-user-modal')?.addEventListener('click', closeUserModal);
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  document.getElementById('btn-save-profile')?.addEventListener('click', async () => {
    const name = document.getElementById('profile-input-name')?.value.trim();
    const phone = document.getElementById('profile-input-phone')?.value.trim();
    const pass = document.getElementById('profile-input-pass')?.value;

    const btn = document.getElementById('btn-save-profile');
    if (btn) btn.innerText = 'GUARDANDO...';

    try {
      const updates = {
        data: {
          display_name: name,
          phone: phone
        }
      };
      if (pass && pass.length >= 6) {
        updates.password = pass;
      }

      await authService.updateProfile(updates);
      showToast('Perfil actualizado con éxito.');
      closeUserModal();
    } catch (e) {
      showToast(e.message || 'Error al actualizar perfil.', true);
      if (btn) btn.innerText = 'GUARDAR CAMBIOS';
    }
  });
}

export function closeUserModal() {
  const modal = document.getElementById('user-modal-overlay');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}
