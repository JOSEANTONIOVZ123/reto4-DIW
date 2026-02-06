// authentication
function getToken() { return localStorage.getItem("token"); }
function getUser() { return JSON.parse(localStorage.getItem("user") || "null"); }

const authDiv = document.getElementById("auth");
const appContent = document.getElementById("appContent");
const formLogin = document.getElementById("formLogin");
const formRegister = document.getElementById("formRegister");
const logoutBtn = document.getElementById("logout");
const lista = document.getElementById('lista');

async function cargar() {
  const token = getToken();
  const res = await fetch("http://localhost:3000/games", {
    headers: { "Authorization": "Bearer " + token }
  });
  const juegos = await res.json();
  userGames = juegos;
  // renderizar lista solo si el elemento existe en el DOM
  if (lista) {
    lista.innerHTML = "";
    juegos.forEach(j => {
      lista.innerHTML += `
      <li style="display:flex;align-items:center;justify-content:space-between;padding:0.6rem 0;border-bottom:1px solid rgba(255,255,255,0.02)">
        <div>
          <div style="font-weight:600">${j.titulo} <span class="small muted">(${j.plataforma})</span></div>
          <div class="small muted">${j.genero} — ${j.estado}</div>
        </div>
        <button class="btn-delete" aria-label="Borrar juego" onclick="borrar(${j.id})">❌</button>
      </li>
    `;
    });
  }
}

async function loadUserGames() {
  const token = getToken();
  try {
    const res = await fetch("http://localhost:3000/games", { headers: { "Authorization": "Bearer " + token } });
    userGames = await res.json();
  } catch (err) {
    userGames = [];
  }
}

function showToast(message, type = 'default') {
  const t = document.getElementById('toast');
  if (!t) return alert(message);
  t.textContent = message;
  t.classList.add('show');
  if (type === 'success') {
    t.style.background = 'linear-gradient(90deg,#10b981,#34d399)';
    t.style.color = '#042022';
  } else if (type === 'error') {
    t.style.background = 'linear-gradient(90deg,#ef4444,#f97316)';
    t.style.color = '#fff';
  } else {
    t.style.background = '';
    t.style.color = '';
  }
  t.style.display = 'block';
  requestAnimationFrame(() => t.classList.add('show'));
  clearTimeout(t._timeout);
  t._timeout = setTimeout(() => { t.classList.remove('show'); setTimeout(()=> t.style.display='none',220); }, 3000);
}

// CATALOGO
let catalog = [];
let userGames = [];
async function loadCatalog() {
  try {
    const res = await fetch("./catalog.json");
    catalog = await res.json();
    renderCatalog();
  } catch (err) {
    console.error("No se pudo cargar catálogo", err);
  }
}
function renderCatalog() {
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
          <button class="btn-secondary" onclick="showDetails(${g.id})">Ver detalles</button>
          ${already ? '<button class="btn-added" disabled>Añadido</button>' : `<button class="btn-primary" onclick="addFromCatalog(${g.id})">Añadir</button>`}
        </div>
      </div>
    `;
  });
}

function showDetails(id) {
  const g = catalog.find(x => x.id === id);
  if (!g) return;
  const modal = document.getElementById('detailModal');
  const content = document.getElementById('detailContent');
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
  document.getElementById('modalOverlay').style.display = 'block';
  modal.style.display = 'block';
  requestAnimationFrame(() => {
    modal.style.transform = 'translate(-50%,-50%) scale(1)';
    modal.style.opacity = '1';
  });
}

document.getElementById('closeDetail')?.addEventListener('click', e => {
  e.preventDefault();
  const modal = document.getElementById('detailModal');
  const overlay = document.getElementById('modalOverlay');
  modal.style.transform = 'translate(-50%,-50%) scale(0.96)';
  modal.style.opacity = '0';
  overlay.style.display = 'none';
  setTimeout(() => modal.style.display = 'none', 180);
});

document.getElementById('modalOverlay')?.addEventListener('click', () => {
  document.getElementById('closeDetail')?.click();
});

async function addFromCatalog(id) {
  const g = catalog.find(x => x.id === id);
  if (!g) return showToast('Juego no encontrado', 'error');
  const token = getToken();
  const res = await fetch("http://localhost:3000/games", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ titulo: g.titulo, plataforma: g.plataforma, genero: g.genero, estado: 'Pendiente' })
  });
  if (!res.ok) return showToast('No se pudo añadir', 'error');
  await cargar();
  // update userGames and re-render catalog
  await loadUserGames();
  renderCatalog();
  showToast('Añadido a tu lista', 'success');
}

// wire add from detail button
document.getElementById('addFromDetail')?.addEventListener('click', async e => {
  const id = parseInt(e.currentTarget.dataset.id);
  await addFromCatalog(id);
  document.getElementById('closeDetail')?.click();
});

formJuego.onsubmit = async e => {
  e.preventDefault();
  const token = getToken();

  await fetch("http://localhost:3000/games", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
    body: JSON.stringify({
      titulo: titulo.value,
      plataforma: plataforma.value,
      genero: genero.value,
      estado: estado.value
    })
  });

  await cargar();
  await loadUserGames();
  renderCatalog();
  showToast('Juego añadido', 'success');
};

async function borrar(id) {
  const token = getToken();
  await fetch("http://localhost:3000/games/" + id, { method: "DELETE", headers: { "Authorization": "Bearer " + token } });
  await cargar();
  await loadUserGames();
  renderCatalog();
  showToast('Juego eliminado', 'success');
}

// login
formLogin.onsubmit = async e => {
  e.preventDefault();
  const username = loginUser.value;
  const password = loginPass.value;

  const res = await fetch("http://localhost:3000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) return alert("Credenciales incorrectas");
  const data = await res.json();
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  setupUI();
  showToast('Has iniciado sesión', 'success');
};

// register
formRegister.onsubmit = async e => {
  e.preventDefault();
  const username = regUser.value;
  const password = regPass.value;

  const res = await fetch("http://localhost:3000/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) return alert("No se pudo registrar");
  const data = await res.json();
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  setupUI();
  showToast('Usuario registrado', 'success');
};

logoutBtn.onclick = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  setupUI();
};

function setupUI() {
  const token = getToken();
  if (token) {
    authDiv.style.display = "none";
    appContent.style.display = "block";
    const user = getUser();
    const lbl = document.getElementById('usernameLabel');
    if (lbl && user) lbl.textContent = user.username;
    cargar();
    loadCatalog();
  } else {
    authDiv.style.display = "block";
    appContent.style.display = "none";
  }
}

setupUI();
