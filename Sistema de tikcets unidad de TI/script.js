document.addEventListener("DOMContentLoaded", async function() {
  const formulario = document.getElementById("formularioTicket");
  const confirmacion = document.getElementById("confirmation");
  const deptSelect = document.getElementById("departamento");

  // Cargar departamentos al inicio
  await cargarDepartamentos();

  formulario.addEventListener("submit", async function(e) {
    e.preventDefault();

    // Generar número aleatorio para el ticket
    const numeroTicket = Math.floor(Math.random() * 1000000);

    const ticketData = {
      numeroTicket: numeroTicket,
      idDep: parseInt(document.getElementById("departamento").value),
      nombreContacto: document.getElementById("nombre").value,
      correoContacto: document.getElementById("correo").value,
      descripcionProblema: document.getElementById("descripcion").value,
    };

    // Validar campos
    if (!ticketData.idDep || !ticketData.nombreContacto || !ticketData.correoContacto || !ticketData.descripcionProblema) {
      alert("Por favor, complete todos los campos del formulario.");
      return;
    }

    try {
      // Enviar datos al backend
      console.log("Enviando ticket al backend:", ticketData);
      
      const response = await fetch("http://localhost:3000/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(ticketData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear el ticket");
      }

      const resultado = await response.json();
      console.log("✓ Respuesta del servidor:", resultado);

      // Mostrar confirmación con datos
      document.getElementById("ticketNumber").textContent = ticketData.numeroTicket;
      document.getElementById("ticketDepartamento").textContent = 
        deptSelect.options[deptSelect.selectedIndex].text;
      document.getElementById("ticketNombre").textContent = ticketData.nombreContacto;
        document.getElementById("ticketCorreo").textContent = ticketData.correoContacto;
      document.getElementById("ticketDescripcion").textContent = ticketData.descripcionProblema;

      // Ocultar formulario y mostrar confirmación
      document.getElementById("formTicket").classList.add("oculto");
      confirmacion.classList.remove("oculto");

      // Limpiar formulario
      formulario.reset();

      console.log("✓ Ticket creado exitosamente:", resultado.ticket);

    } catch (error) {
      console.error("X Error:", error);
      alert("Error al crear el ticket: " + error.message);
    }
  });

 
});

// Función para cargar departamentos
async function cargarDepartamentos() {
  try {
    const response = await fetch("http://localhost:3000/api/departamentos");
    const data = await response.json();

    if (data.success && data.departamentos.length > 0) {
      const deptSelect = document.getElementById("departamento");
      deptSelect.innerHTML = '<option value="">Seleccionar departamento...</option>';

      data.departamentos.forEach(dept => {
        const option = document.createElement("option");
        option.value = dept.IdDep;
        option.textContent = dept.NomDep;
        deptSelect.appendChild(option);
      });

      console.log("✓ Departamentos cargados:", data.departamentos.length);
    }
  } catch (error) {
    console.error("X Error al cargar departamentos:", error);
    alert("Error al cargar departamentos: " + error.message);
  }
}
