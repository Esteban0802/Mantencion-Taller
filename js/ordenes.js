const checklistPorEquipo = {

  "GA/GR/GX": [
    { Nombre: "Revisión aceite" },
    { Nombre: "Estado filtro aire" },
    { Nombre: "Chequeo presión" }
  ],

  "ZT/ZR": [
    { Nombre: "Chequeo etapas compresión" },
    { Nombre: "Revisión válvulas" }
  ],

  "CD": [
    { Nombre: "Revisión válvula purga" },
    { Nombre: "Estado desecante" }
  ],

  "BD": [
    { Nombre: "Revisión torre A" },
    { Nombre: "Revisión torre B" }
  ],

  "FD": [
    { Nombre: "Revisión ventilador" },
    { Nombre: "Chequeo condensador" }
  ]

};


const filtro = localStorage.getItem("filtroEstado");

let checklistData = [];
let ordenes = JSON.parse(localStorage.getItem("ordenes")) || [];
renderTabla();

// Abrir modal
document.getElementById("btnNuevaOT").addEventListener("click", () => {
  document.getElementById("modal").style.display = "flex";
});

// Cerrar modal
function cerrarModal() {
  document.getElementById("modal").style.display = "none";
}

// Guardar OT
async function guardarOT() {

  const maquina = document.getElementById("maquina").value;
  const serie = document.getElementById("serie").value;
  const cliente = document.getElementById("cliente").value;
  const numeroOS = document.getElementById("numeroOS").value;
  const fotosInput = document.getElementById("fotosIngreso");
  const tipoEquipo = document.getElementById("tipoEquipo").value;
  const subtipoEquipo = document.getElementById("subtipoEquipo").value;

  if (fotosInput.files.length === 0) {
    alert("Debes subir fotos de ingreso");
    return;
  }

  let fotos = [];

  for (let file of fotosInput.files) {
    const base64 = await convertirBase64(file);
    fotos.push(base64);
  }

  const nuevaOT = {
  id: numeroOS,
  maquina,
  serie,
  cliente,
  tipoEquipo,
  subtipoEquipo,
  estado: "Evaluación",
  fecha: new Date().toISOString().split("T")[0],
  checklistIngreso: checklistData,
  fotosIngreso: fotos,
  evaluacion: {
  checklist: [],
  progreso: [] // 🔥 aquí se guardan avances
},
bloqueada: false,
aprobada: false,

  // 🔥 NUEVO: registro automático
  registros: [
  {
    id: Date.now(),
    fecha: new Date().toLocaleDateString(),
    tecnico: "Sistema", // 🔥 BONUS
    descripcion: `📥 Ingreso equipo ${maquina} - Serie ${serie}`,
    imagenes: fotos,
    tipo: "ingreso",
    checklist: checklistData // 🔥 CLAVE,
  }
]
};

  ordenes = JSON.parse(localStorage.getItem("ordenes")) || [];
  ordenes.push(nuevaOT);

  localStorage.setItem("ordenes", JSON.stringify(ordenes));

  alert("OS creada correctamente");

  // 🔥 LIMPIAR FORMULARIO
document.getElementById("maquina").value = "";
document.getElementById("serie").value = "";
document.getElementById("cliente").value = "";
document.getElementById("fotosIngreso").value = "";
document.getElementById("listaChecklist").innerHTML = "";
document.getElementById("numeroOS").value = "";

checklistData = [];



// 🔄 VOLVER A PASO 1
document.getElementById("paso1").style.display = "block";
document.getElementById("paso2").style.display = "none";
document.getElementById("paso3").style.display = "none";



  cerrarModal();
  renderTabla();
  abrirEvaluacion(nuevaOT.id);
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

function irOT() {
  window.location.href = "ordenes.html";
}

function logout() {
  window.location.href = "index.html";
}

async function siguientePaso(paso) {

  if (paso === 1) {

  const maquina = document.getElementById("maquina").value;
  const serie = document.getElementById("serie").value;
  const cliente = document.getElementById("cliente").value;
  const numeroOS = document.getElementById("numeroOS").value;
  const subtipo = document.getElementById("subtipoEquipo").value;
  const excel = document.getElementById("excelChecklist").files[0];

  console.log("Excel:", excel);

  if (!maquina || !serie || !cliente || !numeroOS || !subtipo || !excel) {
    alert("Completa todos los campos y carga el checklist");
    return;
  }

  const existe = ordenes.some(ot => ot.id === numeroOS);

  if (existe) {
    alert("Ya existe una OS con ese número");
    return;
  }

  // 🔥 CARGAR EXCEL
  await cargarChecklistExcel(excel);

  document.getElementById("paso1").style.display = "none";
  document.getElementById("paso2").style.display = "block";
}

  if (paso === 2) {

  const checks = document.querySelectorAll("#listaChecklist input");

  if (checks.length === 0) {
    alert("No hay checklist cargado");
    return;
  }

  const noMarcados = [...checks].filter(c => !c.checked);

  if (noMarcados.length > 0) {
    alert(`Te faltan ${noMarcados.length} ítems por completar`);
    return;
  }

  // ✅ TODO OK → AVANZA
  document.getElementById("paso2").style.display = "none";
  document.getElementById("paso3").style.display = "block";
}
}

function volverPaso(paso) {

  if (paso === 2) {
    document.getElementById("paso2").style.display = "none";
    document.getElementById("paso1").style.display = "block";
  }

  if (paso === 3) {
    document.getElementById("paso3").style.display = "none";
    document.getElementById("paso2").style.display = "block";
  }
}

function renderChecklist() {

  const contenedor = document.getElementById("listaChecklist");
  contenedor.innerHTML = "";

  if (checklistData.length === 0) return;

  const table = document.createElement("table");
  table.className = "tabla-checklist";

  // 🔹 ENCABEZADOS
  const headers = Object.keys(checklistData[0]);

  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");

  trHead.innerHTML = `<th>✔</th>` + headers.map(h => `<th>${h}</th>`).join("");

  thead.appendChild(trHead);
  table.appendChild(thead);

  // 🔹 FILAS
  const tbody = document.createElement("tbody");

  checklistData.forEach((item, index) => {

    const tr = document.createElement("tr");

    const columnas = headers.map(h => `<td>${item[h] || ""}</td>`).join("");

    tr.innerHTML = `
      <td><input type="checkbox" id="chk${index}"></td>
      ${columnas}
    `;

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  contenedor.appendChild(table);

}

function convertirBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

function cargarSubtipo() {

  const tipo = document.getElementById("tipoEquipo").value;
  const subtipoSelect = document.getElementById("subtipoEquipo");

  subtipoSelect.innerHTML = '<option value="">Seleccionar</option>';

  let opciones = [];

  if (tipo === "Compresor") {
    opciones = ["GA/GR/GX", "ZT/ZR"];
  }

  if (tipo === "Secador") {
    opciones = ["CD", "BD", "FD"];
  }

  opciones.forEach(op => {
    const option = document.createElement("option");
    option.value = op;
    option.textContent = op;
    subtipoSelect.appendChild(option);
  });
}

async function cargarChecklistExcel(file) {

  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);

  const hoja = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(hoja);

  checklistData = json;

  renderChecklist();
}


function cerrarEvaluacion() {
  document.getElementById("modalEvaluacion").style.display = "none";
}

function cerrarModalPorId(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = "none";
}