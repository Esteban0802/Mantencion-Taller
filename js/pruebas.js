// 🔵 ABRIR
function abrirPruebas(id) {

  localStorage.setItem("otPruebas", id);

  let ordenes = JSON.parse(localStorage.getItem("ordenes")) || [];
  let ot = ordenes.find(o => o.id == id);

  document.getElementById("modalPruebas").style.display = "flex";

  const tieneDatos =
    ot.pruebas?.mecanico?.checklist?.length > 0 ||
    ot.pruebas?.electrico?.checklist?.length > 0;

  if (tieneDatos) {

    renderPruebas("listaMecanico", ot.pruebas.mecanico);
    renderPruebas("listaElectrico", ot.pruebas.electrico);

    document.getElementById("pruebaPaso1").style.display = "none";
    document.getElementById("pruebaPaso2").style.display = "block";

  } else {
    document.getElementById("pruebaPaso1").style.display = "block";
    document.getElementById("pruebaPaso2").style.display = "none";
  }
}

// 🔵 LEER EXCEL
async function leerExcel(file) {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const hoja = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(hoja);
}

// 🔵 SIGUIENTE
async function siguientePruebas() {

  const fileM = document.getElementById("excelMecanico").files[0];
  const fileE = document.getElementById("excelElectrico").files[0];

  if (!fileM || !fileE) {
    alert("Debes cargar ambos checklists");
    return;
  }

  const checklistM = await leerExcel(fileM);
  const checklistE = await leerExcel(fileE);

  const id = localStorage.getItem("otPruebas");

  let ordenes = JSON.parse(localStorage.getItem("ordenes")) || [];
  let ot = ordenes.find(o => o.id == id);

  ot.pruebas = {
    mecanico: { checklist: checklistM, progreso: [] },
    electrico: { checklist: checklistE, progreso: [] }
  };

  localStorage.setItem("ordenes", JSON.stringify(ordenes));

  abrirPruebas(id);
}

// 🔵 RENDER
function renderPruebas(contenedorId, data) {

  const cont = document.getElementById(contenedorId);
  cont.innerHTML = "";

  data.checklist.forEach((item, i) => {

    const nombre = item.Nombre || Object.values(item)[0];
    const estado = data.progreso[i] || {};

    const div = document.createElement("div");
    div.className = "item-prueba";

    div.innerHTML = `
      <div class="fila-check">

        <label class="check-nombre">
          <input type="checkbox" ${estado.checked ? "checked" : ""}>
          <span>${nombre}</span>
        </label>

        <label class="btn-foto">
          📷 Foto
          <input type="file" data-index="${i}" hidden accept="image/*">
        </label>

      </div>

      ${estado.img ? `<img src="${estado.img}" class="preview">` : ""}
    `;

    cont.appendChild(div);
  });
}

// 🔵 GUARDAR AVANCE
async function guardarAvancePruebas() {

  const id = localStorage.getItem("otPruebas");

  let ordenes = JSON.parse(localStorage.getItem("ordenes")) || [];
  let ot = ordenes.find(o => o.id == id);

  async function procesar(selector, dataActual) {

    const items = document.querySelectorAll(selector);

    let progreso = [];

    for (let i = 0; i < items.length; i++) {

      const check = items[i].querySelector("input[type=checkbox]");
      const file = items[i].querySelector("input[type=file]");

      let img = null;

      if (file.files[0]) {
        img = await convertirBase64(file.files[0]);
      } else if (dataActual.progreso[i]) {
        img = dataActual.progreso[i].img;
      }

      progreso.push({
        checked: check.checked,
        img
      });
    }

    return progreso;
  }

  ot.pruebas.mecanico.progreso =
    await procesar("#listaMecanico .item-prueba", ot.pruebas.mecanico);

  ot.pruebas.electrico.progreso =
    await procesar("#listaElectrico .item-prueba", ot.pruebas.electrico);

  localStorage.setItem("ordenes", JSON.stringify(ordenes));

  alert("Avance guardado");
}

// 🔵 FINALIZAR
function finalizarPruebas() {

  const id = localStorage.getItem("otPruebas");

  let ordenes = JSON.parse(localStorage.getItem("ordenes")) || [];
  let ot = ordenes.find(o => o.id == id);

  const incompletoM = ot.pruebas.mecanico.progreso.some(i => !i.checked || !i.img);
  const incompletoE = ot.pruebas.electrico.progreso.some(i => !i.checked || !i.img);

  if (incompletoM || incompletoE) {
    alert("Debes completar todo (check + foto)");
    return;
  }

  ot.estado = "Despacho";

  ot.registros.push({
    id: Date.now(),
    fecha: new Date().toLocaleDateString(),
    tecnico: "Pruebas",
    descripcion: "🔵 Pruebas completadas",
    tipo: "pruebas",
    mecanico: ot.pruebas.mecanico,
    electrico: ot.pruebas.electrico
  });

  localStorage.setItem("ordenes", JSON.stringify(ordenes));

  alert("Pruebas finalizadas");

  cerrarModalPorId("modalPruebas");
}

// 🔵 UTILIDAD
function convertirBase64(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
  });
}

// 🔥 EXPORTAR (IMPORTANTE)
window.abrirPruebas = abrirPruebas;
window.guardarAvancePruebas = guardarAvancePruebas;
window.finalizarPruebas = finalizarPruebas;
window.siguientePruebas = siguientePruebas;