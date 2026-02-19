const API_URL = "http://localhost:3000";
let isSubmitting = false;

function mostrarError(titulo, mensaje, onAceptar) {
  const msg = mensaje || "Error desconocido";

  if (typeof Swal !== "undefined" && Swal.fire) {
    return Swal.fire({
      icon: "error",
      title: titulo,
      text: msg,
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#0f766e",
      allowOutsideClick: false,
      heightAuto: false,
      scrollbarPadding: false,
      customClass: { popup: "border-radius-16" },
    }).then(() => {
      if (typeof onAceptar === "function") onAceptar();
    });
  }

  alert(`${titulo}\n\n${msg}`);
  if (typeof onAceptar === "function") onAceptar();
  return Promise.resolve();
}

/* ===================== LOGIN ===================== */
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
  const codigoEl = document.getElementById("codigoSoporte");

  try {
    const correo = correoEl?.value?.trim() || "";
    const password = passEl?.value || "";
    const codigoSoporte = codigoEl?.value?.trim() || "";

    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, password, codigoSoporte }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw { error: data?.error || "Credenciales inválidas" };
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setTimeout(() => {
      if (
        String(data.user?.rol || "")
          .trim()
          .toUpperCase() === "SOPORTE"
      ) {
        window.location.href = "../IT/dashboard.html";
      } else {
        window.location.href = "../tickets/entrada.html";
      }
    }, 200);
  } catch (err) {
    const msg = err?.error || "Verifique su correo y contraseña";
    const lower = msg.toLowerCase();

    const esCodigo =
      lower.includes("código") ||
      lower.includes("soporte") ||
      lower.includes("debe ingresar");

    await mostrarError(
      esCodigo ? "Código inválido" : "Credenciales inválidas",
      msg,
      () => {
        if (esCodigo) {
          if (passEl) passEl.value = "";
          if (codigoEl) codigoEl.value = "";
          codigoEl?.focus();
        } else {
          if (correoEl) correoEl.value = "";
          if (passEl) passEl.value = "";
          correoEl?.focus();
        }
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

/* ===================== REGISTRO ===================== */
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
        if (
          String(data.user?.rol || "")
            .trim()
            .toUpperCase() === "SOPORTE"
        ) {
          window.location.href = "../IT/dashboard.html";
        } else {
          window.location.href = "../tickets/entrada.html";
        }
      }, 200);
    } catch (err) {
      const msg = err?.error || "No se pudo completar el registro";
      const lower = msg.toLowerCase();

      const esCodigo = lower.includes("código");
      const esCorreo = lower.includes("correo") || lower.includes("registrado");

      await mostrarError(
        esCodigo
          ? "Código inválido"
          : esCorreo
            ? "Correo ya registrado"
            : "Error de registro",
        msg,
        () => {
          if (passEl) passEl.value = "";

          if (esCodigo) {
            if (codigoEl) codigoEl.value = "";
            codigoEl?.focus();
            return;
          }

          if (esCorreo) {
            if (correoEl) correoEl.value = "";
            correoEl?.focus();
            return;
          }

          nombreEl?.focus();
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
