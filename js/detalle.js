const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const ordenes = JSON.parse(localStorage.getItem("ordenes")) || [];

// 🔍 Buscar OT
const ot = ordenes.find(o => o.id == id);

console.log("OT completa:", ot);

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

// 🔹 Abrir modal registro
document.getElementById("btnRegistro").addEventListener("click", () => {
  document.getElementById("modal").style.display = "flex";
  cargarRepuestosOT(); // 🔥 clave
});

function cerrarModal() {
  document.getElementById("modal").style.display = "none";
}

// 🔹 VISOR IMAGEN
const visor = document.getElementById("visor");
const imgGrande = document.getElementById("imgGrande");

document.addEventListener("click", function(e) {
  if (e.target.classList.contains("foto")) {
    visor.style.display = "flex";
    imgGrande.src = e.target.src;
  }
});

visor.addEventListener("click", function(e) {
  if (e.target === visor) {
    visor.style.display = "none";
  }
});

// 🔹 Guardar registro
async function guardarRegistro() {

  const tecnico = document.getElementById("tecnico").value;
  const descripcion = document.getElementById("descripcion").value;

  if (!tecnico || !descripcion) {
    alert("Completa los campos");
    return;
  }

  const fileInput = document.getElementById("foto");
  let imagenes = [];

  if (fileInput.files.length > 0) {
    for (let file of fileInput.files) {
      const base64 = await convertirBase64(file);
      imagenes.push(base64);
    }
  }

  // 🔥 REPUESTOS SELECCIONADOS
  const checkboxes = document.querySelectorAll("#listaRepuestos input:checked");

  let repuestosUsados = [];
  checkboxes.forEach(cb => {
    repuestosUsados.push(cb.value);
  });

  const nuevoRegistro = {
    id: Date.now(),
    fecha: new Date().toLocaleDateString(),
    tecnico,
    descripcion,
    imagenes,
    repuestos: repuestosUsados
  };

  ot.registros.push(nuevoRegistro);

  // 🔄 estado automático
  if (ot.estado === "Ingreso") {
  ot.estado = "Evaluación";
}

  localStorage.setItem("ordenes", JSON.stringify(ordenes));

  renderBitacora();
  cerrarModal();
}

// 🔹 Convertir imagen
function convertirBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

// 🔹 Render bitácora
function renderBitacora() {
  const contenedor = document.getElementById("bitacora");
  contenedor.innerHTML = "";

  ot.registros.forEach((reg, i) => {

    let claseExtra = "";

        if (reg.tipo === "entrega") {
        claseExtra = "registro-entrega";
        }

        if (reg.tipo === "ingreso") {
        claseExtra = "registro-ingreso";
        }

    const imagenesHTML = reg.imagenes
      ? reg.imagenes.map((img, index) => `
        <div class="foto-container">
          <img src="${img}" class="foto">
          <button class="btn-eliminar" onclick="eliminarFoto(${index}, ${i})">✖</button>
        </div>
      `).join("")
      : "";

      let checklistHTML = "";

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

    // 🔥 REPUESTOS
    const repuestosHTML = reg.repuestos && reg.repuestos.length > 0
      ? `<p><strong>Repuestos usados:</strong> ${reg.repuestos.join(", ")}</p>`
      : "";

    const div = document.createElement("div");
    div.className = "registro " + claseExtra;

    div.innerHTML = `
  <p><strong>${reg.fecha}</strong> - ${reg.tecnico}</p>
  <p>${reg.descripcion}</p>

  ${checklistHTML} <!-- 🔥 AQUÍ -->

  <div class="galeria">${imagenesHTML}</div>
`;

    contenedor.appendChild(div);
  });
}

// 🔹 Eliminar foto
function eliminarFoto(index, registroIndex) {
  const registro = ot.registros[registroIndex];
  if (!registro) return;

  registro.imagenes.splice(index, 1);

  localStorage.setItem("ordenes", JSON.stringify(ordenes));
  renderBitacora();
}

// 🔹 ENTREGAR OT
function entregarOT() {
      alert("Función en actualización");

  /*if (!ot.registros || ot.registros.length === 0) {
    alert("Debes registrar trabajo antes de entregar la OT");
    return;
  }

  const tieneFotos = ot.registros.some(reg => 
    reg.imagenes && reg.imagenes.length > 0
  );

  if (!tieneFotos) {
    alert("Debes adjuntar al menos una foto");
    return;
  }

  const confirmar = confirm("¿Seguro que deseas marcar como ENTREGADO?");
  if (!confirmar) return;

  ot.estado = "Entregado";

  localStorage.setItem("ordenes", JSON.stringify(ordenes));
  document.getElementById("estado").textContent = ot.estado; */
}

// 🔹 FINALIZAR OT
function finalizarOT() {
    alert("Función en actualización");
 /* if (!ot.registros || ot.registros.length === 0) {
    alert("Debes registrar trabajo antes de finalizar");
    return;
  }

  if (ot.estado !== "Entregado") {
    alert("Debes completar la ENTREGA antes de finalizar");
    return;
  }

  const confirmar = confirm("¿Seguro?");
  if (!confirmar) return;

  ot.estado = "Terminado";

  localStorage.setItem("ordenes", JSON.stringify(ordenes));
  document.getElementById("estado").textContent = ot.estado; */
}

// 🔹 CARGAR REPUESTOS EN MODAL
function cargarRepuestosOT() {
  const contenedor = document.getElementById("listaRepuestos");

  if (!contenedor) {
    console.log("No existe listaRepuestos");
    return;
  }

  contenedor.innerHTML = "";

  if (!ot.repuestos || ot.repuestos.length === 0) {
    contenedor.innerHTML = "<p>No hay repuestos cargados</p>";
    return;
  }

  ot.repuestos.forEach((rep) => {

    const nombre = rep.Nombre || rep.nombre || Object.values(rep)[0];

    const item = document.createElement("div");
    item.className = "item-repuesto";

    item.innerHTML = `
      <input type="checkbox" value="${nombre}">
      <span>${nombre}</span>
    `;

    contenedor.appendChild(item);
  });
}

// 🔹 navegación
function irDashboard() {
  window.location.href = "dashboard.html";
}

function irOT() {
  window.location.href = "ordenes.html";
}

function logout() {
  window.location.href = "index.html";
}

// 🔥 iniciar
renderBitacora();