document.addEventListener("DOMContentLoaded", function () {
  cargarTickets();
  ActivarBusqueda();
});

/* estado*/
let ALL_TICKETS = [];
let FILTERED_TICKETS = [];

const PAGE_SIZE = 20;
let CURRENT_PAGE = 1;

/* cargar tickets */
async function cargarTickets() {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:3000/api/tickets", {
      method: "GET",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Error al obtener tickets");

    const data = await response.json();
    mostrarTickets(data.tickets);
  } catch (error) {
    console.error("X Error:", error);
    document.getElementById("tickets-container").innerHTML =
      "<p>Error de conexión con el servidor.</p>";
  }
}

function mostrarTickets(tickets) {
  ALL_TICKETS = tickets || [];
  FILTERED_TICKETS = [...ALL_TICKETS];
  CURRENT_PAGE = 1;

  renderTablaPaginada();
  renderPaginacion();
}

/*render 20 tablas */
function renderTablaPaginada() {
  const container = document.getElementById("tickets-container");
  container.innerHTML = "";

  if (!FILTERED_TICKETS.length) {
    container.innerHTML =
      "<p style='color:#64748b;margin:0;'>No hay tickets registrados.</p>";
    return;
  }

  const total = FILTERED_TICKETS.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (CURRENT_PAGE > totalPages) CURRENT_PAGE = totalPages;
  if (CURRENT_PAGE < 1) CURRENT_PAGE = 1;

  const start = (CURRENT_PAGE - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageItems = FILTERED_TICKETS.slice(start, end);

  const table = document.createElement("table");
  table.className = "ticket-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>N° de tickets</th>
        <th>Departamento</th>
        <th>Correo</th>
        <th>Estado</th>
        <th class="th-right">Acción</th>
      </tr>
    </thead>
    <tbody id="tickets-body"></tbody>
  `;

  container.appendChild(table);

  const tbody = document.getElementById("tickets-body");

  pageItems.forEach((ticket) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="ticket-id">#${ticket.IdTicket}</td>
      <td title="${safe(ticket.NomDep)}">${safe(ticket.NomDep)}</td>
      <td title="${safe(ticket.CorreoContacto)}">${safe(ticket.CorreoContacto)}</td>

      <td>
        <select class="estado-select ${estadoClase(ticket.Estado)}" data-id="${ticket.IdTicket}">
          <option value="Abierto" ${ticket.Estado === "Abierto" ? "selected" : ""}>Abierto</option>
          <option value="En Proceso" ${ticket.Estado === "En Proceso" ? "selected" : ""}>En Proceso</option>
          <option value="Terminado" ${ticket.Estado === "Terminado" ? "selected" : ""}>Terminado</option>
        </select>
      </td>

     <td class="td-right">
  <button class="btn-ver" type="button" data-id="${ticket.IdTicket}">
    Ver detalles
  </button>
</td>
    `;

    tbody.appendChild(tr);
  });

  activarCambioEstado();
  activarBotonVer();
}

