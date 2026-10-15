/**
 * QuinetShop - Integrated In-Page Image & Receipt Viewer Lightbox
 * Features:
 * - High-resolution fluid zoom & pan (Scroll wheel & Drag)
 * - 90-degree image rotation
 * - Dedicated toolbar (Zoom controls, download, external link, close)
 * - Smooth backdrop blur and keyboard navigation (Escape to close)
 */

let currentScale = 1;
let currentRotation = 0;
let isDragging = false;
let startX = 0, startY = 0;
let translateX = 0, translateY = 0;

export function openImageViewer(imageUrl, title = 'Visualizador de Imagen') {
  if (!imageUrl) return;

  const modal = document.getElementById('image-viewer-modal');
  if (!modal) return;

  currentScale = 1;
  currentRotation = 0;
  translateX = 0;
  translateY = 0;
  isDragging = false;

  const isPdf = typeof imageUrl === 'string' && (imageUrl.toLowerCase().endsWith('.pdf') || imageUrl.toLowerCase().includes('.pdf?'));

  modal.innerHTML = `
    <div class="image-viewer-container" style="position:relative; width:100%; height:100%; display:flex; flex-direction:column; justify-content:space-between; padding:20px; box-sizing:border-box;">
      
      <!-- TOP TOOLBAR -->
      <div class="image-viewer-toolbar" style="display:flex; justify-content:space-between; align-items:center; z-index:3000; background:rgba(3, 7, 10, 0.88); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border:1px solid var(--color-border-glass); border-radius:12px; padding:10px 18px; box-shadow:0 8px 32px rgba(0,0,0,0.5); max-width:900px; margin:0 auto; width:100%; box-sizing:border-box;">
        <div style="display:flex; align-items:center; gap:10px; overflow:hidden;">
          <div style="width:28px; height:28px; border-radius:6px; background:var(--color-neon-wash); border:1px solid var(--color-border-glow); display:flex; align-items:center; justify-content:center; color:var(--color-neon); flex-shrink:0;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          </div>
          <span style="font-family:var(--font-mono); font-size:0.82rem; font-weight:700; color:#FFFFFF; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">
            ${title}
          </span>
        </div>

        <!-- CONTROLS -->
        <div style="display:flex; align-items:center; gap:8px;">
          ${!isPdf ? `
            <!-- ZOOM OUT -->
            <button id="iv-btn-zoom-out" class="btn-ghost btn-sm" title="Reducir zoom" style="padding:6px 10px; background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.15); color:#FFFFFF;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
            </button>
            
            <!-- ZOOM VALUE / RESET -->
            <button id="iv-btn-zoom-reset" class="btn-ghost btn-sm" title="Restablecer tamaño (100%)" style="padding:6px 10px; font-family:var(--font-mono); font-size:0.75rem; background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.15); color:var(--color-neon);">
              <span id="iv-zoom-level">100%</span>
            </button>

            <!-- ZOOM IN -->
            <button id="iv-btn-zoom-in" class="btn-ghost btn-sm" title="Aumentar zoom" style="padding:6px 10px; background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.15); color:#FFFFFF;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
            </button>

            <!-- ROTATE -->
            <button id="iv-btn-rotate" class="btn-ghost btn-sm" title="Girar 90°" style="padding:6px 10px; background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.15); color:#FFFFFF;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
            </button>
          ` : ''}

          <!-- DOWNLOAD -->
          <a href="${imageUrl}" download="archivo_${Date.now()}.${isPdf ? 'pdf' : 'png'}" target="_blank" class="btn-ghost btn-sm" title="Descargar o abrir archivo" style="padding:6px 10px; background:rgba(255,255,255,0.06); border-color:rgba(255,255,255,0.15); color:#FFFFFF; text-decoration:none; display:inline-flex; align-items:center;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </a>

          <!-- CLOSE BUTTON -->
          <button id="iv-btn-close" class="modal-close-btn" style="position:static; margin-left:6px; background:rgba(239,68,68,0.2); border-color:rgba(239,68,68,0.4); color:#FFFFFF;" title="Cerrar visor (Esc)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      <!-- MAIN VIEWPORT / IMAGE OR PDF WRAPPER -->
      <div id="iv-stage" style="flex:1; width:100%; height:100%; display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative; ${isPdf ? '' : 'cursor:grab;'} margin:12px 0;">
        ${isPdf ? `
          <iframe src="${imageUrl}" style="width:85vw; height:78vh; border:none; border-radius:10px; background:#ffffff; box-shadow:0 12px 48px rgba(0,0,0,0.6);" title="${title}"></iframe>
        ` : `
          <img id="iv-target-img" 
               src="${imageUrl}" 
               alt="${title}" 
               style="max-width:88vw; max-height:80vh; object-fit:contain; border-radius:10px; box-shadow:0 12px 48px rgba(0,0,0,0.6), 0 0 30px rgba(0,180,216,0.18); transition:transform 0.15s ease-out; user-select:none; -webkit-user-drag:none; will-change:transform;"
               onerror="this.style.display='none'; const fb = document.getElementById('iv-error-fallback'); if(fb) fb.style.display='flex';">
          <div id="iv-error-fallback" style="display:none; flex-direction:column; align-items:center; justify-content:center; padding:32px 24px; background:rgba(3, 7, 10, 0.88); border:1px solid var(--color-border-glass); border-radius:12px; max-width:440px; text-align:center;">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon)" stroke-width="2" style="margin-bottom:12px;">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <div style="color:#ffffff; font-weight:700; margin-bottom:6px; font-size:0.95rem;">Comprobante / Archivo</div>
            <p style="color:var(--color-ash-gray); font-size:0.8rem; margin-bottom:18px; line-height:1.4;">El archivo no se pudo previsualizar directamente como imagen.</p>
            <a href="${imageUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="padding:10px 20px; font-size:0.82rem; text-decoration:none;">Abrir Archivo Original</a>
          </div>
        `}
      </div>

      <!-- FOOTER HINT -->
      <div style="text-align:center; color:rgba(255,255,255,0.5); font-size:0.72rem; font-family:var(--font-mono); pointer-events:none;">
        Usa la rueda del mouse o botones para hacer zoom • Arrastra para mover la imagen • Presiona Esc para cerrar
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  const img = document.getElementById('iv-target-img');
  const stage = document.getElementById('iv-stage');
  const zoomText = document.getElementById('iv-zoom-level');

  const updateTransform = () => {
    if (!img) return;
    img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale}) rotate(${currentRotation}deg)`;
    if (zoomText) {
      zoomText.textContent = `${Math.round(currentScale * 100)}%`;
    }
  };

  // ZOOM CONTROLS
  document.getElementById('iv-btn-zoom-in')?.addEventListener('click', (e) => {
    e.stopPropagation();
    currentScale = Math.min(currentScale + 0.25, 4.0);
    updateTransform();
  });

  document.getElementById('iv-btn-zoom-out')?.addEventListener('click', (e) => {
    e.stopPropagation();
    currentScale = Math.max(currentScale - 0.25, 0.5);
    updateTransform();
  });

  document.getElementById('iv-btn-zoom-reset')?.addEventListener('click', (e) => {
    e.stopPropagation();
    currentScale = 1;
    currentRotation = 0;
    translateX = 0;
    translateY = 0;
    updateTransform();
  });

  document.getElementById('iv-btn-rotate')?.addEventListener('click', (e) => {
    e.stopPropagation();
    currentRotation = (currentRotation + 90) % 360;
    updateTransform();
  });

  document.getElementById('iv-btn-close')?.addEventListener('click', closeImageViewer);

  // MOUSE WHEEL ZOOM
  stage?.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    currentScale = Math.min(Math.max(currentScale + delta, 0.5), 4.0);
    updateTransform();
  }, { passive: false });

  // DOUBLE CLICK TO TOGGLE ZOOM
  img?.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    if (currentScale !== 1) {
      currentScale = 1;
      translateX = 0;
      translateY = 0;
    } else {
      currentScale = 2;
    }
    updateTransform();
  });

  // DRAG / PAN LOGIC
  stage?.addEventListener('mousedown', (e) => {
    if (e.target.id === 'iv-btn-close' || e.target.closest('.image-viewer-toolbar')) return;
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    stage.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateTransform();
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      if (stage) stage.style.cursor = 'grab';
    }
  });

  // CLOSE ON BACKDROP CLICK
  modal.onclick = (e) => {
    if (e.target.id === 'image-viewer-modal' || e.target.id === 'iv-stage') {
      closeImageViewer();
    }
  };

  // ESCAPE KEY LISTENER
  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeImageViewer();
      window.removeEventListener('keydown', onKeyDown);
    }
  };
  window.addEventListener('keydown', onKeyDown);
}

export function closeImageViewer() {
  const modal = document.getElementById('image-viewer-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.innerHTML = '';
    document.body.style.overflow = '';
  }
}

// Global exposure so inline HTML handlers can call it anywhere
if (typeof window !== 'undefined') {
  window.openImageViewer = openImageViewer;
  window.closeImageViewer = closeImageViewer;
}
