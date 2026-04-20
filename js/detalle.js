const params = new URLSearchParams(window.location.search);
const id = params.get("id");

let ordenes = JSON.parse(localStorage.getItem("ordenes")) || [];

const estadosFlujo = [
  "Ingreso",
  "Evaluación",
  "Overhaul",
  "Pruebas",
  "Despacho",
  "Terminado"
];

// 🔍 Buscar OT
let ot = ordenes.find(o => o.id == id);

if (!ot) {
  alert("OT no encontrada");
}

// 🔥 asegurar registros
if (!ot.registros) {
  ot.registros = [];
}

// 🔹 Cargar datos
document.getElementById("otId").textContent = ot.id;
document.getElementById("maquina").textContent = ot.maquina;
document.getElementById("serie").textContent = ot.serie;
document.getElementById("cliente").textContent = ot.cliente;
document.getElementById("estado").textContent = ot.estado;

const btnAprobar = document.getElementById("btnAprobar");
const inputDoc = document.getElementById("docAprobacion");

const rol = localStorage.getItem("rol");

// 🔒 SOLO ADMIN VE EL BOTÓN
if (btnAprobar) {

  if (rol === "admin" && ot.estado === "Espera Aprobación") {
    btnAprobar.style.display = "inline-block";
  } else {
    btnAprobar.style.display = "none";
  }

  btnAprobar.addEventListener("click", () => {
  document.getElementById("modalAprobacion").style.display = "flex";
});

  inputDoc.addEventListener("change", async () => {

    const file = inputDoc.files[0];

    if (!file) {
      alert("Debes subir un documento para aprobar");
      return;
    }

    const confirmar = confirm("¿Aprobar evaluación?");
    if (!confirmar) return;

    const base64 = await convertirBase64(file);

    // 🔥 guardar aprobación
    ot.aprobada = true;
    ot.bloqueada = false;
    ot.estado = "Overhaul";

    ot.aprobacion = {
      documento: base64,
      fecha: new Date().toLocaleDateString(),
      usuario: "Administrador"
    };

    // 🔥 BITÁCORA
    ot.registros.push({
      id: Date.now(),
      fecha: new Date().toLocaleDateString(),
      tecnico: "Administrador",
      descripcion: "✅ Evaluación aprobada con documentación",
      tipo: "aprobacion",
      documento: base64
    });

    localStorage.setItem("ordenes", JSON.stringify(ordenes));

    alert("OT aprobada correctamente");

    location.reload();
  });
}

// 🔥 BOTÓN OVERHAUL
const btnOverhaul = document.getElementById("btnOverhaul");

if (btnOverhaul) {

  // 👁️ opcional: mostrar solo en etapa correcta
  if (ot.estado === "Overhaul" && ot.aprobada) {
    btnOverhaul.style.display = "inline-block";
  } else {
    btnOverhaul.style.display = "none";
  }

  btnOverhaul.addEventListener("click", () => {
    abrirOverhaul(ot.id);
  });
}

// 🔒 BLOQUEAR SI ESTÁ EN ESPERA DE APROBACIÓN
if (ot.bloqueada) {
  document.getElementById("btnRegistro").style.display = "none";
}

// 🔹 VISOR IMAGEN
const visor = document.getElementById("visor");
const imgGrande = document.getElementById("imgGrande");

document.addEventListener("click", function(e) {

  if (e.target.classList.contains("mini-img")) {
    const visor = document.getElementById("visor");
    const imgGrande = document.getElementById("imgGrande");

    visor.style.display = "flex";
    imgGrande.src = e.target.src;
  }

});

visor.addEventListener("click", function(e) {
  if (e.target === visor) {
    visor.style.display = "none";
  }
});

