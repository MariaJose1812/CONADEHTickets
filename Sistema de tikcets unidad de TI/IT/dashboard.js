document.addEventListener("DOMContentLoaded", function () {
  cargarTickets();
  ActivarBusqueda();
});

let ALL_TICKETS = [];
let FILTERED_TICKETS = [];
let TICKETS_BY_ID = new Map();

const PAGE_SIZE = 20;
let CURRENT_PAGE = 1;

let CURRENT_STATUS_FILTER = null; // "Abierto" | "En Proceso" | "Terminado" | null

// Para evitar duplicar eventos del modal
let MODAL_WIRED = false;

function normalizarEstado(e) {
  return String(e || "")
    .replace(/\s+/g, " ")
    .trim();
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

function formatearFechaHora(fechaISO) {
  if (!fechaISO) return "—";
  const d = new Date(fechaISO);
  if (isNaN(d.getTime())) return String(fechaISO);

  const fecha = d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const hora = d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${fecha} ${hora}`;
}

/* Tarjetas*/
function actualizarTarjetas() {
  const cA = ALL_TICKETS.filter(
    (t) => normalizarEstado(t.Estado) === "Abierto",
  ).length;
  const cP = ALL_TICKETS.filter(
    (t) => normalizarEstado(t.Estado) === "En Proceso",
  ).length;
  const cT = ALL_TICKETS.filter(
    (t) => normalizarEstado(t.Estado) === "Terminado",
  ).length;

  const elA = document.getElementById("count-abierto");
  const elP = document.getElementById("count-proceso");
  const elT = document.getElementById("count-terminado");

  if (elA) elA.textContent = cA;
  if (elP) elP.textContent = cP;
  if (elT) elT.textContent = cT;

  // resalto de tarjeta activa
  document.querySelectorAll(".status-card").forEach((card) => {
    const est = card.dataset.estado;
    card.classList.toggle("is-active", CURRENT_STATUS_FILTER === est);
  });
}

function aplicarFiltros(resetPage = true) {
  const input = document.getElementById("search-ticket");
  const texto = (input?.value || "").toLowerCase().trim();

  const base = CURRENT_STATUS_FILTER
    ? ALL_TICKETS.filter(
        (t) => normalizarEstado(t.Estado) === CURRENT_STATUS_FILTER,
      )
    : [...ALL_TICKETS];

  FILTERED_TICKETS = base.filter((t) => {
    const contenido = [`#${t.IdTicket}`, t.NomDep, t.CorreoContacto, t.Estado]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return contenido.includes(texto);
  });

  renderTablaPaginada();
  renderPaginacion();
}

function activarTarjetasEstado() {
  document.querySelectorAll(".status-card").forEach((card) => {
    card.addEventListener("click", () => {
      CURRENT_STATUS_FILTER = card.dataset.estado;
      actualizarTarjetas();
      aplicarFiltros();
    });
  });

  const btn = document.getElementById("btn-ver-todos");
  if (btn) {
    btn.addEventListener("click", () => {
      CURRENT_STATUS_FILTER = null;
      actualizarTarjetas();
      aplicarFiltros();
    });
  }
}

/* Carga Tickets */
async function cargarTickets() {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:3000/api/admin/tickets", {
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

  //  map para el modal
  TICKETS_BY_ID = new Map(ALL_TICKETS.map((t) => [Number(t.IdTicket), t]));

  FILTERED_TICKETS = [...ALL_TICKETS];
  CURRENT_PAGE = 1;

  activarTarjetasEstado();
  actualizarTarjetas();

  renderTablaPaginada();
  renderPaginacion();
}

/* Tabla Paginada */
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
    const estado = normalizarEstado(ticket.Estado);
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="ticket-id">#${ticket.IdTicket}</td>
      <td title="${safe(ticket.NomDep)}">${safe(ticket.NomDep)}</td>
      <td title="${safe(ticket.CorreoContacto)}">${safe(ticket.CorreoContacto)}</td>

      <td>
        <select class="estado-select ${estadoClase(estado)}" data-id="${ticket.IdTicket}">
          <option value="Abierto" ${estado === "Abierto" ? "selected" : ""}>Abierto</option>
          <option value="En Proceso" ${estado === "En Proceso" ? "selected" : ""}>En Proceso</option>
          <option value="Terminado" ${estado === "Terminado" ? "selected" : ""}>Terminado</option>
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

/* Cambio de estado */
function activarCambioEstado() {
  document.querySelectorAll(".estado-select").forEach((select) => {
    select.addEventListener("change", async function () {
      const nuevoEstado = this.value;
      const idTicket = this.dataset.id;

      this.className = `estado-select ${estadoClase(nuevoEstado)}`;

      try {
        const token = localStorage.getItem("token");

        const resp = await fetch(
          `http://localhost:3000/api/admin/tickets/${idTicket}/estado`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ nuevoEstado: nuevoEstado }),
          },
        );

        if (!resp.ok) {
          let msg = "No se pudo actualizar el estado";
          try {
            const err = await resp.json();
            msg = err.error || msg;
          } catch {}
          throw new Error(msg);
        }

        // actualizar en memoria
        ALL_TICKETS = ALL_TICKETS.map((t) =>
          t.IdTicket === Number(idTicket) ? { ...t, Estado: nuevoEstado } : t,
        );

        // actualizar map global
        TICKETS_BY_ID = new Map(
          ALL_TICKETS.map((t) => [Number(t.IdTicket), t]),
        );

        actualizarTarjetas();
        aplicarFiltros(false);
      } catch (error) {
        alert("Error al actualizar el estado");
        console.error(error);
      }
    });
  });
}

/* Modal ver detalles */
function activarBotonVer() {
  const modal = document.getElementById("modalDetalles");
  const overlay = document.getElementById("modalOverlay");
  const btnClose = document.getElementById("modalClose");
  const btnOk = document.getElementById("modalOk");

  if (!modal) return;

  const openModal = () => {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
  };

  if (!MODAL_WIRED) {
    MODAL_WIRED = true;

    overlay?.addEventListener("click", closeModal);
    btnClose?.addEventListener("click", closeModal);
    btnOk?.addEventListener("click", closeModal);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  // listeners para los botones de esta renderización
  document.querySelectorAll(".btn-ver").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const ticket = TICKETS_BY_ID.get(id);

      if (!ticket) {
        alert("No se encontró la información del ticket.");
        return;
      }

      document.getElementById("d-id").textContent = `#${ticket.IdTicket}`;
      document.getElementById("d-nombre").textContent =
        ticket.NombreContacto || "—";
      document.getElementById("d-desc").textContent =
        ticket.DescripcionProblema || "—";

      // estado con color
      const estado = (ticket.Estado || "").trim();
      const elEstado = document.getElementById("d-estado");
      elEstado.textContent = estado || "—";
      elEstado.className = "pill";

      const e = estado.toLowerCase();
      if (e === "abierto") elEstado.classList.add("abierto");
      else if (e === "en proceso") elEstado.classList.add("proceso");
      else if (e === "terminado") elEstado.classList.add("terminado");

      // fecha/hora
      document.getElementById("d-fecha").textContent = formatearFechaHora(
        ticket.FechaCreacion,
      );

      openModal();
    });
  });
}

/* Búsqueda */
function ActivarBusqueda() {
  const input = document.getElementById("search-ticket");
  if (!input) return;
  input.addEventListener("keyup", aplicarFiltros);
}
