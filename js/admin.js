const rol = localStorage.getItem("rol");

if (rol !== "admin") {
  alert("Acceso denegado");
  window.location.href = "dashboard.html";
}

const contenedor = document.getElementById("listaPendientes");

let ordenes = JSON.parse(localStorage.getItem("ordenes")) || [];

// 🔥 FILTRAR SOLO LAS QUE ESPERAN APROBACIÓN
const pendientes = ordenes.filter(ot => ot.estado === "Espera Aprobación");

renderPendientes();

function renderPendientes() {

  contenedor.innerHTML = "";

  if (pendientes.length === 0) {
    contenedor.innerHTML = "<p>No hay OTs pendientes</p>";
    return;
  }

  pendientes.forEach(ot => {

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>${ot.id}</h3>
      <p><strong>Cliente:</strong> ${ot.cliente}</p>
      <p><strong>Máquina:</strong> ${ot.maquina}</p>

      <button onclick="verOT('${ot.id}')">Ver detalle</button>
    `;

    contenedor.appendChild(div);
  });
}

// 🔹 IR A DETALLE
function verOT(id) {
  window.location.href = `detalle.html?id=${id}`;
}

// 🔹 NAVEGACIÓN
function irDashboard() {
  window.location.href = "dashboard.html";
}

function irOT() {
  window.location.href = "ordenes.html";
}

function irAdmin() {
  window.location.href = "admin.html";
}