/* Paginacion */
function renderPaginacion() {
  const container = document.getElementById("tickets-container");
  if (!FILTERED_TICKETS.length) return;

  const total = FILTERED_TICKETS.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  let pager = document.getElementById("pager");
  if (!pager) {
    pager = document.createElement("div");
    pager.id = "pager";

    pager.style.display = "flex";
    pager.style.justifyContent = "space-between";
    pager.style.alignItems = "center";
    pager.style.gap = "10px";
    pager.style.padding = "12px 6px 0 6px";
    pager.style.flexWrap = "wrap";

    container.appendChild(pager);
  } else {
    pager.innerHTML = "";
  }

  const start = (CURRENT_PAGE - 1) * PAGE_SIZE + 1;
  const end = Math.min(CURRENT_PAGE * PAGE_SIZE, total);

  const info = document.createElement("div");
  info.style.color = "#64748b";
  info.style.fontSize = "13px";
  info.textContent = `Mostrando ${start}-${end} de ${total}`;

  const controls = document.createElement("div");
  controls.style.display = "flex";
  controls.style.alignItems = "center";
  controls.style.gap = "6px";
  controls.style.flexWrap = "wrap";

  const prev = makePagerBtn("← Anterior", CURRENT_PAGE === 1, () => {
    CURRENT_PAGE--;
    renderTablaPaginada();
    renderPaginacion();
  });

  const next = makePagerBtn("Siguiente →", CURRENT_PAGE === totalPages, () => {
    CURRENT_PAGE++;
    renderTablaPaginada();
    renderPaginacion();
  });

  controls.appendChild(prev);

  // Ventana de páginas
  const windowSize = 5;
  let from = Math.max(1, CURRENT_PAGE - 2);
  let to = Math.min(totalPages, from + windowSize - 1);
  from = Math.max(1, to - windowSize + 1);

  for (let p = from; p <= to; p++) {
    const b = makePagerBtn(String(p), false, () => {
      CURRENT_PAGE = p;
      renderTablaPaginada();
      renderPaginacion();
    });

    if (p === CURRENT_PAGE) {
      b.style.background = "#0f766e";
      b.style.color = "white";
      b.style.borderColor = "#0f766e";
      b.style.fontWeight = "800";
    }

    controls.appendChild(b);
  }

  controls.appendChild(next);

  pager.appendChild(info);
  pager.appendChild(controls);
}

function makePagerBtn(text, disabled, onClick) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = text;
  b.disabled = disabled;

  b.style.border = "1px solid #e2e8f0";
  b.style.background = "white";
  b.style.padding = "8px 10px";
  b.style.borderRadius = "10px";
  b.style.cursor = disabled ? "not-allowed" : "pointer";
  b.style.fontSize = "13px";

  if (!disabled) b.addEventListener("click", onClick);
  return b;
}

/* cambio de estado */
function activarCambioEstado() {
  document.querySelectorAll(".estado-select").forEach((select) => {
    select.addEventListener("change", async function () {
      const nuevoEstado = this.value;
      const idTicket = this.dataset.id;

      // cambia color visual inmediato
      this.className = `estado-select ${estadoClase(nuevoEstado)}`;

      try {
        const token = localStorage.getItem("token");

        await fetch(`http://localhost:3000/api/tickets/${idTicket}/estado`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ Estado: nuevoEstado }),
        });

        // opcional: también actualizar en memoria (ALL_TICKETS y FILTERED_TICKETS)
        ALL_TICKETS = ALL_TICKETS.map((t) =>
          t.IdTicket === Number(idTicket) ? { ...t, Estado: nuevoEstado } : t,
        );
        FILTERED_TICKETS = FILTERED_TICKETS.map((t) =>
          t.IdTicket === Number(idTicket) ? { ...t, Estado: nuevoEstado } : t,
        );
      } catch (error) {
        alert("Error al actualizar el estado");
        console.error(error);
      }
    });
  });
}

/* Boton ver*/
function activarBotonVer() {
  document.querySelectorAll(".btn-ver").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      alert(`Ver detalles del Ticket #${id}`);
    });
  });
}

function ActivarBusqueda() {
  const input = document.getElementById("search-ticket");

  input.addEventListener("keyup", function () {
    const texto = input.value.toLowerCase().trim();

    FILTERED_TICKETS = ALL_TICKETS.filter((t) => {
      const contenido = [`#${t.IdTicket}`, t.NomDep, t.CorreoContacto, t.Estado]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return contenido.includes(texto);
    });

    CURRENT_PAGE = 1;
    renderTablaPaginada();
    renderPaginacion();
  });
}

function safe(v) {
  return v ?? "";
}

function estadoClase(estado) {
  const e = (estado || "").toLowerCase().trim();
  if (e === "abierto") return "estado-abierto";
  if (e === "en proceso") return "estado-en-proceso";
  if (e === "terminado") return "estado-terminado";
  return "estado-pendiente";
}
