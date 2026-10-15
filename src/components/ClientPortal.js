import { authService } from '../services/auth.js';
import { ordersService } from '../services/orders.js';
import { chatService } from '../services/chat.js';
import { currencyService } from '../services/currency.js';
import { showToast } from './Toast.js';
import { formatChatMessage } from './ChatWidget.js';

let activePortalTab = 'orders'; // 'orders', 'services', 'profile', 'chat'
let portalSubscription = null;

export function setActivePortalTab(tab) {
  activePortalTab = tab;
}

export function getActivePortalTab() {
  return activePortalTab;
}

export function renderClientPortal(callbacks = {}) {
  const container = document.getElementById('portal-mount');
  if (!container) return;

  const user = authService.getUser();
  if (!user) {
    if (portalSubscription) {
      portalSubscription();
      portalSubscription = null;
    }

    container.innerHTML = `
      <section class="section-padding" style="padding-top: calc(var(--navbar-height) + 40px); min-height:75vh; display:flex; align-items:center; justify-content:center;">
        <div class="glass-panel" style="padding:40px; text-align:center; max-width:440px; width:100%;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon)" stroke-width="2" style="margin:0 auto 16px auto; display:block;">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <h2 style="font-size:2rem; margin-bottom:8px;">Acceso Requerido</h2>
          <p style="font-size:0.85rem; color:var(--color-ash-gray); margin-bottom:24px;">
            Inicia sesión o regístrate para acceder a tu panel de pedidos, cuentas activas y soporte.
          </p>
          <button class="btn-primary" id="portal-btn-login" style="width:100%; padding:12px;">
            INICIAR SESIÓN
          </button>
        </div>
      </section>
    `;

    document.getElementById('portal-btn-login')?.addEventListener('click', () => {
      callbacks.onOpenAuth?.();
    });
    return;
  }

  // Realtime subscription to live updates
  if (!portalSubscription) {
    portalSubscription = ordersService.subscribeToUserOrders(user, (payload) => {
      console.log('[ClientPortal] Notificación Realtime recibida:', payload);
      if (payload.eventType === 'UPDATE' && payload.new?.status === 'COMPLETADO') {
        showToast(`¡Tu pedido ${payload.new.order_number || ''} ha sido verificado y completado!`);
      } else if (payload.table === 'service_accounts') {
        showToast('¡Se han asignado nuevas credenciales a tu cuenta!');
      }
      renderPortalTabContent(user, callbacks);
    });
  }

  container.innerHTML = `
    <section class="section-padding" style="padding-top: calc(var(--navbar-height) + 30px); min-height:85vh;">
      <div class="container">
        <!-- HEADER -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; flex-wrap:wrap; gap:16px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
              <button class="btn-ghost btn-sm" id="portal-btn-back-home" style="gap:6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Volver a Inicio
              </button>
              <span style="font-size:0.75rem; color:var(--color-smoke-gray); font-family:var(--font-mono);">/ PANEL DEL CLIENTE</span>
            </div>
            <h1 style="font-size:clamp(2.2rem, 4vw, 3.2rem); margin:0;">
              Hola, <span class="italic-serif">${user.user_metadata?.display_name || user.email.split('@')[0]}</span>
            </h1>
            <p style="font-size:0.85rem; color:var(--color-ash-gray); margin-top:4px;">
              Gestiona tus compras, credenciales entregadas y soporte directo en tiempo real.
            </p>
          </div>

          <div style="display:flex; gap:10px;">
            <button class="btn-ghost" id="portal-btn-logout" style="border-color:rgba(255,77,79,0.3); color:var(--color-danger); font-size:0.8rem;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Cerrar Sesión
            </button>
          </div>
        </div>

        <!-- SUMMARY STATS BAR -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:16px; margin-bottom:28px;">
          <div class="glass-card" style="padding:18px;">
            <div style="font-size:0.72rem; color:var(--color-smoke-gray); font-family:var(--font-mono); text-transform:uppercase;">Correo de Cuenta</div>
            <div style="font-size:0.95rem; font-weight:600; color:var(--color-white); margin-top:4px; overflow:hidden; text-overflow:ellipsis;">${user.email}</div>
          </div>
          <div class="glass-card" style="padding:18px;">
            <div style="font-size:0.72rem; color:var(--color-smoke-gray); font-family:var(--font-mono); text-transform:uppercase;">WhatsApp Vinculado</div>
            <div style="font-size:0.95rem; font-weight:600; color:var(--color-neon); margin-top:4px;">${user.user_metadata?.phone || 'No registrado'}</div>
          </div>
          <div class="glass-card" style="padding:18px;">
            <div style="font-size:0.72rem; color:var(--color-smoke-gray); font-family:var(--font-mono); text-transform:uppercase;">Estado del Servicio</div>
            <div style="font-size:0.95rem; font-weight:600; color:var(--color-white); margin-top:4px; display:flex; align-items:center; gap:6px;">
              <span class="status-dot"></span>
              <span>Atención en Línea</span>
            </div>
          </div>
        </div>

        <!-- PORTAL NAVIGATION TABS -->
        <div class="portal-tabs-nav">
          <button class="portal-tab-btn ${activePortalTab === 'orders' ? 'active' : ''}" data-tab="orders">
            Historial de Pedidos
          </button>
          <button class="portal-tab-btn ${activePortalTab === 'services' ? 'active' : ''}" data-tab="services">
            Cuentas y Servicios Activos
          </button>
          <button class="portal-tab-btn ${activePortalTab === 'chat' ? 'active' : ''}" data-tab="chat">
            Canal de Soporte Directo
          </button>
          <button class="portal-tab-btn ${activePortalTab === 'profile' ? 'active' : ''}" data-tab="profile">
            Mis Datos y Perfil
          </button>
        </div>

        <!-- TAB CONTENT CONTAINER -->
        <div id="portal-tab-content"></div>
      </div>
    </section>
  `;

  // Attach nav events
  document.getElementById('portal-btn-back-home')?.addEventListener('click', () => {
    callbacks.onNavigate?.('home');
  });

  document.getElementById('portal-btn-logout')?.addEventListener('click', async () => {
    if (portalSubscription) {
      portalSubscription();
      portalSubscription = null;
    }
    await authService.signOut();
    callbacks.onNavigate?.('home');
    showToast('Sesión cerrada correctamente.');
  });

  document.querySelectorAll('.portal-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      activePortalTab = e.currentTarget.getAttribute('data-tab');
      renderClientPortal(callbacks);
    });
  });

  renderPortalTabContent(user, callbacks);
}

