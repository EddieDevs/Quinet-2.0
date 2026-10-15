import { currencyService } from '../services/currency.js';
import { productsService, getCleanDescription, getGameTags, getDeliveryInfo } from '../services/products.js';

let activeCategory = 'todos';
let searchQuery = '';
let currentSort = 'recommended';

export function setCatalogCategory(cat) {
  activeCategory = cat || 'todos';
}

export function renderCatalog(callbacks = {}) {
  const container = document.getElementById('catalog-mount');
  if (!container) return;

  const allProducts = productsService.getAll();

  // Filter by category
  let filtered = allProducts.filter(p => {
    if (activeCategory === 'todos') return true;
    return p.product_type === activeCategory;
  });

  // Filter by search query
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }

  // Sorting
  filtered.sort((a, b) => {
    const aAgotado = a.status === 'agotado';
    const bAgotado = b.status === 'agotado';
    if (aAgotado && !bAgotado) return 1;
    if (!aAgotado && bAgotado) return -1;

    if (currentSort === 'price-asc') return (a.price || 0) - (b.price || 0);
    if (currentSort === 'price-desc') return (b.price || 0) - (a.price || 0);
    if (currentSort === 'name-asc') return (a.name || '').localeCompare(b.name || '');
    return (a.order_index || 0) - (b.order_index || 0);
  });

  const categories = [
    { id: 'todos', label: 'Todos los Productos' },
    { id: 'suscripcion', label: 'Suscripciones' },
    { id: 'recarga', label: 'Recargas' },
    { id: 'juego', label: 'Juegos' },
    { id: 'combo', label: 'Combos' }
  ];

  container.innerHTML = `
    <section class="section-padding" style="padding-top: calc(var(--navbar-height) + 24px); min-height:80vh;">
      <div class="container">
        <!-- HEADER WITH BACK NAVIGATION -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:12px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
              <button class="btn-ghost btn-sm" id="catalog-btn-back-home" style="gap:6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                Volver al Inicio
              </button>
              <span style="font-size:0.75rem; color:var(--color-smoke-gray); font-family:var(--font-mono);">/ CATÁLOGO</span>
            </div>
            <h1 style="font-size:clamp(2rem, 3.8vw, 3rem); margin:0;">Catálogo de Servicios Digitales</h1>
          </div>
          <div class="rate-indicator-pill">
            <span class="status-dot"></span>
            <span>Precios mostrados en <b>${currencyService.getSymbol()} (${currencyService.getCurrency()})</b></span>
          </div>
        </div>

        <!-- TOOLBAR: CATEGORY PILLS & SEARCH / SORT -->
        <div class="catalog-toolbar">
          <!-- CATEGORY PILLS -->
          <div class="category-nav-pills">
            ${categories.map(cat => `
              <button class="cat-pill ${activeCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
                ${cat.label}
              </button>
            `).join('')}
          </div>

          <!-- SEARCH & SORT CONTROLS -->
          <div class="catalog-search-row">
            <div class="search-box-wrapper">
              <svg class="search-icon-inside" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input type="text" id="catalog-search-input" placeholder="Buscar Netflix, Spotify, Diamantes, Robux..." value="${searchQuery}">
              ${searchQuery ? `
                <button class="search-clear-btn" id="catalog-search-clear">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              ` : ''}
            </div>

            <select id="catalog-sort-select" class="sort-select">
              <option value="recommended" ${currentSort === 'recommended' ? 'selected' : ''}>Orden recomendado</option>
              <option value="price-asc" ${currentSort === 'price-asc' ? 'selected' : ''}>Precio: Menor a Mayor</option>
              <option value="price-desc" ${currentSort === 'price-desc' ? 'selected' : ''}>Precio: Mayor a Menor</option>
              <option value="name-asc" ${currentSort === 'name-asc' ? 'selected' : ''}>Nombre: A - Z</option>
            </select>
          </div>
        </div>

        <!-- PRODUCTS GRID -->
        ${filtered.length === 0 ? `
          <div class="glass-panel" style="padding:60px 20px; text-align:center; max-width:480px; margin:40px auto;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-smoke-gray)" stroke-width="2" style="margin:0 auto 12px auto; display:block;">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <h3 style="color:var(--color-white); margin-bottom:8px;">No se encontraron resultados</h3>
            <p style="color:var(--color-ash-gray); font-size:0.85rem; margin-bottom:20px;">
              Intenta con otro término o selecciona una categoría diferente.
            </p>
            <button class="btn-ghost" id="catalog-btn-reset-filters">Restablecer Filtros</button>
          </div>
        ` : `
          <div class="products-grid">
            ${filtered.map(p => {
              const basePriceUSD = Number(p.price) || 0;
              let finalPriceUSD = basePriceUSD;
              let discountBadge = '';
              let originalFormatted = '';

              if (p.status === 'descuento' && p.discount_pct) {
                finalPriceUSD = basePriceUSD - (basePriceUSD * p.discount_pct / 100);
                discountBadge = `<span class="card-badge badge-discount">-${p.discount_pct}%</span>`;
                const baseDual = currencyService.getDualPrice(basePriceUSD);
                originalFormatted = `<span class="product-price-original">${baseDual.main}</span>`;
              } else if (p.status === 'agotado') {
                discountBadge = `<span class="card-badge badge-agotado">AGOTADO</span>`;
              }

              const dualPrice = currencyService.getDualPrice(finalPriceUSD);
              const durationLabel = p.duration && p.duration !== 'Indefinido' ? p.duration : (p.product_type === 'recarga' ? 'Recarga Directa' : '1 Mes');
              const cleanDesc = getCleanDescription(p.description);
              const tags = getGameTags(p);
              const delivery = getDeliveryInfo(p);

              return `
                <div class="product-card glass-card" data-product-id="${p.id}" style="${p.status === 'agotado' ? 'opacity:0.6;' : ''}">
                  <div class="product-image-container">
                    <span class="badge-duration">${durationLabel}</span>
                    ${discountBadge}
                    <img src="${p.image_url}" 
                         alt="${p.name}" 
                         class="product-thumb" 
                         loading="lazy"
                         onerror="this.src='https://alkyktnfhjtaxisykxfp.supabase.co/storage/v1/object/public/products/quinet.png'">
                  </div>

                  <div>
                    ${(tags.platforms.length > 0 || tags.stores.length > 0) ? `
                      <div style="display:flex; gap:5px; flex-wrap:wrap; margin-bottom:8px;">
                        ${tags.platforms.map(pl => `<span style="font-size:0.65rem; font-family:var(--font-mono); background:var(--color-neon-wash); color:var(--color-neon); border:1px solid var(--color-border-glass); border-radius:3px; padding:1px 6px;">${pl}</span>`).join('')}
                        ${tags.stores.map(st => `<span style="font-size:0.65rem; font-family:var(--font-mono); background:var(--color-surface-glass); color:var(--color-bone-white); border:1px solid var(--color-border-glass); border-radius:3px; padding:1px 6px;">${st}</span>`).join('')}
                      </div>
                    ` : ''}
                    <h3 class="product-title">${p.name}</h3>

                    <!-- INDICADOR DE TIEMPO DE ENTREGA -->
                    <div style="display:flex; align-items:center; gap:5px; margin: 2px 0 6px 0; font-family:var(--font-mono); font-size:0.68rem; color:${delivery.isImmediate ? 'var(--color-neon)' : 'var(--color-warning)'};">
                      ${delivery.isImmediate 
                        ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>` 
                        : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`}
                      <span>${delivery.badge}</span>
                    </div>

                    <p class="product-desc-excerpt">
                      ${cleanDesc || (p.product_type === 'recarga' ? 'Recarga digital directa al ID de usuario.' : 'Acceso premium con garantía y soporte total.')}
                    </p>
                  </div>

                  <div>
                    <!-- SEPARATED PRICE BOX (DUAL CURRENCY) -->
                    <div class="product-price-box">
                      <div class="product-price-primary-group">
                        ${originalFormatted}
                        <span class="product-price-main">${dualPrice.main}</span>
                      </div>
                      <span class="product-price-secondary">${dualPrice.secondary}</span>
                    </div>

                    <button class="btn-primary btn-open-detail" data-product-id="${p.id}" style="width:100%; padding:10px 16px; font-size:0.85rem; font-weight:700; letter-spacing:0.06em; display:flex; justify-content:center; align-items:center; gap:8px;" ${p.status === 'agotado' ? 'disabled' : ''}>
                      <span>COMPRAR</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    </section>
  `;

  attachCatalogEvents(callbacks);
}

function attachCatalogEvents(callbacks) {
  document.getElementById('catalog-btn-back-home')?.addEventListener('click', () => {
    callbacks.onNavigate?.('home');
  });

  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      activeCategory = e.currentTarget.getAttribute('data-cat');
      renderCatalog(callbacks);
    });
  });

  const searchInput = document.getElementById('catalog-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderCatalog(callbacks);
      const updatedInput = document.getElementById('catalog-search-input');
      if (updatedInput) {
        updatedInput.focus();
        updatedInput.selectionStart = updatedInput.selectionEnd = updatedInput.value.length;
      }
    });
  }

  document.getElementById('catalog-search-clear')?.addEventListener('click', () => {
    searchQuery = '';
    renderCatalog(callbacks);
  });

  const sortSelect = document.getElementById('catalog-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderCatalog(callbacks);
    });
  }

  document.getElementById('catalog-btn-reset-filters')?.addEventListener('click', () => {
    searchQuery = '';
    activeCategory = 'todos';
    currentSort = 'recommended';
    renderCatalog(callbacks);
  });

  document.querySelectorAll('.product-card, .btn-open-detail').forEach(el => {
    el.addEventListener('click', (e) => {
      const prodId = e.currentTarget.getAttribute('data-product-id');
      if (prodId) {
        const prod = productsService.getById(prodId);
        if (prod && prod.status !== 'agotado') {
          callbacks.onOpenProductDetail?.(prod);
        }
      }
    });
  });
}
