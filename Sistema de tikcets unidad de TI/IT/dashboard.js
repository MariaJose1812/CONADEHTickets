document.addEventListener('DOMContentLoaded', function() {
  cargarTickets();
  ActivarBusqueda();
});

async function cargarTickets() {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:3000/api/tickets", {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error("Error al obtener tickets");

    const data = await response.json();
    mostrarTickets(data.tickets);

  } catch (error) {
    console.error("X Error:", error);
    document.getElementById("tickets-container").innerHTML = "<p>Error de conexión con el servidor.</p>";
  }
}

function mostrarTickets(tickets) {
  const container = document.getElementById("tickets-container");
  container.innerHTML = "";

  if (!tickets || tickets.length === 0) {
    container.innerHTML = "<p>No hay tickets registrados.</p>";
    return;
  }

  tickets.forEach(ticket => {
    const card = document.createElement("div");
    card.className = "ticket-card";

    // Asignar color según estado
    let estadoClass = "";
    if(ticket.Estado === 'Abierto') estadoClass = "status-open";
    else if(ticket.Estado === 'En Proceso') estadoClass = "status-inprogress";
    else if(ticket.Estado === 'Terminado') estadoClass = "status-closed";
    else estadoClass = "status-pending";

    
    const fecha = new Date(ticket.FechaCreacion).toLocaleDateString("es-ES", {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit'
    });

    
    card.innerHTML = `
      <div class="card-header">
         <h3>Ticket #${ticket.IdTicket}</h3>
         <span class="badge ${estadoClass}">${ticket.Estado}</span>
      </div>
      <div class="card-body">
         <p><strong><i class="fa-solid fa-building"></i> Dept:</strong> ${ticket.NomDep}</p>
         <p><strong><i class="fa-solid fa-user"></i> De:</strong> ${ticket.NombreContacto}</p>
         <p><strong><i class="fa-solid fa-envelope"></i></strong> ${ticket.CorreoContacto}</p>
         <hr>
         <p class="desc">"${ticket.DescripcionProblema}"</p>
      </div>
      <div class="card-footer">
         <small>${fecha}</small>
         <button class="btn-ver">Ver detalles</button>
      </div>
    `;
    container.appendChild(card);
  });
}

function ActivarBusqueda() {
  const input = document.getElementById("search-ticket");
  
  input.addEventListener("keyup", function() {
    const texto = input.value.toLowerCase();
    const tarjetas = document.querySelectorAll(".ticket-card");
    
    tarjetas.forEach(function(tarjeta) {
      const contenido = tarjeta.innerText.toLowerCase();
      tarjeta.style.display = contenido.includes(texto) ? "flex" : "none";
    });
  });
}