// 🔥 ABRIR OVERHAUL
function abrirOverhaul(id) {

  localStorage.setItem("otOverhaul", id);

  let ordenes = JSON.parse(localStorage.getItem("ordenes")) || [];
  let ot = ordenes.find(o => o.id == id);

  if (!ot) {
    alert("OT no encontrada");
    return;
  }

  // 🔥 asegurar estructura
  if (!ot.overhaul) {
    ot.overhaul = {
      checklist: [],
      progreso: []
    };
  }

  document.getElementById("modalOverhaul").style.display = "flex";

  const tieneChecklist = ot.overhaul.checklist?.length > 0;
  const tieneProgreso = ot.overhaul.progreso?.length > 0;

  // 🔥 CONTINUAR SI YA EXISTE
  if (tieneChecklist || tieneProgreso) {

    renderOverhaul(
      ot.overhaul.checklist,
      ot.overhaul.progreso
    );

    document.getElementById("overPaso1").style.display = "none";
    document.getElementById("overPaso2").style.display = "none";
    document.getElementById("overPaso3").style.display = "block";

  } else {
    // 🔥 PRIMER INGRESO
    document.getElementById("overPaso1").style.display = "block";
    document.getElementById("overPaso2").style.display = "none";
    document.getElementById("overPaso3").style.display = "none";
  }
}

// 🔥 SIGUIENTE PASO
async function siguienteOverhaul(paso) {

  const id = localStorage.getItem("otOverhaul");

  let ordenes = JSON.parse(localStorage.getItem("ordenes")) || [];
  let ot = ordenes.find(o => o.id == id);

  // PASO 1 → cargar checklist
  if (paso === 1) {

    const file = document.getElementById("excelOverhaul").files[0];

    if (!file) {
      alert("Debes cargar el checklist");
      return;
    }

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);

    const hoja = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(hoja);

    if (!ot.overhaul) {
      ot.overhaul = { checklist: [], progreso: [] };
    }

    ot.overhaul.checklist = json;

    localStorage.setItem("ordenes", JSON.stringify(ordenes));

    document.getElementById("overPaso1").style.display = "none";
    document.getElementById("overPaso2").style.display = "block";
  }

  // PASO 2 → ir a checklist
  if (paso === 2) {

    renderOverhaul(
      ot.overhaul.checklist,
      ot.overhaul.progreso || []
    );

    document.getElementById("overPaso2").style.display = "none";
    document.getElementById("overPaso3").style.display = "block";
  }
}

// 🔥 VOLVER
function volverOverhaul(paso) {

  if (paso === 2) {
    document.getElementById("overPaso2").style.display = "none";
    document.getElementById("overPaso1").style.display = "block";
  }

  if (paso === 3) {
    document.getElementById("overPaso3").style.display = "none";
    document.getElementById("overPaso2").style.display = "block";
  }
}

// 🔥 RENDER CHECKLIST
function renderOverhaul(checklist, progreso = []) {

  const cont = document.getElementById("listaOverhaul");
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
          📷 Evidencia
          <input type="file" data-index="${i}" accept="image/*" hidden>
        </label>

      </div>

      ${estado.img ? `<img src="${estado.img}" class="preview">` : ""}
    `;

    cont.appendChild(div);
  });
}

// 🔥 GUARDAR OVERHAUL
async function guardarOverhaul() {

  const id = localStorage.getItem("otOverhaul");

  let ordenes = JSON.parse(localStorage.getItem("ordenes")) || [];
  let ot = ordenes.find(o => o.id == id);

  const items = document.querySelectorAll("#listaOverhaul .item-evaluacion");

  let progreso = [];

  for (let i = 0; i < items.length; i++) {

    const check = items[i].querySelector("input[type=checkbox]");
    const fileInput = items[i].querySelector("input[type=file]");

    let img = null;

    if (fileInput.files[0]) {
      img = await convertirBase64(fileInput.files[0]);
    } else if (ot.overhaul.progreso?.[i]) {
      img = ot.overhaul.progreso[i].img;
    }

    progreso.push({
      checked: check.checked,
      img
    });
  }

  ot.overhaul.progreso = progreso;

  // 🔥 REGISTRO BITÁCORA
  ot.registros.push({
    id: Date.now(),
    fecha: new Date().toLocaleDateString(),
    tecnico: document.getElementById("tecnicoOverhaul").value,
    descripcion: document.getElementById("comentarioOverhaul").value,
    imagenes: [],
    tipo: "overhaul",
    checklist: ot.overhaul.checklist,
    progreso: progreso
  });

  localStorage.setItem("ordenes", JSON.stringify(ordenes));

  alert("Overhaul guardado");

  window.location.href = `detalle.html?id=${id}`;
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

// 🔥 EXPORTAR FUNCIONES
window.abrirOverhaul = abrirOverhaul;
window.siguienteOverhaul = siguienteOverhaul;
window.volverOverhaul = volverOverhaul;
window.guardarOverhaul = guardarOverhaul;