// list.js - renders the public catalog and allows adding to user's list (if logged in)
async function fetchCatalog() {
  try {
    const res = await fetch('./catalog.json');
    return await res.json();
  } catch (err) {
    console.error('No se pudo cargar catálogo', err);
    return [];
  }
}

function getToken() { return localStorage.getItem('token'); }

function showToast(message, type='default') {
  const t = document.getElementById('toast');
  if (!t) {
    alert(message); return;
  }
  t.textContent = message; t.classList.add('show');
  setTimeout(()=>{ t.classList.remove('show'); }, 3000);
}

function renderCatalogOnPage(catalog, userGames=[]) {
  const container = document.getElementById('catalog');
  if (!container) return;
  container.innerHTML = '';
  catalog.forEach(g => {
    const already = userGames.some(ug => ug.titulo === g.titulo && ug.plataforma === g.plataforma);
    container.innerHTML += `
      <div class="catalog-card">
        <div style="display:flex;gap:0.75rem;align-items:center">
          <img src="${g.imagen || ''}" class="catalog-thumb" onerror="this.style.opacity=0.6" />
          <div style="flex:1">
            <div style="font-weight:600">${g.titulo} <span class="small muted">(${g.plataforma})</span></div>
            <div class="small muted">${g.genero}</div>
          </div>
        </div>
        <div style="display:flex;gap:0.5rem">
          <button class="btn-secondary" onclick="showDetailsModal(${g.id})">Ver detalles</button>
          ${already ? '<button class="btn-added" disabled>Añadido</button>' : `<button class="btn-primary" onclick="addFromList(${g.id})">Añadir</button>`}
        </div>
      </div>
    `;
  });
}

function showDetailsModal(id) {
  const modal = document.getElementById('detailModal');
  const overlay = document.getElementById('modalOverlay');
  const content = document.getElementById('detailContent');
  fetchCatalog().then(catalog => {
    const g = catalog.find(x => x.id === id);
    if (!g) return showToast('Juego no encontrado');
    if (content) content.innerHTML = `
      <div style="display:flex;gap:0.75rem;align-items:center">
        <img src="${g.imagen || ''}" class="catalog-thumb" onerror="this.style.opacity=0.6" />
        <div>
          <h3 style="margin-top:0;margin-bottom:0.25rem">${g.titulo}</h3>
          <div class="small muted">${g.plataforma} • ${g.genero}</div>
        </div>
      </div>
      <p style="margin-top:0.75rem">${g.descripcion}</p>
    `;
    const addBtn = document.getElementById('addFromDetail');
    if (addBtn) addBtn.dataset.id = String(id);
    overlay.style.display = 'block';
    modal.style.display = 'block';
    requestAnimationFrame(()=>{ modal.style.transform = 'translate(-50%,-50%) scale(1)'; modal.style.opacity='1'; });
  });
}

document.getElementById('closeDetail')?.addEventListener('click', e => {
  e.preventDefault();
  const modal = document.getElementById('detailModal');
  const overlay = document.getElementById('modalOverlay');
  modal.style.transform = 'translate(-50%,-50%) scale(0.96)';
  modal.style.opacity = '0';
  overlay.style.display = 'none';
  setTimeout(()=> modal.style.display = 'none', 180);
});

document.getElementById('modalOverlay')?.addEventListener('click', () => {
  document.getElementById('closeDetail')?.click();
});

document.getElementById('addFromDetail')?.addEventListener('click', async e => {
  const id = parseInt(e.currentTarget.dataset.id || '0');
  if (!id) return showToast('Juego no seleccionado','error');
  await addFromList(id);
  document.getElementById('closeDetail')?.click();
});

async function loadUserGames() {
  const token = getToken();
  if (!token) return [];
  try {
    const res = await fetch('http://localhost:3000/games', { headers: { 'Authorization': 'Bearer ' + token } });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) { return []; }
}

async function initListPage() {
  const catalog = await fetchCatalog();
  const userGames = await loadUserGames();
  renderCatalogOnPage(catalog, userGames);
}

async function addFromList(id) {
  const catalog = await fetchCatalog();
  const g = catalog.find(x => x.id === id);
  if (!g) return showToast('Juego no encontrado', 'error');
  const token = getToken();
  if (!token) return showToast('Inicia sesión para añadir juegos', 'error');
  const res = await fetch('http://localhost:3000/games', {
    method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ titulo: g.titulo, plataforma: g.plataforma, genero: g.genero, estado: 'Pendiente' })
  });
  if (!res.ok) return showToast('No se pudo añadir', 'error');
  showToast('Añadido a tu lista', 'success');
  const userGames = await loadUserGames();
  renderCatalogOnPage(await fetchCatalog(), userGames);
}

// initialize on load
window.addEventListener('DOMContentLoaded', initListPage);
