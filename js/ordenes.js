const filtro = localStorage.getItem("filtroEstado");

let ordenes = JSON.parse(localStorage.getItem("ordenes")) || [];
renderTabla();

// Abrir modal
document.getElementById("btnNuevaOT").addEventListener("click", () => {
  document.getElementById("modal").style.display = "block";
});

// Cerrar modal
function cerrarModal() {
  document.getElementById("modal").style.display = "none";
}

// Guardar OT
async function guardarOT() {

  const numeroOS = document.getElementById("numeroOS").value;
  const maquina = document.getElementById("maquina").value;
  const serie = document.getElementById("serie").value;
  const cliente = document.getElementById("cliente").value;
  const descripcion = document.getElementById("descripcion").value;
  const estado = "Ingreso";

  // 🔥 VALIDACIÓN CAMPOS
  if (!numeroOS || !maquina || !serie || !cliente || !descripcion) {
    alert("Completa todos los campos");
    return;
  }

  // 🔥 AQUÍ VA TU CÓDIGO 👇
  const existe = ordenes.some(ot => ot.id === numeroOS);

  if (existe) {
    alert("Ya existe una OS con ese número");
    return;
  }

  // 🔥 LEER EXCEL AQUÍ
  const inputExcel = document.getElementById("excelRepuestos");
  let repuestos = [];

  if (inputExcel.files.length > 0) {
    const file = inputExcel.files[0];

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);

    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(hoja);

    repuestos = json;
  }

  // 🔥 CREAR OS
  const nuevaOT = {
    id: numeroOS,
    maquina,
    serie,
    cliente,
    estado,
    fecha: new Date().toISOString().split("T")[0],
    repuestos // 🔥 AQUÍ SE GUARDA
  };

  ordenes.push(nuevaOT);

  localStorage.setItem("ordenes", JSON.stringify(ordenes));

  renderTabla();
  cerrarModal();
}

// Renderizar tabla
function renderTabla(filtroTexto = "") {
  const tabla = document.getElementById("tablaOT");
  tabla.innerHTML = "";

let lista = ordenes;

// 🔍 filtro por estado (desde dashboard)
if (filtro) {
  lista = lista.filter(ot => ot.estado === filtro);
}

// 🔍 filtro por texto (buscador)
if (filtroTexto) {
  lista = lista.filter(ot => {
  const texto = filtroTexto.toLowerCase();

  return (
    ot.id.toLowerCase().includes(texto) ||
    ot.maquina.toLowerCase().includes(texto) ||
    ot.cliente.toLowerCase().includes(texto) ||
    ot.serie.toLowerCase().includes(texto)
  );
});
}

  lista.forEach(ot => {
    const fila = document.createElement("tr");

fila.innerHTML = `
  <td>${ot.id}</td>
  <td>${ot.maquina}</td>
  <td>${ot.serie}</td>
  <td>${ot.cliente}</td>
  <td class="estado ${ot.estado.replace(" ", "-")}">
  ${ot.estado}
  </td>
  <td>${ot.fecha}</td>
`;

// 🔥 Hacer fila clickeable
fila.style.cursor = "pointer";

fila.addEventListener("click", () => {
  window.location.href = `detalle.html?id=${ot.id}`;
});

    tabla.appendChild(fila);
  });
}

const buscador = document.getElementById("buscador");

buscador.addEventListener("input", function() {
  renderTabla(this.value);
});

// Navegar
function irDashboard() {
  window.location.href = "dashboard.html";
}

function irDashboard() {
  window.location.href = "dashboard.html";
}

function irOT() {
  window.location.href = "ordenes.html";
}

function logout() {
  window.location.href = "index.html";
}