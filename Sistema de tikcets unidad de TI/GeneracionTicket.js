


document.querySelector("button[type='submit']").addEventListener("click", function (e) {
    e.preventDefault(); 

    document.getElementById("formTicket").classList.add("oculto");
    document.getElementById("CardConfirmation").classList.remove("oculto");
});

document.addEventListener("DOMContentLoaded", function() {
document.getElementById("formTicket").addEventListener("submit", function(e) {
    e.preventDefault();
    const Ticket = {
        numero: Math.floor(Math.random() * 1000000),
        departamento: document.getElementById("departamento").value,
        nombre: document.getElementById("nombre").value,
        descripcion: document.getElementById("descripcion").value,
         fecha: new Date().toLocaleString()
    }
});

document.getElementById("ticketNumber").textContent = Ticket.numero;
document.getElementById("ticketDepartamento").textContent = Ticket.departamento;
document.getElementById("ticketNombre").textContent = Ticket.nombre;
document.getElementById("ticketDescripcion").textContent = Ticket.descripcion;

document.getElementById("formTicket").classList.add("oculto");
document.getElementById("CardConfirmation").classList.remove("oculto");
});