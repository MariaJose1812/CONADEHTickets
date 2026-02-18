const API_URL = "http://localhost:3000";
let isSubmitting = false;

/* === Alerta reutilizable (SweetAlert2 si existe, si no usa alert) === */
function mostrarError(titulo, mensaje, onAceptar) {
  const msg = mensaje || "Error desconocido";

  // Si SweetAlert2 está cargado, úsalo
  if (typeof Swal !== "undefined" && Swal.fire) {
    return Swal.fire({
      icon: "error",
      title: titulo,
      text: msg,
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#0f766e",
      allowOutsideClick: false,

      // Me evita el salto del fondo
      heightAuto: false,
      scrollbarPadding: false,

      customClass: { popup: "border-radius-16" },
    }).then(() => {
      if (typeof onAceptar === "function") onAceptar();
    });
  }

  // Fallback si Swal no existe
  alert(`${titulo}\n\n${msg}`);
  if (typeof onAceptar === "function") onAceptar();
  return Promise.resolve();
}

/*  LOGIN  */
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (isSubmitting) return;
  isSubmitting = true;

  const btnSubmit = e.target.querySelector("button[type='submit']");
  const textoOriginal = btnSubmit?.innerHTML || "INGRESAR";

  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
  }

  const correoEl = document.getElementById("correo");
  const passEl = document.getElementById("password");

  try {
    const correo = correoEl?.value?.trim() || "";
    const password = passEl?.value || "";

    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Si el backend no manda JSON con error
      throw { error: data?.error || "Credenciales inválidas" };
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

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
    await mostrarError(
      "Credenciales inválidas",
      err?.error || "Verifique su correo y contraseña",
      () => {
        if (correoEl) correoEl.value = "";
        if (passEl) passEl.value = "";
        correoEl?.focus();
      },
    );
  } finally {
    isSubmitting = false;
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = textoOriginal;
    }
  }
});

/*  REGISTRO  */
document
  .getElementById("registerForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;

    const btnSubmit = e.target.querySelector("button[type='submit']");
    const textoOriginal = btnSubmit?.innerHTML || "REGISTRAR";

    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';
    }

    const nombreEl = document.getElementById("nombre");
    const correoEl = document.getElementById("correo");
    const passEl = document.getElementById("password");
    const codigoEl = document.getElementById("codigoSoporte");

    try {
      const payload = {
        nombre: nombreEl?.value?.trim() || "",
        correo: correoEl?.value?.trim() || "",
        password: passEl?.value || "",
        codigoSoporte: codigoEl?.value?.trim() || "",
      };

      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw { error: data?.error || "No se pudo completar el registro" };
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setTimeout(() => {
        if (data.user?.rol === "SOPORTE") {
          window.location.href = "../IT/dashboard.html";
        } else {
          window.location.href = "../tickets/entrada.html";
        }
      }, 200);
    } catch (err) {
      await mostrarError(
        "Correo ya registrado",
        err?.error || "No se pudo completar el registro",
        () => {
          // para que lo borre el correo;
          if (correoEl) correoEl.value = "";
          correoEl?.focus();
        },
      );
    } finally {
      isSubmitting = false;
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = textoOriginal;
      }
    }
  });
