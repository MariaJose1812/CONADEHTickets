export function requireAuth(rolPermitido) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    window.location.href = "/auth/login.html";
    return;
  }

  if (rolPermitido && user.rol !== rolPermitido) {
    alert("No tienes permisos");
    window.location.href = "/tickets/crear-ticket.html";
  }
}