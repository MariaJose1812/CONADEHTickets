const API_URL = "http://localhost:3000";
let isSubmitting = false;

// LOGIN
document.getElementById("loginForm")?.addEventListener("submit", async e => {
  e.preventDefault();

  if (isSubmitting) return;
  isSubmitting = true;

  const btnSubmit = e.target.querySelector("button[type='submit']");
  const textoOriginal = btnSubmit.innerHTML;

  // BLOQUEO INMEDIATO 
  if (btnSubmit.disabled) return; 
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

  const correo = document.getElementById("correo").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, password })
    });

    const data = await res.json();
    if (!res.ok) throw data;

    // Guardar sesión
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user)); 

    // Redirección por rol 
    setTimeout(() => {
    if (data.user.rol === "SOPORTE") {
      console.log("Redirigiendo a dashboard de IT");
      window.location.href = "../IT/dashboard.html"; 
    } else {
      console.log("Redirigiendo a entrada de tickets");
      window.location.href = "../tickets/entrada.html"; 
    }
  }, 500);

  } catch (err) {
    alert(err.error || "Error al iniciar sesión");
  }
});

// REGISTRO
document.getElementById("registerForm")?.addEventListener("submit", async e => {
  e.preventDefault();

  if (isSubmitting) return;
  isSubmitting = true;

  const btnSubmit = e.target.querySelector("button[type='submit']");
  const textoOriginal = btnSubmit.innerHTML;

  // BLOQUEO INMEDIATO 
  if (btnSubmit.disabled) return; 
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

  const nombre = document.getElementById("nombre").value;
  const correo = document.getElementById("correo").value;
  const password = document.getElementById("password").value;
  const codigoSoporte = document.getElementById("codigoSoporte")?.value || "";

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, correo, password, codigoSoporte })
    });

    const data = await res.json();
    console.log("RESPUESTA DEL SERVIDOR:", data);
    if (!res.ok) throw data;

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Pequeña pausa de seguridad antes de saltar
    setTimeout(() => {
    if (data.user.rol === "SOPORTE") {
        window.location.href = "../IT/dashboard.html";
    } else {
        window.location.href = "../tickets/entrada.html";
    }
  }, 500);
  

  } catch (err) {
    console.error("Error:", err);
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = textoOriginal;
    alert(err.error || "Error al registrarse");
  }
});