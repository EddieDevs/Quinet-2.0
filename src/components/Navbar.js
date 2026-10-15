import { currencyService } from '../services/currency.js';
import { cartService } from '../services/cart.js';
import { authService } from '../services/auth.js';

export function renderNavbar(callbacks = {}) {
  const navContainer = document.getElementById('navbar-mount');
  if (!navContainer) return;

  const currentCurrency = currencyService.getCurrency();
  const cartCount = cartService.getCount();
  const user = authService.getUser();
  const isAdmin = authService.isAdmin();

  navContainer.innerHTML = `
    <nav class="navbar">
      <div class="container navbar-inner">
        <!-- BRAND LOGO (QuinetShop without 2.0, clean logo without surrounding arc) -->
        <div class="nav-brand" id="nav-brand-logo" title="QuinetShop Inicio">
          <img src="https://alkyktnfhjtaxisykxfp.supabase.co/storage/v1/object/public/products/quinet.png" 
               alt="QuinetShop Logo" 
               class="nav-logo-icon"
               onerror="this.style.display='none'">
          <div class="nav-brand-text">
            <span>Quinet</span><span class="shop-part">Shop</span>
          </div>
        </div>

        <!-- NAVIGATION LINKS WITH EXPANDABLE ARTÍCULOS DROPDOWN -->
        <ul class="nav-links">
          <li><a class="nav-link active" id="nav-link-home">Inicio</a></li>
          
          <li class="nav-dropdown" id="nav-articulos-dropdown">
            <a class="nav-link nav-dropdown-trigger" id="nav-link-articulos">
              <span>Artículos</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </a>
            <div class="nav-dropdown-menu" id="nav-articulos-menu">
              <button class="nav-dropdown-item" data-action="cat" data-category="suscripcion">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
                <span>Suscripciones</span>
              </button>
              <button class="nav-dropdown-item" data-action="cat" data-category="recarga">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                <span>Recargas</span>
              </button>
              <button class="nav-dropdown-item" data-action="cat" data-category="juego">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="12" x2="10" y2="12"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="15" y1="13" x2="15.01" y2="13"></line><line x1="18" y1="11" x2="18.01" y2="11"></line><rect x="2" y="6" width="20" height="12" rx="2"></rect></svg>
                <span>Juegos</span>
              </button>
              <button class="nav-dropdown-item" data-action="cat" data-category="combo">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                <span>Combos y Paquetes</span>
              </button>
              <button class="nav-dropdown-item" data-action="cat" data-category="todos" style="border-top:1px solid var(--color-graphite-hairline); margin-top:2px; padding-top:8px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <span>Ver Todo el Catálogo</span>
              </button>
            </div>
          </li>

          <li><a class="nav-link" id="nav-link-howtobuy">Cómo Comprar</a></li>
          <li><a class="nav-link" id="nav-link-tasa">Tasa BCV</a></li>
          <li><a class="nav-link" id="nav-link-info">Información</a></li>
        </ul>

        <!-- NAV ACTIONS -->
        <div class="nav-actions">
          <!-- THEME TOGGLE (LIGHT / DARK - DEFAULT LIGHT) -->
          <button class="theme-toggle-btn" id="nav-theme-toggle-btn" title="Alternar Modo Claro / Modo Oscuro" aria-label="Alternar tema de la página">
            <svg class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: ${document.documentElement.classList.contains('dark') ? 'block' : 'none'};">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: ${document.documentElement.classList.contains('dark') ? 'none' : 'block'};">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </button>

          <!-- CURRENCY SWITCHER (VES / USD) -->
          <div class="currency-switcher" title="Moneda activa (Predeterminada: Bolívares)">
            <button class="currency-btn ${currentCurrency === 'VES' ? 'active' : ''}" data-currency="VES">Bs</button>
            <button class="currency-btn ${currentCurrency === 'USD' ? 'active' : ''}" data-currency="USD">$</button>
          </div>

          <!-- CART TRIGGER -->
          <button class="btn-ghost btn-icon" id="nav-cart-btn" title="Ver Carrito de Compras" style="position:relative;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span id="nav-cart-badge" 
                  style="position:absolute; top:-4px; right:-4px; background:var(--color-neon); color:#03070a; font-family:var(--font-mono); font-size:0.65rem; font-weight:700; width:18px; height:18px; border-radius:50%; display:${cartCount > 0 ? 'flex' : 'none'}; align-items:center; justify-content:center;">
              ${cartCount}
            </span>
          </button>

          <!-- AUTH / PROFILE BUTTON -->
          <div id="nav-auth-container" style="position:relative;">
            ${user ? `
              <button class="btn-ghost" id="nav-user-dropdown-btn" style="gap:8px;">
                <div style="width:24px; height:24px; border-radius:50%; background:rgba(0, 180, 216,0.2); border:1px solid var(--color-neon); display:flex; align-items:center; justify-content:center; font-size:0.75rem; color:var(--color-neon); font-weight:bold;">
                  ${(user.user_metadata?.display_name || user.email || 'U')[0].toUpperCase()}
                </div>
                <span style="font-size:0.85rem; max-width:110px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                  ${user.user_metadata?.display_name || user.email.split('@')[0]}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>

              <div id="nav-user-menu" style="display:none; position:absolute; right:0; top:calc(100% + 8px); width:230px; padding:8px; border-radius:10px; z-index:200;">
                <div style="padding:8px 12px; border-bottom:1px solid var(--color-graphite-hairline); margin-bottom:6px;">
                  <div style="font-size:0.82rem; font-weight:600; color:var(--color-white);">${user.user_metadata?.display_name || 'Usuario'}</div>
                  <div style="font-size:0.7rem; color:var(--color-ash-gray); overflow:hidden; text-overflow:ellipsis;">${user.email}</div>
                </div>

                <button class="nav-dropdown-item" id="menu-btn-orders">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                  <span>Mis Pedidos</span>
                </button>

                <button class="nav-dropdown-item" id="menu-btn-services">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <span>Mis Cuentas y Servicios</span>
                </button>

                <button class="nav-dropdown-item" id="menu-btn-chat">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  <span>Chat de Soporte</span>
                </button>

                <button class="nav-dropdown-item" id="menu-btn-portal">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                  <span>Mi Panel de Cliente</span>
                </button>

                ${isAdmin ? `
                  <a href="admin.html" class="nav-dropdown-item text-neon" style="text-decoration:none;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    <span>Panel Admin</span>
                  </a>
                ` : ''}

                <div style="border-top:1px solid var(--color-graphite-hairline); margin-top:6px; padding-top:6px;">
                  <button class="nav-dropdown-item text-danger" id="menu-btn-logout">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            ` : `
              <button class="btn-ghost" id="nav-login-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Iniciar Sesión
              </button>
            `}
          </div>
        </div>
      </div>
    </nav>
  `;

  attachNavbarEvents(callbacks);
}