function getServiceExpirationInfo(serviceName, createdAt) {
  const sName = (serviceName || '').toLowerCase();
  const isRecarga = sName.includes('recarga') || sName.includes('pavos') || sName.includes('diamantes') || 
                    sName.includes('robux') || sName.includes('gemas') || sName.includes('wild cores') ||
                    sName.includes('recargas');

  if (isRecarga) {
    return {
      isRecarga: true,
      badgeText: 'ACREDITADO / PERMANENTE',
      badgeColor: '#10b981',
      badgeBg: 'rgba(16,185,129,0.12)',
      badgeBorder: 'rgba(16,185,129,0.3)',
      durationText: 'Recarga directa y permanente a tu cuenta de juego',
      isExpired: false
    };
  }

  let days = 30;
  if (sName.includes('1 año') || sName.includes('12 meses') || sName.includes('1 ano')) {
    days = 365;
  } else if (sName.includes('6 meses')) {
    days = 180;
  } else if (sName.includes('3 meses')) {
    days = 90;
  }

  const orderDate = new Date(createdAt);
  const expDate = new Date(orderDate.getTime() + days * 24 * 60 * 60 * 1000);
  const isExpired = new Date() > expDate;

  return {
    isRecarga: false,
    days,
    orderDate,
    expDate,
    isExpired,
    badgeText: isExpired ? 'PLAN VENCIDO' : 'OPERANDO',
    badgeColor: isExpired ? 'var(--color-danger)' : 'var(--color-neon)',
    badgeBg: isExpired ? 'rgba(255,77,79,0.1)' : 'rgba(0,180,216,0.12)',
    badgeBorder: isExpired ? 'rgba(255,77,79,0.3)' : 'rgba(0,180,216,0.3)',
    durationText: `${days} Días de Acceso Garantizado`
  };
}