// 🔹 Convertir imagen
function convertirBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// 🔹 RENDER BITÁCORA
function renderBitacora() {
  const contenedor = document.getElementById("bitacora");
  contenedor.innerHTML = "";

  ot.registros.forEach((reg, i) => {

    let claseExtra = "";

    if (reg.tipo === "entrega") claseExtra = "registro-entrega";
    if (reg.tipo === "ingreso") claseExtra = "registro-ingreso";
    if (reg.tipo === "evaluacion") claseExtra = "registro-evaluacion";
    if (reg.tipo === "overhaul") {
  claseExtra = "registro-overhaul";
}
if (reg.tipo === "aprobacion") claseExtra = "registro-aprobacion";

    // 🔹 IMÁGENES
    const imagenesHTML = reg.imagenes
      ? reg.imagenes.map((img, index) => `
        <div class="foto-container">
          <img src="${img}" class="foto">
          <button class="btn-eliminar" onclick="eliminarFoto(${index}, ${i})">✖</button>
        </div>
      `).join("")
      : "";

    // 🔹 CHECKLISTS
    let checklistHTML = "";

    // INGRESO
    if (reg.tipo === "ingreso" && reg.checklist) {
      checklistHTML = `
        <div class="checklist-bitacora">
          <h4 onclick="this.nextElementSibling.classList.toggle('oculto')" style="cursor:pointer;">
            Checklist de ingreso ⬇
          </h4>
          <ul class="oculto">
            ${reg.checklist.map(item => {
              const texto = item.Nombre || item.nombre || Object.values(item)[0];
              return `<li>✔ ${texto}</li>`;
            }).join("")}
          </ul>
        </div>
      `;
    }

    // EVALUACIÓN
    if (reg.tipo === "evaluacion" && reg.checklist) {
      checklistHTML = `
        <div class="checklist-bitacora">
          <h4 onclick="this.nextElementSibling.classList.toggle('oculto')" style="cursor:pointer;">
            Evaluación ⬇
          </h4>
          <ul class="oculto">
            ${reg.checklist.map((item, i) => {
              const texto = item.Nombre || Object.values(item)[0];
              const estado = reg.progreso?.[i];

              if (!estado) return `<li>⬜ ${texto}</li>`;

              return `
                <li>
                  ${estado.checked ? "✔" : "⬜"} ${texto}
                  ${estado.img ? `<br><img src="${estado.img}" class="mini-img">` : ""}
                </li>
              `;
            }).join("")}
          </ul>
        </div>
      `;
    }

    if (reg.tipo === "overhaul" && reg.checklist) {
  checklistHTML = `
    <div class="checklist-bitacora">
      <h4 onclick="this.nextElementSibling.classList.toggle('oculto')" style="cursor:pointer;">
        Overhaul ⬇
      </h4>
      <ul class="oculto">
        ${reg.checklist.map((item, i) => {

          const texto = item.Nombre || Object.values(item)[0];
          const estado = reg.progreso?.[i];

          if (!estado) return `<li>⬜ ${texto}</li>`;

          return `
            <li>
              ${estado.checked ? "✔" : "⬜"} ${texto}
              ${estado.img ? `<br><img src="${estado.img}" class="mini-img">` : ""}
            </li>
          `;
        }).join("")}
      </ul>
    </div>
  `;
}

    // 🔹 REPUESTOS
    const repuestosHTML = reg.repuestos && reg.repuestos.length > 0
      ? `<p><strong>Repuestos usados:</strong> ${reg.repuestos.join(", ")}</p>`
      : "";

    const div = document.createElement("div");
div.className = "registro " + claseExtra;

// 🔥 AQUÍ VA
if (reg.tipo === "evaluacion") {

  const evaluacionFinalizada = ot.estado === "Espera Aprobación" || ot.bloqueada;

  if (!evaluacionFinalizada) {
    // 🟡 EN PROGRESO → PERMITIR EDITAR
    div.style.cursor = "pointer";

    div.addEventListener("click", () => {
      abrirEvaluacion(ot.id);
    });

  } else {
    // 🟢 FINALIZADA → SOLO VISUAL
    div.style.cursor = "default";

     // 🔥 AQUÍ VA
    div.classList.add("evaluacion-finalizada");
  }
}

div.innerHTML = `
  <div class="contenido-registro">
    <p><strong>${reg.fecha}</strong> - ${reg.tecnico}</p>
    <p>${reg.descripcion}</p>

    ${reg.documentos ? reg.documentos.map(doc => `
      <div>
        <a href="${doc}" target="_blank">📄 Ver documento</a>
      </div>
    `).join("") : ""}

    ${checklistHTML}

    <div class="galeria">${imagenesHTML}</div>
  </div>
`;

    contenedor.appendChild(div);
  });
}

