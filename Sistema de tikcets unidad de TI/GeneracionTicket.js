

document.addEventListener("DOMContentLoaded", function() {
    const formulario = document.getElementById("formTicket");
    const confirmacion = document.getElementById("confirmation");

    formulario.addEventListener("submit", function(e) {
    e.preventDefault();
    const ticketData = {
        numero: Math.floor(Math.random() * 1000000),
        departamento: document.getElementById("departamento").value,
        nombre: document.getElementById("nombre").value,
        descripcion: document.getElementById("descripcion").value,
    };

    if (!ticketData.departamento || !ticketData.nombre || !ticketData.descripcion) {
        alert("Por favor, complete todos los campos del formulario.");
        return;
    }

    document.getElementById("ticketNumber").textContent = ticketData.numero;
    document.getElementById("ticketDepartamento").textContent = ticketData.departamento;
    document.getElementById("ticketNombre").textContent = ticketData.nombre;
    document.getElementById("ticketDescripcion").textContent = ticketData.descripcion;

    formulario.classList.add("oculto");
    confirmacion.classList.remove("oculto");

    console.log("Ticket generado:", ticketData);
});


});