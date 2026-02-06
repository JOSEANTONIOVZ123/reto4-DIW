const usuario_id = 1; // temporal

async function cargar() {
  const res = await fetch("http://localhost:3000/games?usuario_id=" + usuario_id);
  const juegos = await res.json();

  lista.innerHTML = "";

  juegos.forEach(j => {
    lista.innerHTML += `
      <li>
        ${j.titulo} (${j.estado})
        <button onclick="borrar(${j.id})">❌</button>
      </li>
    `;
  });
}

formJuego.onsubmit = async e => {
  e.preventDefault();

  await fetch("http://localhost:3000/games", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      titulo: titulo.value,
      plataforma: plataforma.value,
      genero: genero.value,
      estado: estado.value,
      usuario_id
    })
  });

  cargar();
};

async function borrar(id) {
  await fetch("http://localhost:3000/games/" + id, { method: "DELETE" });
  cargar();
}

cargar();
