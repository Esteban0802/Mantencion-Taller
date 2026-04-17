const btnLogin = document.getElementById("btnLogin");
const mensaje = document.getElementById("mensaje");

btnLogin.addEventListener("click", function () {
  
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Validación básica
  if (email === "" || password === "") {
    mensaje.textContent = "Completa todos los campos";
    mensaje.style.color = "red";
    return;
  }

  // Simulación de login (temporal)
  if (email === "admin@test.com" && password === "123456") {
    mensaje.textContent = "Ingreso correcto";
    mensaje.style.color = "lightgreen";

    // Simular redirección
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);

  } else {
    mensaje.textContent = "Credenciales incorrectas";
    mensaje.style.color = "red";
  }

});