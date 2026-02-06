// authentication
function getToken() { return localStorage.getItem("token"); }
function getUser() { return JSON.parse(localStorage.getItem("user") || "null"); }

const authDiv = document.getElementById("auth");
const appContent = document.getElementById("appContent");
const formLogin = document.getElementById("formLogin");
const formRegister = document.getElementById("formRegister");
const logoutBtn = document.getElementById("logout");

async function cargar() {
  const token = getToken();
  const res = await fetch("http://localhost:3000/games", {
    headers: { "Authorization": "Bearer " + token }
  });
  const juegos = await res.json();

  lista.innerHTML = "";

  juegos.forEach(j => {
    lista.innerHTML += `
      <li>
        <div>
          <div style="font-weight:600">${j.titulo} <span class="small muted">(${j.plataforma})</span></div>
          <div class="small muted">${j.genero} — ${j.estado}</div>
        </div>
  <button class="btn-delete" aria-label="Borrar juego" onclick="borrar(${j.id})">❌</button>
      </li>
    `;
  });
}

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

  cargar();
};

async function borrar(id) {
  const token = getToken();
  await fetch("http://localhost:3000/games/" + id, { method: "DELETE", headers: { "Authorization": "Bearer " + token } });
  cargar();
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
  } else {
    authDiv.style.display = "block";
    appContent.style.display = "none";
  }
}

setupUI();
