function cargarDashboard() {

  const ordenes = JSON.parse(localStorage.getItem("ordenes")) || [];

  // 🔢 CONTADORES
  let total = ordenes.length;

  let ingreso = 0;
  let reparacion = 0;
  let entregado = 0;
  let terminado = 0;
  document.getElementById("cardTotal").textContent = total;

  

  ordenes.forEach(ot => {
    if (ot.estado === "Ingreso") ingreso++;
    if (ot.estado === "En reparación") reparacion++;
    if (ot.estado === "Entregado") entregado++;
    if (ot.estado === "Terminado") terminado++;
  });

  document.getElementById("cardIngreso").textContent = ingreso;
  document.getElementById("cardReparacion").textContent = reparacion;
  document.getElementById("cardEntregado").textContent = entregado;
  document.getElementById("cardTerminado").textContent = terminado;


  // 📋 TABLA
  const tabla = document.getElementById("tablaOT");

  // 🔥 LIMPIAR TABLA (CLAVE)
  tabla.innerHTML = "";

  ordenes.forEach(ot => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${ot.id}</td>
      <td>${ot.maquina}</td>
      <td>${ot.estado}</td>
      <td>${ot.fecha || "-"}</td>
      <td>
        <button onclick="event.stopPropagation(); eliminarOT('${ot.id}')">
        🗑️
      </td>
    `;

    tabla.appendChild(fila);
  });

}

function eliminarOT(id) {

  // 🔴 Primera confirmación
  const confirmar1 = confirm(`¿Eliminar la OS ${id}?`);
  if (!confirmar1) return;

  // 🔴 Segunda confirmación (seguridad)
  const confirmar2 = confirm("⚠️ Esta acción es irreversible. ¿Seguro?");
  if (!confirmar2) return;

  // 🔥 Eliminar
  let ordenes = JSON.parse(localStorage.getItem("ordenes")) || [];

  ordenes = ordenes.filter(ot => ot.id !== id);

  localStorage.setItem("ordenes", JSON.stringify(ordenes));

  // 🔄 Recargar dashboard
  cargarDashboard();

  alert("OS eliminada correctamente");
}

function verTodas() {
  localStorage.removeItem("filtroEstado"); // 🔥 elimina filtro
  window.location.href = "ordenes.html";
}

function filtrarEstado(estado) {
  localStorage.setItem("filtroEstado", estado);
  window.location.href = "ordenes.html";
}



document.getElementById("btnOT").addEventListener("click", () => {
  localStorage.removeItem("filtroEstado"); // 🔥 limpiar filtro
  window.location.href = "ordenes.html";
});

document.getElementById("logout").addEventListener("click", () => {
  window.location.href = "index.html";
});

// 🔥 cargar al abrir
cargarDashboard();

// 🔥 actualizar al volver a la pestaña
window.addEventListener("focus", cargarDashboard);