import './styles/main.css';

import { initBackgroundCanvas } from './components/BackgroundCanvas.js';
import { currencyService } from './services/currency.js';
import { productsService } from './services/products.js';
import { cartService } from './services/cart.js';
import { authService } from './services/auth.js';
import { chatService } from './services/chat.js';
import { ordersService } from './services/orders.js';
import { bncPaymentsService } from './services/bncPayments.js';
import { supabase } from './config/supabase.js';

import { renderNavbar, updateNavbarCurrency } from './components/Navbar.js';
import { renderHero } from './components/Hero.js';
import { renderCatalog, setCatalogCategory } from './components/Catalog.js';
import { renderPackagesView } from './components/PackagesView.js';
import { renderHowToBuyView } from './components/HowToBuyView.js';
import { renderTasaPage } from './components/TasaPage.js';
import { renderInfoView } from './components/InfoView.js';
import { renderClientPortal } from './components/ClientPortal.js';
import { renderHotbar } from './components/Hotbar.js';

import { openProductDetail, closeProductDetail } from './components/ProductModal.js';
import { renderCartDrawer, openCartDrawer } from './components/CartDrawer.js';
import { openCheckoutModal, closeCheckoutModal } from './components/CheckoutModal.js';
import { openAuthModal, closeAuthModal } from './components/AuthModal.js';
import { openOrdersModal, openServicesModal, openProfileModal } from './components/UserModals.js';
import { renderChatWidget, openChatWindow, updateChatMessagesList } from './components/ChatWidget.js';
import { openRateCalculator, closeRateCalculator } from './components/RateCalculatorModal.js';
import { openImageViewer } from './components/ImageViewerModal.js';
import { showToast } from './components/Toast.js';

// Application State
let currentActiveView = 'home'; // 'home' | 'catalog' | 'packages' | 'howtobuy' | 'tasa' | 'info' | 'portal'

