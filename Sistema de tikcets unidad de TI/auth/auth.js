const API_URL = "http://localhost:3000";

// LOGIN
document.getElementById("loginForm")?.addEventListener("submit", async e => {
  e.preventDefault();
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
    if (data.user.rol === "SOPORTE") {
      window.location.href = "../IT/dashboard.html"; 
    } else {
      window.location.href = "../tickets/entrada.html"; 
    }

  } catch (err) {
    alert(err.error || "Error al iniciar sesión");
  }
});

// REGISTRO
document.getElementById("registerForm")?.addEventListener("submit", async e => {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value;
  const correo = document.getElementById("correo").value;
  const password = document.getElementById("password").value;
  const codigoSoporte = document.getElementById("codigoSoporte")?.value || "IT_Cndh-2026";

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, correo, password, codigoSoporte })
    });

    const data = await res.json();
    if (!res.ok) throw data;

    window.location.href = "../tickets/entrada.html";

  } catch (err) {
    alert(err.error || "Error al registrarse");
  }
});