// 🔹 ELIMINAR FOTO
function eliminarFoto(index, registroIndex) {
  const registro = ot.registros[registroIndex];
  if (!registro) return;

  registro.imagenes.splice(index, 1);

  localStorage.setItem("ordenes", JSON.stringify(ordenes));
  renderBitacora();
}

// 🔹 AVANZAR ESTADO
function avanzarEstado() {

  const indexActual = estadosFlujo.indexOf(ot.estado);

  if (indexActual === -1 || indexActual === estadosFlujo.length - 1) {
    alert("No se puede avanzar más");
    return;
  }

  if (!ot.registros || ot.registros.length === 0) {
    alert("Debes registrar trabajo antes de avanzar");
    return;
  }

  if (ot.estado === "Evaluación") {
    if (!checklistCompleto()) {
      alert("Debes completar el checklist antes de avanzar");
      return;
    }
  }

  const siguienteEstado = estadosFlujo[indexActual + 1];

  if (!confirm(`¿Avanzar a ${siguienteEstado}?`)) return;

  ot.estado = siguienteEstado;

  localStorage.setItem("ordenes", JSON.stringify(ordenes));
  document.getElementById("estado").textContent = ot.estado;

  alert("Estado actualizado a: " + siguienteEstado);
}

// 🔹 VALIDACIÓN CHECKLIST
function checklistCompleto() {
  const ingreso = ot.registros.find(r => r.tipo === "ingreso");

  if (!ingreso || !ingreso.checklist) return false;
  if (ingreso.checklist.length === 0) return false;

  return true;
}

// 🔹 ABRIR EVALUACIÓN
function abrirEvaluacion(id) {

  localStorage.setItem("otEvaluacion", id);

  let ordenes = JSON.parse(localStorage.getItem("ordenes")) || [];
  let ot = ordenes.find(o => o.id == id);

  document.getElementById("modalEvaluacion").style.display = "flex";

  const tieneChecklist = ot.evaluacion?.checklist?.length > 0;
  const tieneProgreso = ot.evaluacion?.progreso?.length > 0;

  if (tieneChecklist || tieneProgreso) {

    renderEvaluacion(
      ot.evaluacion.checklist || [],
      ot.evaluacion.progreso || []
    );

    document.getElementById("evalPaso1").style.display = "none";
    document.getElementById("evalPaso2").style.display = "block";

  } else {

    document.getElementById("evalPaso1").style.display = "block";
    document.getElementById("evalPaso2").style.display = "none";
  }
}

// 🔹 NAVEGACIÓN
function irDashboard() {
  window.location.href = "dashboard.html";
}

function irOT() {
  window.location.href = "ordenes.html";
}

function cerrarModalPorId(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = "none";
}

window.addEventListener("click", function(e) {

  document.querySelectorAll(".modal").forEach(modal => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

});

async function confirmarAprobacion() {

  const input = document.getElementById("docsAprobacion");
  const archivos = input.files;

  if (!archivos || archivos.length === 0) {
    alert("Debes adjuntar al menos un documento");
    return;
  }

  const confirmar = confirm("¿Aprobar evaluación?");
  if (!confirmar) return;

  let docsBase64 = [];

  for (let file of archivos) {
    const base64 = await convertirBase64(file);
    docsBase64.push(base64);
  }

  // 🔥 guardar en OT
  ot.aprobada = true;
  ot.bloqueada = false;
  ot.estado = "Overhaul";

  ot.aprobacion = {
    documentos: docsBase64,
    fecha: new Date().toLocaleDateString(),
    usuario: "Administrador"
  };

  // 🔥 bitácora
  ot.registros.push({
    id: Date.now(),
    fecha: new Date().toLocaleDateString(),
    tecnico: "Administrador",
    descripcion: "✅ Evaluación aprobada con documentación",
    tipo: "aprobacion",
    documentos: docsBase64
  });

  localStorage.setItem("ordenes", JSON.stringify(ordenes));

  alert("OT aprobada correctamente");

  cerrarModalPorId("modalAprobacion");

  location.reload();
}

// 🔥 INICIO
renderBitacora();