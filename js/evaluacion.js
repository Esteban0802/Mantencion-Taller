// 🔥 ABRIR EVALUACIÓN
function abrirEvaluacion(id) {

  console.log("Abrir evaluación:", id);

  localStorage.setItem("otEvaluacion", id);

  const ordenes = JSON.parse(localStorage.getItem("ordenes")) || [];
  const ot = ordenes.find(o => o.id == id);

  if (!ot) {
    alert("No se encontró la OT");
    return;
  }

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


// 🔥 SIGUIENTE PASO (CARGAR EXCEL)
async function siguienteEvaluacion(paso) {

  if (paso !== 1) return;

  const file = document.getElementById("excelEvaluacion").files[0];

  if (!file) {
    alert("Debes cargar el checklist");
    return;
  }

  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);

  const hoja = workbook.Sheets[workbook.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json(hoja);

  const id = localStorage.getItem("otEvaluacion");

  let ordenes = JSON.parse(localStorage.getItem("ordenes")) || [];
  let ot = ordenes.find(o => o.id == id);

  ot.evaluacion.checklist = json;

  localStorage.setItem("ordenes", JSON.stringify(ordenes));

  renderEvaluacion(json, ot.evaluacion.progreso);

  document.getElementById("evalPaso1").style.display = "none";
  document.getElementById("evalPaso2").style.display = "block";
}


// 🔥 RENDER CHECKLIST
function renderEvaluacion(checklist, progreso = []) {

  const cont = document.getElementById("listaEvaluacion");
  cont.innerHTML = "";

  checklist.forEach((item, i) => {

    const nombre = item.Nombre || Object.values(item)[0];
    const estado = progreso[i] || {};

    const div = document.createElement("div");
    div.className = "item-evaluacion";

    div.innerHTML = `
      <div class="fila-check">

        <label class="check-nombre">
          <input type="checkbox" ${estado.checked ? "checked" : ""}>
          <span>${nombre}</span>
        </label>

        <label class="btn-foto">
          📷 Agregar foto
          <input type="file" accept="image/*" hidden>
        </label>

      </div>

      ${estado.img ? `<img src="${estado.img}" class="preview">` : ""}
    `;

    cont.appendChild(div);
  });
}


// 🔥 GUARDAR AVANCE
async function guardarAvanceEvaluacion() {

  const id = localStorage.getItem("otEvaluacion");

  let ordenes = JSON.parse(localStorage.getItem("ordenes")) || [];
  let ot = ordenes.find(o => o.id == id);

  const items = document.querySelectorAll("#listaEvaluacion .item-evaluacion");

  let progreso = [];

  for (let i = 0; i < items.length; i++) {

    const check = items[i].querySelector("input[type=checkbox]");
    const fileInput = items[i].querySelector("input[type=file]");

    let img = null;

    if (fileInput.files[0]) {
      img = await convertirBase64(fileInput.files[0]);
    } else if (ot.evaluacion.progreso[i]) {
      img = ot.evaluacion.progreso[i].img;
    }

    progreso.push({
      checked: check.checked,
      img
    });
  }

  ot.evaluacion.progreso = progreso;

  // 🔥 eliminar evaluaciones anteriores
  ot.registros = ot.registros.filter(r => r.tipo !== "evaluacion");

  // 🔥 guardar nuevo avance
  ot.registros.push({
    id: Date.now(),
    fecha: new Date().toLocaleDateString(),
    tecnico: "Evaluación (avance)",
    descripcion: "🟡 Evaluación en progreso",
    tipo: "evaluacion",
    checklist: ot.evaluacion.checklist,
    progreso: progreso
  });

  localStorage.setItem("ordenes", JSON.stringify(ordenes));

  alert("Avance guardado");

  window.location.href = `detalle.html?id=${id}`;
}


// 🔥 FINALIZAR EVALUACIÓN
function finalizarEvaluacion() {

  const id = localStorage.getItem("otEvaluacion");

  let ordenes = JSON.parse(localStorage.getItem("ordenes")) || [];
  let ot = ordenes.find(o => o.id == id);

  if (!ot || !ot.evaluacion || !ot.evaluacion.progreso) {
    alert("No hay evaluación");
    return;
  }

  const incompleto = ot.evaluacion.progreso.some(item => !item.img);

  if (incompleto) {
    alert("Debes completar toda la evaluación con evidencia");
    return;
  }

  ot.registros = ot.registros.filter(r => r.tipo !== "evaluacion");

  ot.registros.push({
    id: Date.now(),
    fecha: new Date().toLocaleDateString(),
    tecnico: "Evaluación",
    descripcion: "📋 Evaluación completada",
    tipo: "evaluacion",
    checklist: ot.evaluacion.checklist,
    progreso: ot.evaluacion.progreso
  });

  ot.bloqueada = true;
  ot.estado = "Espera Aprobación";

  localStorage.setItem("ordenes", JSON.stringify(ordenes));

  alert("Evaluación completada");

  window.location.href = `detalle.html?id=${id}`;
}


// 🔥 CERRAR
function cerrarEvaluacion() {
  document.getElementById("modalEvaluacion").style.display = "none";
}


// 🔥 UTILIDAD
function convertirBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}


// 🔥 HACER FUNCIONES GLOBALES (CLAVE)
window.abrirEvaluacion = abrirEvaluacion;
window.siguienteEvaluacion = siguienteEvaluacion;
window.guardarAvanceEvaluacion = guardarAvanceEvaluacion;
window.finalizarEvaluacion = finalizarEvaluacion;
window.cerrarEvaluacion = cerrarEvaluacion;