function attachNavbarEvents(callbacks) {
  // Brand logo -> go home
  document.getElementById('nav-brand-logo')?.addEventListener('click', () => {
    callbacks.onNavigate?.('home');
  });

  // Nav link: Inicio
  document.getElementById('nav-link-home')?.addEventListener('click', () => {
    callbacks.onNavigate?.('home');
  });

  // Artículos dropdown toggle & click behavior
  const articulosDropdown = document.getElementById('nav-articulos-dropdown');
  const articulosTrigger = document.getElementById('nav-link-articulos');
  if (articulosTrigger && articulosDropdown) {
    articulosTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      articulosDropdown.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!articulosDropdown.contains(e.target)) {
        articulosDropdown.classList.remove('open');
      }
    });
  }

  // Artículos dropdown items
  document.querySelectorAll('#nav-articulos-menu .nav-dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      articulosDropdown?.classList.remove('open');
      const action = e.currentTarget.getAttribute('data-action');
      if (action === 'packages') {
        callbacks.onNavigate?.('packages');
      } else {
        const cat = e.currentTarget.getAttribute('data-category');
        callbacks.onNavigate?.('catalog', null, cat);
      }
    });
  });

  // Nav link: Cómo Comprar (Separate dedicated view)
  document.getElementById('nav-link-howtobuy')?.addEventListener('click', () => {
    callbacks.onNavigate?.('howtobuy');
  });

  // Nav link: Tasa BCV (Dedicated Tasa page)
  document.getElementById('nav-link-tasa')?.addEventListener('click', () => {
    callbacks.onNavigate?.('tasa');
  });

  // Nav link: Información (Dedicated Info page)
  document.getElementById('nav-link-info')?.addEventListener('click', () => {
    callbacks.onNavigate?.('info');
  });

  // Currency Switcher buttons (Instant active class + state update)
  document.querySelectorAll('.currency-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const curr = e.currentTarget.getAttribute('data-currency');
      document.querySelectorAll('.currency-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      currencyService.setCurrency(curr);
    });
  });

  // Theme Toggle Button
  const themeToggleBtn = document.getElementById('nav-theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isCurrentlyDark = document.documentElement.classList.contains('dark');
      const newTheme = isCurrentlyDark ? 'light' : 'dark';
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
      try {
        localStorage.setItem('quinet_theme', newTheme);
      } catch(e) {}
      
      const sun = themeToggleBtn.querySelector('.icon-sun');
      const moon = themeToggleBtn.querySelector('.icon-moon');
      if (sun) sun.style.display = newTheme === 'dark' ? 'block' : 'none';
      if (moon) moon.style.display = newTheme === 'dark' ? 'none' : 'block';
    });

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('quinet_theme')) {
          const isDark = e.matches;
          if (isDark) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
          } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
          }
          const sun = themeToggleBtn.querySelector('.icon-sun');
          const moon = themeToggleBtn.querySelector('.icon-moon');
          if (sun) sun.style.display = isDark ? 'block' : 'none';
          if (moon) moon.style.display = isDark ? 'none' : 'block';
        }
      });
    }
  }

  // Cart Button
  document.getElementById('nav-cart-btn')?.addEventListener('click', () => {
    callbacks.onOpenCart?.();
  });

  // Auth Button
  document.getElementById('nav-login-btn')?.addEventListener('click', () => {
    callbacks.onOpenAuth?.();
  });

  // User Dropdown Menu
  const userDropdownBtn = document.getElementById('nav-user-dropdown-btn');
  const userMenu = document.getElementById('nav-user-menu');
  if (userDropdownBtn && userMenu) {
    userDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenu.style.display = userMenu.style.display === 'none' ? 'block' : 'none';
    });

    document.addEventListener('click', () => {
      userMenu.style.display = 'none';
    });

    document.getElementById('menu-btn-orders')?.addEventListener('click', () => {
      callbacks.onNavigate?.('portal', null, null, 'orders');
    });

    document.getElementById('menu-btn-services')?.addEventListener('click', () => {
      callbacks.onNavigate?.('portal', null, null, 'services');
    });

    document.getElementById('menu-btn-chat')?.addEventListener('click', () => {
      if (callbacks.onOpenChat) {
        callbacks.onOpenChat();
      } else {
        callbacks.onNavigate?.('portal', null, null, 'chat');
      }
    });

    document.getElementById('menu-btn-portal')?.addEventListener('click', () => {
      callbacks.onNavigate?.('portal');
    });

    document.getElementById('menu-btn-logout')?.addEventListener('click', async () => {
      await authService.signOut();
      callbacks.onNavigate?.('home');
    });
  }
}

export function updateNavbarCurrency(currency) {
  document.querySelectorAll('.currency-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-currency') === currency);
  });
}
