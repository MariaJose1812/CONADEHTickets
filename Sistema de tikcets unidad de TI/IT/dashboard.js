import { apiFetch } from "../utils/api.js";

async function cargarTickets() {
  const data = await apiFetch("/api/tickets");

  
}

async function cambiarEstado(idTicket, estado) {
  await apiFetch(`/api/tickets/${idTicket}/estado`, {
    method: "PUT",
    body: JSON.stringify({ nuevoEstado: estado })
  });

  cargarTickets();
}
