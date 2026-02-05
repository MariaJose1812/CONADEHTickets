document.addEventListener("DOMContentLoaded", function() {
  const formulario = document.getElementById("formularioTicket");
  const confirmacion = document.getElementById("confirmation");
  const formTicketDiv = document.getElementById("formTicket");

  
  cargarDepartamentos();

  formulario.addEventListener("submit", async function(e) {
    e.preventDefault();

    const btnSubmit = formulario.querySelector("button[type='submit']");
    const btnText = btnSubmit.querySelector(".btn-text");

    const textoOriginal = btnText.textContent;
    
    // Obtener datos del formulario
    const idDep = document.getElementById("departamento").value;
    const nombre = document.getElementById("nombre").value;
    const correo = document.getElementById("correo").value;
    const descripcion = document.getElementById("descripcion").value;


      btnSubmit.classList.add("button-loading");
      btnSubmit.disabled = true; // Deshabilita para evitar doble envío
      btnText.textContent = "Generando Ticket...";

    try {
      // Enviar datos al backend
      const response = await fetch("http://localhost:3000/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          idDep: parseInt(idDep),
          nombreContacto: nombre,
          correoContacto: correo,
          descripcionProblema: descripcion
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        Swal.fire ({
          icon: 'error',
          title: 'Error al crear el ticket',
          text: errorData.error || 'Error desconocido',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#0f766e',
          customClass: {
            popup: "border-radius-16"
          }
        });

        return;
      }

      // Procesar respuesta exitosa
      const data = await response.json();
      const ticket = data.ticket;

      // Llenar los datos de confirmación con los datos del servidor
      document.getElementById("ticketNumber").textContent = "#" + ticket.idTicket;
      document.getElementById("ticketDepartamento").textContent = ticket.nombreDepartamento;
      document.getElementById("ticketNombre").textContent = ticket.nombreContacto;
      document.getElementById("ticketCorreo").textContent = ticket.correoContacto;
      document.getElementById("ticketDescripcion").textContent = ticket.descripcionProblema;

      // Ocultar formulario y mostrar confirmación
      formTicketDiv.classList.add("oculto");
      confirmacion.classList.remove("oculto");

      // Limpiar formulario para la próxima vez
      formulario.reset();

      console.log("✔ Ticket creado exitosamente:", ticket);
    } catch (error) {
      console.error("X Error al crear ticket:", error);
      alert("X Error al conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:3000");
    } finally {
      btnSubmit.classList.remove("button-loading");
      btnSubmit.disabled = false;
      btnText.textContent = textoOriginal;
    }

      cargarTickets();
      ActivarBusqueda();

  });


  // Función para cargar departamentos del backend
  async function cargarDepartamentos() {
    try {
      const response = await fetch("http://localhost:3000/api/departamentos");
      
      if (!response.ok) {
        throw new Error("Error al obtener departamentos");
      }

      const data = await response.json();
      const selectDepartamento = document.getElementById("departamento");

      
      selectDepartamento.innerHTML = '<option value="" disabled selected>Seleccione el departamento</option>';

      // Agregar opciones de departamentos
      data.departamentos.forEach(dept => {
        const option = document.createElement("option");
        option.value = dept.IdDep;
        option.textContent = dept.NomDep;
        selectDepartamento.appendChild(option);
      });

      console.log("✔ Departamentos cargados:", data.departamentos.length);
    } catch (error) {
      console.error("X Error al cargar departamentos:", error);
      alert("Error al cargar los departamentos. Verifica que el backend esté corriendo.");
    }
  }

  function nombreValido(nombre) {
    const regex = /^[a-zA-ZÀ-ÿ\s]{1,100}$/;
    return regex.test(nombre.trim());
  }

  function correoValido(correo) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo.trim());
  }

  function descripcionValida(descripcion) {
    return descripcion.length > 0 && descripcion.length <= 500;
  }

  
  const btnNuevoTicket = document.getElementById("btn-nuevoticket");

  btnNuevoTicket.addEventListener("click", function() {
    confirmacion.classList.add("oculto");
    formTicketDiv.classList.remove("oculto");
  });

  
});