async function renderPortalTabContent(user, callbacks) {
  const container = document.getElementById('portal-tab-content');
  if (!container) return;

  if (activePortalTab === 'orders') {
    // 1. ORDERS / TRANSACTION HISTORY
    container.innerHTML = '<div style="text-align:center; padding:30px; color:var(--color-ash-gray);">Cargando pedidos en tiempo real...</div>';
    const orders = await ordersService.fetchUserOrders(user);

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="glass-panel" style="padding:50px 20px; text-align:center; max-width:480px; margin:20px auto;">
          <h3 style="font-size:1.6rem; color:var(--color-white); margin-bottom:8px;">No tienes pedidos aún</h3>
          <p style="font-size:0.85rem; color:var(--color-ash-gray); margin-bottom:20px;">
            Cuando adquieras suscripciones o recargas, tus órdenes aparecerán aquí con su estado en tiempo real.
          </p>
          <button class="btn-primary" id="portal-btn-shop">EXPLORAR CATÁLOGO</button>
        </div>
      `;
      document.getElementById('portal-btn-shop')?.addEventListener('click', () => {
        callbacks.onNavigate?.('catalog');
      });
      return;
    }

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        ${orders.map(o => {
          let statusColor = 'var(--color-neon)';
          let statusBg = 'rgba(0,180,216,0.12)';
          let statusBorder = 'rgba(0,180,216,0.3)';
          const isPending = o.status === 'PENDIENTE';
          const isCompleted = o.status === 'COMPLETADO';
          const isCancelled = o.status === 'CANCELADO' || o.status?.startsWith('CANCELADO');
          let statusLabel = o.status;

          if (isPending) {
            statusColor = '#ffca16';
            statusBg = 'rgba(255,202,22,0.12)';
            statusBorder = 'rgba(255,202,22,0.4)';
          } else if (isCancelled) {
            statusColor = 'var(--color-danger)';
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
              statusLabel = 'CANCELADO POR ADMINISTRADOR';
            } else {
              statusLabel = 'CANCELADO';
            }
          } else if (isCompleted) {
            statusColor = '#10b981';
            statusBg = 'rgba(16,185,129,0.12)';
            statusBorder = 'rgba(16,185,129,0.35)';
          }

          const prods = Array.isArray(o.products) ? o.products.join(', ') : o.products;
          const dateStr = new Date(o.created_at).toLocaleString('es-VE', { dateStyle: 'medium', timeStyle: 'short' });
          const totalVal = Number(o.total || 0);
          const rateVal = currencyService.rates?.USD_VES || 1;
          const bsVal = (totalVal * rateVal).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

          return `
            <div class="glass-card" style="padding:22px; ${isPending ? 'border-color:rgba(255,202,22,0.35);' : isCancelled ? 'border-color:rgba(255,77,79,0.25); opacity:0.85;' : ''}">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="font-family:var(--font-mono); font-weight:700; color:var(--color-white); font-size:1.05rem;">
                    ${o.order_number || '#ORDEN'}
                  </span>
                  <span style="font-size:0.75rem; color:var(--color-smoke-gray); font-family:var(--font-mono);">${dateStr}</span>
                </div>
                <span style="font-family:var(--font-mono); font-size:0.72rem; padding:4px 10px; border-radius:4px; color:${statusColor}; background:${statusBg}; border:1px solid ${statusBorder}; font-weight:600; display:inline-flex; align-items:center; gap:6px;">
                  ${isPending ? '<span class="status-dot" style="background:#ffca16; box-shadow:0 0 6px #ffca16; width:6px; height:6px;"></span>' : ''}
                  ${statusLabel}
                </span>
              </div>

              <div style="font-size:0.9rem; color:var(--color-bone-white); margin-bottom:14px; line-height:1.5;">
                <span style="color:var(--color-smoke-gray);">Productos adquiridos:</span><br>
                <b>${prods}</b>
              </div>

              ${isPending ? `
                <div style="background:rgba(255,202,22,0.08); border:1px solid rgba(255,202,22,0.25); border-radius:8px; padding:12px 14px; margin-bottom:14px; display:flex; align-items:flex-start; gap:10px;">
                  <span class="status-dot" style="background:#ffca16; box-shadow:0 0 8px #ffca16; margin-top:4px; flex-shrink:0;"></span>
                  <div style="font-size:0.8rem; color:var(--color-bone-white); line-height:1.45;">
                    <strong style="color:#ffca16;">Validando pago, esto puede tomar unos minutos</strong>
                    <div style="color:var(--color-ash-gray); margin-top:2px;">
                      Estamos confirmando tu transacción. Te notificaremos en cuanto esté verificada para entregarte el pedido.
                    </div>
                  </div>
                </div>
              ` : ''}

              <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--color-graphite-hairline); padding-top:12px; flex-wrap:wrap; gap:10px;">
                <div>
                  <div style="font-size:0.8rem; color:var(--color-ash-gray);">
                    Total pagado: <b style="color:var(--color-neon); font-family:var(--font-mono); font-size:1.05rem;">$${totalVal.toFixed(2)} USD</b>
                    <span style="font-size:0.75rem; color:var(--color-smoke-gray); font-family:var(--font-mono); margin-left:4px;">(~${bsVal} BS)</span>
                  </div>
                  ${o.payment_reference ? `
                    <div style="font-size:0.72rem; color:var(--color-smoke-gray); font-family:var(--font-mono); margin-top:2px;">
                      Ref. Pago Móvil: <b style="color:var(--color-neon);">${o.payment_reference}</b>
                    </div>
                  ` : ''}
                </div>
                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                  ${o.comprobante_url ? `
                    <a href="${o.comprobante_url}" target="_blank" onclick="if(window.openImageViewer){event.preventDefault(); window.openImageViewer('${o.comprobante_url}', 'Comprobante de Orden ${o.order_number}');}" class="btn-ghost btn-sm" style="font-size:0.75rem; gap:5px; text-decoration:none; cursor:pointer;" title="Ver comprobante adjunto">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      Comprobante
                    </a>
                  ` : ''}
                  ${isCompleted ? `
                    <button class="btn-primary btn-sm btn-portal-view-credentials" data-ordernum="${o.order_number}" style="font-size:0.75rem; padding:6px 14px; gap:6px;">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      Ver Credenciales
                    </button>
                  ` : ''}
                  ${!isCancelled ? `
                    <button class="btn-ghost btn-sm btn-cancel-order" data-id="${o.id}" data-number="${o.order_number || ''}" style="color:var(--color-danger); border-color:rgba(239,68,68,0.3); font-size:0.75rem;">
                      Cancelar Orden
                    </button>
                  ` : `
                    <button class="btn-ghost btn-sm btn-dismiss-order" data-id="${o.id}" data-number="${o.order_number || ''}" style="color:var(--color-ash-gray); border-color:rgba(255,255,255,0.15); font-size:0.72rem;">
                      Eliminar del historial
                    </button>
                  `}
                  <button class="btn-ghost btn-sm btn-open-support-order" data-ordernum="${o.order_number}" style="font-size:0.75rem;">
                    Consultar Soporte
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.querySelectorAll('.btn-portal-view-credentials').forEach(btn => {
      btn.addEventListener('click', () => {
        activePortalTab = 'services';
        renderClientPortal(callbacks);
      });
    });

    container.querySelectorAll('.btn-cancel-order').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const orderId = e.currentTarget.getAttribute('data-id');
        const orderNum = e.currentTarget.getAttribute('data-number');
        if (!confirm(`¿Estás seguro de que deseas cancelar la orden ${orderNum}? Se marcará como cancelada.`)) return;
        try {
          await ordersService.cancelOrder(orderId, user.id, 'usuario');
          showToast('Orden cancelada exitosamente.');
          renderClientPortal(callbacks);
        } catch (err) {
          showToast('Error al cancelar la orden: ' + err.message, true);
        }
      });
    });

    container.querySelectorAll('.btn-dismiss-order').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const orderId = e.currentTarget.getAttribute('data-id');
        const orderNum = e.currentTarget.getAttribute('data-number');
        if (!confirm(`¿Deseas eliminar la orden ${orderNum} de tu historial de pedidos?`)) return;
        ordersService.dismissOrder(orderId, orderNum);
        showToast('Orden eliminada de tu historial.');
        renderClientPortal(callbacks);
      });
    });

    container.querySelectorAll('.btn-open-support-order').forEach(btn => {
      btn.addEventListener('click', () => {
        activePortalTab = 'chat';
        renderClientPortal(callbacks);
      });
    });

  } else if (activePortalTab === 'services') {
    // 2. ACTIVE SERVICES & DELIVERED CREDENTIALS
    container.innerHTML = '<div style="text-align:center; padding:30px; color:var(--color-ash-gray);">Consultando servicios y credenciales en vivo...</div>';
    const [orders, assignedAccounts] = await Promise.all([
      ordersService.fetchUserOrders(user),
      ordersService.fetchAssignedAccounts(user)
    ]);
    const completed = orders.filter(o => o.status === 'COMPLETADO');
    const activeDeliveredAccounts = assignedAccounts || [];

    if (activeDeliveredAccounts.length === 0 && completed.length === 0) {
      container.innerHTML = `
        <div class="glass-panel" style="padding:50px 20px; text-align:center; max-width:480px; margin:20px auto;">
          <h3 style="font-size:1.6rem; color:var(--color-white); margin-bottom:8px;">Sin suscripciones activas aún</h3>
          <p style="font-size:0.85rem; color:var(--color-ash-gray); margin-bottom:20px;">
            Una vez que tu orden sea verificada y completada, verás aquí las credenciales entregadas, usuario, contraseña, perfil y PIN en tiempo real.
          </p>
          <button class="btn-primary" id="portal-btn-shop-serv">EXPLORAR CATÁLOGO</button>
        </div>
      `;
      document.getElementById('portal-btn-shop-serv')?.addEventListener('click', () => {
        callbacks.onNavigate?.('catalog');
      });
      return;
    }

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:20px;">
        <!-- CUENTAS DIGITALES ENTREGADAS Y COMPLETADAS -->
        ${activeDeliveredAccounts.length > 0 ? `
          <div>
            <h3 style="font-size:1.35rem; color:var(--color-white); margin-bottom:12px; display:flex; align-items:center; gap:8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon)" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <span>Tus Credenciales y Cuentas Asignadas</span>
            </h3>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:14px;">
              ${activeDeliveredAccounts.map(acc => {
                const expInfo = getServiceExpirationInfo(acc.service_name, acc.created_at || new Date().toISOString());

                return `
                  <div class="glass-card" style="padding:18px; border-color:rgba(0,180,216,0.35); position:relative;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                      <div>
                        <span style="font-family:var(--font-mono); font-size:0.68rem; color:var(--color-neon); text-transform:uppercase; background:rgba(0,180,216,0.1); padding:2px 6px; border-radius:4px;">
                          ${acc.assigned_order_number || 'Suscripción Activa'}
                        </span>
                        <h4 style="font-size:1.15rem; color:var(--color-white); margin:4px 0 0 0;">${acc.service_name}</h4>
                      </div>
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-family:var(--font-mono); font-size:0.68rem; color:${expInfo.badgeColor}; background:${expInfo.badgeBg}; border:1px solid ${expInfo.badgeBorder}; padding:2px 8px; border-radius:4px; font-weight:600;">
                          ${expInfo.badgeText}
                        </span>
                        <button class="btn-ghost btn-sm btn-portal-delete-acc" data-id="${acc.id}" data-ordernum="${acc.assigned_order_number || ''}" data-service="${acc.service_name}" title="Eliminar servicio de mi lista" style="color:var(--color-danger); border-color:rgba(255,77,79,0.3); font-size:0.68rem; padding:2px 8px; gap:4px; line-height:1.2;">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <div style="background:var(--color-surface-glass-elevated); padding:12px; border-radius:8px; border:1px solid var(--color-border-glass); margin-bottom:12px; font-family:var(--font-mono); font-size:0.78rem; box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span style="color:var(--color-smoke-gray);">Correo:</span>
                        ${acc.email ? `
                          <div style="display:flex; align-items:center; gap:6px;">
                            <span style="color:var(--color-white); font-weight:bold;">${acc.email}</span>
                            <button class="btn-ghost btn-sm btn-portal-copy" data-copy="${acc.email}" style="padding:1px 5px; font-size:0.65rem;">Copiar</button>
                          </div>
                        ` : `
                          <span style="color:var(--color-ash-gray); font-style:italic; font-size:0.75rem;">(Por suministrar)</span>
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
                          <span style="color:var(--color-ash-gray); font-style:italic; font-size:0.75rem;">(Por suministrar)</span>
                        `}
                      </div>

                      ${acc.profile_name ? `
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; border-top:1px dashed var(--color-graphite-hairline); padding-top:6px;">
                          <span style="color:var(--color-smoke-gray);">Perfil asignado:</span>
                          <span style="color:var(--color-white); font-weight:bold;">${acc.profile_name}</span>
                        </div>
                      ` : ''}

                      ${acc.pin ? `
                        <div style="display:flex; justify-content:space-between; align-items:center; ${!acc.profile_name ? 'border-top:1px dashed var(--color-graphite-hairline); padding-top:6px;' : ''}">
                          <span style="color:var(--color-smoke-gray);">PIN de perfil:</span>
                          <span style="color:var(--color-neon); font-weight:bold;">${acc.pin}</span>
                        </div>
                      ` : ''}
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.72rem; color:var(--color-ash-gray);">
                      <div style="display:flex; align-items:center; gap:6px;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span>Garantía activa QuinetShop</span>
                      </div>
                      ${!expInfo.isRecarga && expInfo.expDate ? `
                        <span style="font-family:var(--font-mono); color:var(--color-smoke-gray);">
                          Vence: ${expInfo.expDate.toLocaleDateString('es-VE')}
                        </span>
                      ` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- HISTORIAL DE SUSCRIPCIONES Y PEDIDOS COMPLETADOS -->
        ${completed.length > 0 ? `
          <div>
            <h3 style="font-size:1.2rem; color:var(--color-white); margin-bottom:12px;">Historial de Servicios Aprobados</h3>
            <div style="display:flex; flex-direction:column; gap:12px;">
              ${completed.map(o => {
                const prodsArr = Array.isArray(o.products) ? o.products : [o.products];
                const expInfo = getServiceExpirationInfo(prodsArr.join(' '), o.created_at);
                const orderDate = new Date(o.created_at);

                return `
                  <div class="glass-card" style="padding:18px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
                      <h4 style="font-size:1.1rem; color:var(--color-white); margin:0;">${prodsArr.join(' + ')}</h4>
                      <span style="font-family:var(--font-mono); font-size:0.7rem; padding:3px 8px; border-radius:4px; color:${expInfo.badgeColor}; background:${expInfo.badgeBg}; border:1px solid ${expInfo.badgeBorder}; font-weight:600;">
                        ${expInfo.badgeText}
                      </span>
                    </div>

                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:10px; background:var(--color-surface-glass-elevated); padding:10px 14px; border-radius:8px; border:1px solid var(--color-border-glass); margin-bottom:12px; font-size:0.78rem;">
                      <div>
                        <span style="color:var(--color-smoke-gray);">Fecha de Adquisición:</span>
                        <div style="color:var(--color-white); font-weight:600;">${orderDate.toLocaleDateString('es-VE')}</div>
                      </div>
                      <div>
                        <span style="color:var(--color-smoke-gray);">${expInfo.isRecarga ? 'Modalidad:' : 'Vencimiento:'}</span>
                        <div style="color:var(--color-white); font-weight:600;">
                          ${expInfo.isRecarga ? 'Recarga Directa' : (expInfo.expDate ? expInfo.expDate.toLocaleDateString('es-VE') : '30 Días')}
                        </div>
                      </div>
                      <div>
                        <span style="color:var(--color-smoke-gray);">Orden N°:</span>
                        <div style="color:var(--color-neon); font-family:var(--font-mono); font-weight:bold;">${o.order_number || '#ORDEN'}</div>
                      </div>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                      <span style="font-size:0.75rem; color:var(--color-smoke-gray);">
                        ${expInfo.isExpired ? 'Este plan ha culminado su período de vigencia.' : 'Servicio activo garantizado por QuinetShop.'}
                      </span>
                      <div style="display:flex; gap:8px;">
                        ${expInfo.isExpired ? `
                          <button class="btn-primary btn-sm btn-renew-service" style="font-size:0.75rem; padding:6px 12px;">
                            Renovar Servicio
                          </button>
                        ` : ''}
                        <button class="btn-ghost btn-sm btn-open-support-serv" style="font-size:0.75rem;">
                          Ver en Chat de Soporte
                        </button>
                        <button class="btn-ghost btn-sm btn-portal-cancel-approved-order" data-id="${o.id}" data-ordernum="${o.order_number || ''}" data-service="${prodsArr.join(' + ')}" style="color:var(--color-danger); border-color:rgba(255,77,79,0.3); font-size:0.75rem; padding:6px 12px;">
                          Cancelar / Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    container.querySelectorAll('.btn-portal-cancel-approved-order').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const orderId = e.currentTarget.getAttribute('data-id');
        const orderNum = e.currentTarget.getAttribute('data-ordernum');
        const sName = e.currentTarget.getAttribute('data-service') || 'este servicio';
        if (!confirm(`¿Estás seguro de que deseas cancelar la suscripción de "${sName}" (${orderNum})? Se marcará como cancelada.`)) return;
        try {
          await ordersService.cancelOrder(orderId, user.id, 'usuario');
          showToast('Servicio cancelado exitosamente.');
          renderClientPortal(callbacks);
        } catch (err) {
          showToast('Error al cancelar servicio: ' + err.message, true);
        }
      });
    });

    container.querySelectorAll('.btn-portal-delete-acc').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const accId = e.currentTarget.getAttribute('data-id');
        const orderNum = e.currentTarget.getAttribute('data-ordernum');
        const sName = e.currentTarget.getAttribute('data-service') || 'esta cuenta';
        if (!confirm(`¿Estás seguro de que deseas eliminar "${sName}" de tu lista de servicios activos?`)) return;
        await ordersService.removeAssignedAccount(accId, user.id, orderNum);
        showToast('Servicio eliminado de tu lista.');
        renderClientPortal(callbacks);
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
        callbacks.onNavigate?.('catalog');
      });
    });

    container.querySelectorAll('.btn-open-support-serv').forEach(btn => {
      btn.addEventListener('click', () => {
        activePortalTab = 'chat';
        renderClientPortal(callbacks);
      });
    });

  } else if (activePortalTab === 'chat') {
    // 3. INTEGRATED REALTIME SUPPORT CHAT VIEW
    const msgs = chatService.getMessages();

    container.innerHTML = `
      <div class="glass-card" style="padding:0; overflow:hidden; display:flex; flex-direction:column; height:580px;">
        <div style="padding:16px 20px; border-bottom:1px solid var(--color-border-glass); display:flex; justify-content:space-between; align-items:center; background:var(--color-surface-glass-elevated);">
          <div>
            <div style="font-weight:600; color:var(--color-white); font-size:1rem;">Canal de Soporte en Tiempo Real</div>
            <div style="font-size:0.75rem; color:var(--color-neon); font-family:var(--font-mono);">
              Atención directa y entrega de credenciales
            </div>
          </div>
          <a href="https://wa.me/584228328706" target="_blank" class="btn-ghost btn-sm" style="color:#25D366; text-decoration:none; font-size:0.75rem;">
            Abrir WhatsApp
          </a>
        </div>

        <div id="portal-chat-scroll" style="flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:12px; background:var(--color-surface-glass);">
          ${msgs.length === 0 ? `
            <div style="text-align:center; padding:40px; color:var(--color-ash-gray);">
              <p style="font-size:0.9rem;">No hay mensajes registrados aún.</p>
              <p style="font-size:0.75rem; color:var(--color-smoke-gray);">Escribe a continuación para contactar al soporte de QuinetShop.</p>
            </div>
          ` : `
            ${msgs.map(m => {
              const isUser = m.sender === 'user';
              return `
                <div style="align-self:${isUser ? 'flex-end' : 'flex-start'}; max-width:80%; background:${isUser ? 'var(--color-neon-wash-strong)' : 'var(--color-surface-glass-elevated)'}; border:1px solid ${isUser ? 'var(--color-border-glass)' : 'var(--color-graphite-hairline)'}; border-radius:10px; padding:12px 14px; font-size:0.85rem; color:var(--color-bone-white); line-height:1.5; box-shadow:0 2px 6px rgba(0,0,0,0.05);">
                  ${m.file_url ? `
                    <a href="${m.file_url}" target="_blank" onclick="if(window.openImageViewer){event.preventDefault(); window.openImageViewer('${m.file_url}', 'Comprobante / Archivo adjunto');}" style="display:block; margin-bottom:8px; cursor:pointer;" title="Haz clic para ampliar">
                      <img src="${m.file_url}" style="max-width:100%; max-height:220px; border-radius:6px; border:1px solid var(--color-border-glass);" alt="Comprobante">
                    </a>
                  ` : ''}
                  <div style="white-space:pre-wrap; word-break:break-word;">${formatChatMessage(m.text || '')}</div>
                  <div style="font-size:0.65rem; color:var(--color-smoke-gray); text-align:right; margin-top:6px; font-family:var(--font-mono);">
                    ${new Date(m.created_at).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              `;
            }).join('')}
          `}
        </div>

        <!-- CHAT INPUT BAR -->
        <div style="padding:14px 18px; border-top:1px solid var(--color-border-glass); background:var(--color-surface-glass-elevated); display:flex; gap:10px;">
          <input type="text" id="portal-chat-input" placeholder="Escribe tu mensaje a soporte..." style="flex:1;">
          <button class="btn-primary" id="portal-chat-send" style="padding:10px 18px;">
            Enviar
          </button>
        </div>
      </div>
    `;

    const chatScroll = document.getElementById('portal-chat-scroll');
    if (chatScroll) chatScroll.scrollTop = chatScroll.scrollHeight;

    const sendMsg = async () => {
      const input = document.getElementById('portal-chat-input');
      const val = input?.value.trim();
      if (!val) return;
      input.value = '';
      try {
        await chatService.sendMessage(user, val);
        renderPortalTabContent(user, callbacks);
      } catch (e) {
        showToast('Error al enviar mensaje.', true);
      }
    };

    document.getElementById('portal-chat-send')?.addEventListener('click', sendMsg);
    document.getElementById('portal-chat-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMsg();
    });

  } else if (activePortalTab === 'profile') {
    // 4. USER PROFILE DATA & PASSWORD CHANGE
    container.innerHTML = `
      <div style="max-width:560px; margin:auto; display:flex; flex-direction:column; gap:20px;">
        <!-- INFORMACIÓN PERSONAL -->
        <div class="glass-card" style="padding:26px;">
          <h3 style="font-size:1.3rem; color:var(--color-white); margin-bottom:16px;">Mis Datos de Cuenta</h3>

          <div style="display:flex; flex-direction:column; gap:14px;">
            <div>
              <label style="font-size:0.75rem; color:var(--color-smoke-gray); margin-bottom:4px; display:block;">Correo Registrado:</label>
              <input type="text" value="${user.email}" disabled style="opacity:0.6; cursor:not-allowed;">
            </div>

            <div>
              <label style="font-size:0.75rem; color:var(--color-smoke-gray); margin-bottom:4px; display:block;">Nombre y Apellido:</label>
              <input type="text" id="portal-name-input" value="${user.user_metadata?.display_name || ''}" placeholder="Tu nombre completo">
            </div>

            <div>
              <label style="font-size:0.75rem; color:var(--color-smoke-gray); margin-bottom:4px; display:block;">WhatsApp / Teléfono de Contacto:</label>
              <input type="tel" id="portal-phone-input" value="${user.user_metadata?.phone || ''}" placeholder="0424-1234567">
            </div>

            <div style="margin-top:6px;">
              <button class="btn-primary" id="portal-save-profile" style="width:100%; padding:12px;">
                ACTUALIZAR DATOS PERSONALES
              </button>
            </div>
          </div>
        </div>

        <!-- CAMBIAR CONTRASEÑA -->
        <div class="glass-card" style="padding:26px;">
          <h3 style="font-size:1.3rem; color:var(--color-white); margin-bottom:6px;">Cambiar Contraseña</h3>
          <p style="font-size:0.8rem; color:var(--color-ash-gray); margin-bottom:16px;">
            Establece una nueva clave de acceso de al menos 6 caracteres.
          </p>

          <div style="display:flex; flex-direction:column; gap:14px;">
            <div>
              <label style="font-size:0.75rem; color:var(--color-smoke-gray); margin-bottom:4px; display:block;">Nueva Contraseña:</label>
              <input type="password" id="portal-newpass-input" placeholder="••••••••">
            </div>

            <div>
              <label style="font-size:0.75rem; color:var(--color-smoke-gray); margin-bottom:4px; display:block;">Confirmar Nueva Contraseña:</label>
              <input type="password" id="portal-confirmpass-input" placeholder="••••••••">
            </div>

            <div style="margin-top:6px;">
              <button class="btn-ghost" id="portal-btn-change-pass" style="width:100%; padding:12px; border-color:var(--color-neon); color:var(--color-neon);">
                CAMBIAR MI CONTRASEÑA
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('portal-save-profile')?.addEventListener('click', async () => {
      const name = document.getElementById('portal-name-input')?.value.trim();
      const phone = document.getElementById('portal-phone-input')?.value.trim();
      const btn = document.getElementById('portal-save-profile');
      if (btn) btn.innerText = 'GUARDANDO...';

      try {
        await authService.updateProfile({
          data: { display_name: name, phone: phone }
        });
        showToast('Datos de contacto actualizados exitosamente.');
        renderClientPortal(callbacks);
      } catch (e) {
        showToast(e.message || 'Error al actualizar perfil.', true);
        if (btn) btn.innerText = 'ACTUALIZAR DATOS PERSONALES';
      }
    });

    document.getElementById('portal-btn-change-pass')?.addEventListener('click', async () => {
      const p1 = document.getElementById('portal-newpass-input')?.value;
      const p2 = document.getElementById('portal-confirmpass-input')?.value;
      const btn = document.getElementById('portal-btn-change-pass');

      if (!p1 || p1.length < 6) {
        showToast('La nueva contraseña debe tener al menos 6 caracteres.', true);
        return;
      }
      if (p1 !== p2) {
        showToast('Las contraseñas no coinciden.', true);
        return;
      }

      if (btn) btn.innerText = 'ACTUALIZANDO CLAVE...';

      try {
        await authService.updateProfile({ password: p1 });
        showToast('¡Contraseña cambiada exitosamente!');
        document.getElementById('portal-newpass-input').value = '';
        document.getElementById('portal-confirmpass-input').value = '';
        if (btn) btn.innerText = 'CAMBIAR MI CONTRASEÑA';
      } catch (e) {
        showToast(e.message || 'Error al cambiar contraseña.', true);
        if (btn) btn.innerText = 'CAMBIAR MI CONTRASEÑA';
      }
    });
  }
}
