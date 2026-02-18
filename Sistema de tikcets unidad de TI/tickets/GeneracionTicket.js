document.addEventListener("DOMContentLoaded", function() {
  const formulario = document.getElementById("formularioTicket");
  const confirmacion = document.getElementById("confirmation");
  const formTicketDiv = document.getElementById("formTicket");

  cargarDepartamentos();

  formulario.addEventListener("submit", async function(e) {
    e.preventDefault();

    const idDep = document.getElementById("departamento").value;
    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();

    //VALIDACIONES
    if (!idDep) {
        return mostrarError("Por favor, seleccione un departamento.");
    }
    if (!nombreValido(nombre)) {
        return mostrarError("El nombre no es válido (solo letras y espacios).");
    }
    if (!correoValido(correo)) {
        return mostrarError("El correo electrónico no tiene un formato válido.");
    }
    if (!descripcionValida(descripcion)) {
        return mostrarError("La descripción debe tener entre 1 y 500 caracteres.");
    }

   
    const btnSubmit = formulario.querySelector("button[type='submit']");
    const btnText = btnSubmit.querySelector(".btn-text");
    const textoOriginal = btnText.textContent;

    btnSubmit.classList.add("button-loading");
    btnSubmit.disabled = true;
    btnText.textContent = "Generando Ticket...";

    try {
      const response = await fetch("http://localhost:3000/api/admin/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
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
        throw new Error(errorData.error || 'Error en el servidor');
      }

      const data = await response.json();
      const ticket = data.ticket;

      // Llenar datos de confirmación
      document.getElementById("ticketNumber").textContent = "#" + ticket.idTicket;
      document.getElementById("ticketDepartamento").textContent = ticket.nombreDepartamento;
      document.getElementById("ticketNombre").textContent = ticket.nombreContacto;
      document.getElementById("ticketCorreo").textContent = ticket.correoContacto;
      document.getElementById("ticketDescripcion").textContent = ticket.descripcionProblema;

      formTicketDiv.classList.add("oculto");
      confirmacion.classList.remove("oculto");
      formulario.reset();

    } catch (error) {
      console.error("X Error:", error);
      mostrarError(error.message || "Error al conectar con el servidor.");
    } finally {
      btnSubmit.classList.remove("button-loading");
      btnSubmit.disabled = false;
      btnText.textContent = textoOriginal;
    }
  });

  //FUNCIONES DE APOYO 

  function mostrarError(mensaje) {
    Swal.fire({
      icon: 'warning', 
      title: 'Atención',
      text: mensaje,
      confirmButtonColor: '#0f766e',
      customClass: { popup: "border-radius-16" }
    });
  }

  // Función para cargar departamentos del backend
  async function cargarDepartamentos() {
    try {
      const response = await fetch("http://localhost:3000/api/public/departamentos");
      
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
    return nombre.length > 0 && regex.test(nombre.trim());
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