// Shared UI Callbacks
const appCallbacks = {
  onNavigate: (viewName, anchorId, category) => {
    if (category) {
      setCatalogCategory(category);
    }
    switchView(viewName);
    if (anchorId) {
      setTimeout(() => {
        const el = document.getElementById(anchorId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  },
  onOpenProductDetail: (product) => {
    openProductDetail(product, appCallbacks);
  },
  onOpenCart: () => {
    openCartDrawer();
  },
  onOpenCheckout: () => {
    openCheckoutModal(appCallbacks);
  },
  onOpenAuth: () => {
    openAuthModal(appCallbacks);
  },
  onOpenOrders: () => {
    openOrdersModal();
  },
  onOpenServices: () => {
    openServicesModal(appCallbacks);
  },
  onOpenProfile: () => {
    openProfileModal();
  },
  onOpenRateModal: () => {
    openRateCalculator();
  },
  onOpenChat: () => {
    openChatWindow();
  },
  onOpenImageViewer: (imageUrl, title) => {
    openImageViewer(imageUrl, title);
  }
};

function switchView(viewName) {
  currentActiveView = viewName;

  // Force close any lingering modals and restore normal viewport scrolling
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  document.body.style.overflow = '';

  const homeMount = document.getElementById('view-home');
  const catalogMount = document.getElementById('view-catalog');
  const packagesMount = document.getElementById('view-packages');
  const howtobuyMount = document.getElementById('view-howtobuy');
  const tasaMount = document.getElementById('view-tasa');
  const infoMount = document.getElementById('view-info');
  const portalMount = document.getElementById('view-portal');

  // Hide all views first
  if (homeMount) homeMount.style.display = 'none';
  if (catalogMount) catalogMount.style.display = 'none';
  if (packagesMount) packagesMount.style.display = 'none';
  if (howtobuyMount) howtobuyMount.style.display = 'none';
  if (tasaMount) tasaMount.style.display = 'none';
  if (infoMount) infoMount.style.display = 'none';
  if (portalMount) portalMount.style.display = 'none';

  // Activate requested view with smooth entrance animation
  const showView = (el) => {
    if (!el) return;
    el.style.display = 'block';
    el.classList.remove('view-fade-enter');
    void el.offsetWidth; // trigger reflow
    el.classList.add('view-fade-enter');
  };

  if (viewName === 'catalog') {
    if (catalogMount) {
      showView(catalogMount);
      renderCatalog(appCallbacks);
    }
  } else if (viewName === 'packages') {
    if (packagesMount) {
      showView(packagesMount);
      renderPackagesView(appCallbacks);
    }
  } else if (viewName === 'howtobuy') {
    if (howtobuyMount) {
      showView(howtobuyMount);
      renderHowToBuyView(appCallbacks);
    }
  } else if (viewName === 'tasa') {
    if (tasaMount) {
      showView(tasaMount);
      renderTasaPage(appCallbacks);
    }
  } else if (viewName === 'info') {
    if (infoMount) {
      showView(infoMount);
      renderInfoView(appCallbacks);
    }
  } else if (viewName === 'portal') {
    if (portalMount) {
      showView(portalMount);
      renderClientPortal(appCallbacks);
    }
  } else {
    // Default: 'home'
    currentActiveView = 'home';
    if (homeMount) {
      showView(homeMount);
      renderHero(appCallbacks);
    }
  }

  // Clean URL bar (do not display index.html)
  try {
    const cleanPath = window.location.pathname.replace(/\/index\.html$/i, '') || '/';
    const cleanHash = viewName === 'home' ? '' : `#${viewName}`;
    window.history.replaceState(null, '', cleanPath + cleanHash);
  } catch (e) {}

  // Smooth scroll to top on page switch
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Update Navbar active link states
  updateNavActiveState(currentActiveView);
}

function updateNavActiveState(viewName) {
  const linkHome = document.getElementById('nav-link-home');
  const linkCatalog = document.getElementById('nav-link-catalog');
  const linkPackages = document.getElementById('nav-link-packages');
  const linkHowToBuy = document.getElementById('nav-link-howtobuy');
  const linkTasa = document.getElementById('nav-link-tasa');
  const linkInfo = document.getElementById('nav-link-info');

  if (linkHome) linkHome.classList.toggle('active', viewName === 'home');
  if (linkCatalog) linkCatalog.classList.toggle('active', viewName === 'catalog');
  if (linkPackages) linkPackages.classList.toggle('active', viewName === 'packages');
  if (linkHowToBuy) linkHowToBuy.classList.toggle('active', viewName === 'howtobuy');
  if (linkTasa) linkTasa.classList.toggle('active', viewName === 'tasa');
  if (linkInfo) linkInfo.classList.toggle('active', viewName === 'info');
}

function renderSiteFooter() {
  let footer = document.querySelector('.site-footer');
  if (!footer) {
    footer = document.createElement('footer');
    footer.className = 'site-footer';
    document.body.appendChild(footer);
  }
  footer.innerHTML = `
    <div>© 2026 QuinetShop • Todos los derechos reservados • Desarrollado por <a href="https://github.com/Eddie0nn" target="_blank" rel="noopener noreferrer" class="footer-author-link">EddieDevs</a></div>
  `;
}

// ==========================================================================
// MODO MANTENIMIENTO EN VIVO (SINCRONIZADO CON APP COMPANION)
// ==========================================================================
function setMaintenanceOverlayState(isActive) {
  const overlay = document.getElementById('maintenance-overlay');
  if (!overlay) return;

  if (isActive) {
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  } else {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }
}

async function initMaintenanceListener() {
  try {
    const { data } = await supabase
      .from('discounts')
      .select('is_active')
      .eq('code', 'STORE_MAINTENANCE')
      .maybeSingle();

    if (data && data.is_active === true) {
      setMaintenanceOverlayState(true);
    } else {
      setMaintenanceOverlayState(false);
    }
  } catch (err) {
    console.warn('Modo mantenimiento: no se pudo verificar estado inicial:', err);
  }

  // Suscripción Realtime para activación/desactivación instantánea sin recargar
  supabase
    .channel('store_maintenance_realtime')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'discounts',
      filter: 'code=eq.STORE_MAINTENANCE'
    }, (payload) => {
      const isMaint = payload.new?.is_active === true;
      setMaintenanceOverlayState(isMaint);
    })
    .subscribe();
}

async function initApp() {
  console.log('[QuinetShop] Initializing...');

  // 0. Comprobar y escuchar estado de mantenimiento en tiempo real
  initMaintenanceListener();

  // Clean initial index.html from URL bar
  try {
    if (window.location.pathname.toLowerCase().endsWith('index.html')) {
      const clean = window.location.pathname.replace(/\/index\.html$/i, '') || '/';
      window.history.replaceState(null, '', clean + (window.location.hash || ''));
    }
  } catch (e) {}

  // 1. Particle background
  initBackgroundCanvas();

  // 2. Fetch official exchange rates
  await currencyService.fetchRates();

  // 3. Render core components
  renderNavbar(appCallbacks);
  renderCartDrawer(appCallbacks);
  renderChatWidget(appCallbacks);
  renderHotbar(appCallbacks);
  renderSiteFooter();

  // 4. Set initial view
  const initialHash = window.location.hash.replace('#', '');
  const validViews = ['home', 'catalog', 'packages', 'howtobuy', 'tasa', 'info', 'portal'];
  switchView(validViews.includes(initialHash) ? initialHash : 'home');

  // 5. Fetch products from Supabase
  await productsService.fetchProducts();

  // 6. Refresh current view with loaded products
  if (currentActiveView === 'catalog') {
    renderCatalog(appCallbacks);
  } else if (currentActiveView === 'packages') {
    renderPackagesView(appCallbacks);
  }

  // 7. Reactive Subscriptions
  // Currency changed: update active currency in navbar and refresh current view smoothly
  currencyService.subscribe(() => {
    updateNavbarCurrency(currencyService.getCurrency());
    if (currentActiveView === 'catalog') {
      renderCatalog(appCallbacks);
    } else if (currentActiveView === 'packages') {
      renderPackagesView(appCallbacks);
    } else if (currentActiveView === 'tasa') {
      renderTasaPage(appCallbacks);
    }
    renderCartDrawer(appCallbacks);
  });

  // Products changed: re-render active views
  productsService.subscribe(() => {
    if (currentActiveView === 'catalog') renderCatalog(appCallbacks);
    if (currentActiveView === 'packages') renderPackagesView(appCallbacks);
  });

  // Auth changed: update navbar, chat, portal, and hotbar
  authService.subscribe((user) => {
    renderNavbar(appCallbacks);
    chatService.setUserId(user?.id || null);
    renderChatWidget(appCallbacks);
    renderHotbar(appCallbacks);
    if (currentActiveView === 'portal') {
      renderClientPortal(appCallbacks);
    }
  });

  // Cart changed: update badge & drawer
  cartService.subscribe(() => {
    renderNavbar(appCallbacks);
    renderCartDrawer(appCallbacks);
  });

  // Chat changed: update chat widget and hotbar unread badge
  chatService.subscribe(() => {
    renderChatWidget(appCallbacks);
    renderHotbar(appCallbacks);
    updateChatMessagesList();
    if (currentActiveView === 'portal') {
      renderClientPortal(appCallbacks);
    }
  });

  // 8. Escucha en tiempo real de pagos BNC para auto-completar pedidos del cliente
  bncPaymentsService.listenToIncomingPayments(async (payment) => {
    try {
      const user = authService.getUser();
      if (!user) return;

      const orders = await ordersService.fetchUserOrders(user);
      const pendingOrder = orders.find(o => {
        if (o.status !== 'PENDIENTE' || !o.payment_reference) return false;
        const ref = o.payment_reference.trim();
        const pRef = (payment.referencia || '').trim();
        return pRef.endsWith(ref) || pRef === ref;
      });

      if (pendingOrder) {
        console.log('¡Pago BNC en vivo conciliado con tu orden!', pendingOrder);
        await supabase.from('orders').update({
          status: 'COMPLETADO',
          payment_reference: payment.referencia
        }).eq('id', pendingOrder.id);

        await bncPaymentsService.reconcilePayment(payment.id, pendingOrder.order_number);

        await ordersService.deliverCredentialsForOrder({
          ...pendingOrder,
          status: 'COMPLETADO'
        });

        showToast(`Pago confirmado. Tu orden ${pendingOrder.order_number} ha sido completada.`);

        if (currentActiveView === 'portal') {
          renderClientPortal(appCallbacks);
        }
      }
    } catch (e) {
      console.warn('Aviso en listener de pagos BNC:', e);
    }
  });

  // Close modals on overlay backdrop click
  document.getElementById('product-detail-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'product-detail-modal') closeProductDetail();
  });

  document.getElementById('checkout-modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'checkout-modal-overlay') closeCheckoutModal();
  });

  document.getElementById('auth-modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'auth-modal-overlay') closeAuthModal();
  });

  document.getElementById('calc-modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'calc-modal-overlay') closeRateCalculator();
  });

  document.getElementById('user-modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'user-modal-overlay') {
      document.getElementById('user-modal-overlay')?.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Product modal close button
  document.getElementById('product-detail-close-btn')?.addEventListener('click', closeProductDetail);
}

// Global window exposure for quick access/debugging
window.QuinetApp = {
  switchView,
  openProductDetail,
  openCartDrawer,
  openCheckoutModal,
  openAuthModal,
  openRateCalculator,
  openChatWindow,
  openImageViewer,
  showToast
};

document.addEventListener('DOMContentLoaded', initApp);
