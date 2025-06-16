// script.js
// Obtención de referencias a los elementos HTML del calendario
const calendarGrid = document.getElementById('calendarGrid');
const currentMonthYear = document.getElementById('currentMonthYear');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const eventForm = document.getElementById('eventForm');
const eventDateInput = document.getElementById('eventDate');
const addEventButton = document.getElementById('addEventButton');
const cancelEventButton = document.getElementById('cancelEventButton');

// Obtención de referencias a los elementos HTML para la gestión de clientes
const newClientNameInput = document.getElementById('newClientName');
const newClientContactInput = document.getElementById('newClientContact');
const addClientButton = document.getElementById('addClientButton');
const clientListUl = document.getElementById('clientList');
const eventClientSelect = document.getElementById('eventClient'); // El select para elegir cliente en el formulario de evento

// Variables para la fecha actual y para almacenar eventos y clientes
let currentDate = new Date();
// Carga eventos guardados en localStorage, o un array vacío si no hay
let events = JSON.parse(localStorage.getItem('calendarEvents')) || [];
// Carga clientes guardados en localStorage, o un array vacío si no hay
let clients = JSON.parse(localStorage.getItem('clients')) || [];

// --- Funciones para el Calendario ---

/**
 * Renderiza el calendario para el mes y año actuales.
 * Limpia el grid, calcula los días, añade los eventos y configura los listeners.
 */
function renderCalendar() {
    // Resetea el contenido del grid del calendario y añade los nombres de los días de la semana
    calendarGrid.innerHTML = `
        <div class="day-name">Lun</div>
        <div class="day-name">Mar</div>
        <div class="day-name">Mié</div>
        <div class="day-name">Jue</div>
        <div class="day-name">Vie</div>
        <div class="day-name">Sáb</div>
        <div class="day-name">Dom</div>
    `;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-11 para enero-diciembre
    const firstDayOfMonth = new Date(year, month, 1); // Primer día del mes
    const lastDayOfMonth = new Date(year, month + 1, 0); // Último día del mes (día 0 del siguiente mes)

    // Actualiza el texto de la cabecera con el mes y año actual
    currentMonthYear.textContent = firstDayOfMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

    // Calcula el día de la semana en que comienza el mes
    // getDay() devuelve 0 para domingo, 1 para lunes... Ajustamos para que lunes sea el primer día de la semana (0)
    let startDayOfWeek = firstDayOfMonth.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Si es domingo (0), lo convierte a 6 (último), si no, resta 1

    // Rellena los días vacíos al principio del mes para alinear correctamente con los días de la semana
    for (let i = 0; i < startDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('day-box', 'empty'); // Añade clases para estilo y para marcarlo como vacío
        calendarGrid.appendChild(emptyDay);
    }

    // Rellena los días del mes
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const dayBox = document.createElement('div');
        dayBox.classList.add('day-box');
        dayBox.innerHTML = `<span class="day-number">${i}</span>`; // Muestra el número del día
        // Almacena la fecha completa en un atributo de datos para fácil acceso
        dayBox.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;

        // Marca el día actual si coincide con la fecha de hoy
        const today = new Date();
        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayBox.classList.add('current-day');
        }

        // Filtra y añade los eventos correspondientes a este día
        const dayEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getDate() === i && eventDate.getMonth() === month && eventDate.getFullYear() === year;
        });

        dayEvents.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.classList.add('event'); // Clase para estilos de evento
            // Muestra la hora, tipo y cliente del evento
            eventDiv.textContent = `${event.time} - ${event.type} (${event.client})`;
            // Añade un tooltip (información al pasar el ratón/presionar) con los detalles completos
            eventDiv.title = `Tipo: ${event.type}\nCliente: ${event.client}\nDirección: ${event.address}\nTécnico: ${event.technician}\nDescripción: ${event.description}`;
            dayBox.appendChild(eventDiv);
        });

        // Agrega un Event Listener para abrir el formulario al hacer clic en un día
        dayBox.addEventListener('click', () => {
            if (!dayBox.classList.contains('empty')) { // Solo si no es un día vacío
                const selectedDate = dayBox.dataset.date;
                eventDateInput.value = selectedDate; // Rellena la fecha en el formulario
                eventForm.classList.add('active'); // Muestra el formulario
            }
        });

        calendarGrid.appendChild(dayBox); // Añade el día al grid
    }
}

/**
 * Añade un nuevo evento al array de eventos y lo guarda en localStorage.
 * Luego, vuelve a renderizar el calendario y limpia el formulario.
 */
function addEvent() {
    // Obtiene los valores del formulario de evento
    const date = eventDateInput.value;
    const type = document.getElementById('eventType').value;
    const time = document.getElementById('eventTime').value;
    const client = eventClientSelect.value; // Obtiene el cliente del select
    const address = document.getElementById('eventAddress').value;
    const technician = document.getElementById('eventTechnician').value;
    const description = document.getElementById('eventDescription').value;

    // Validación básica de campos obligatorios
    if (!date || !type || !time || !client || !address || !technician) {
        alert('Por favor, completa todos los campos obligatorios del evento (Tipo, Hora, Cliente, Dirección, Técnico).');
        return; // Detiene la función si faltan campos
    }

    // Crea un objeto con los datos del nuevo evento
    const newEvent = {
        date,
        type,
        time,
        client,
        address,
        technician,
        description
    };

    events.push(newEvent); // Añade el nuevo evento al array
    localStorage.setItem('calendarEvents', JSON.stringify(events)); // Guarda el array actualizado en localStorage
    renderCalendar(); // Vuelve a renderizar el calendario para mostrar el nuevo evento
    eventForm.classList.remove('active'); // Oculta el formulario
    eventForm.reset(); // Limpia los campos del formulario
    // Restablece los valores por defecto del select para Tipo de Evento y Cliente
    document.getElementById('eventType').value = 'Visita Técnica';
    document.getElementById('eventClient').value = '';
}

// Event Listeners para los botones de navegación del calendario
prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1); // Retrocede un mes
    renderCalendar(); // Vuelve a renderizar
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1); // Avanza un mes
    renderCalendar(); // Vuelve a renderizar
});

// Event Listeners para los botones del formulario de evento
addEventButton.addEventListener('click', addEvent); // Al hacer clic en 'Guardar Evento'
cancelEventButton.addEventListener('click', () => {
    eventForm.classList.remove('active'); // Oculta el formulario al cancelar
    eventForm.reset(); // Limpia el formulario
    // Restablece los valores por defecto del select para Tipo de Evento y Cliente
    document.getElementById('eventType').value = 'Visita Técnica';
    document.getElementById('eventClient').value = '';
});


// --- Funciones para Gestión de Clientes ---

/**
 * Renderiza la lista de clientes y actualiza el select de clientes en el formulario de eventos.
 */
function renderClients() {
    clientListUl.innerHTML = ''; // Limpia la lista de clientes actual
    eventClientSelect.innerHTML = '<option value="">Selecciona un cliente</option>'; // Limpia el select y añade la opción por defecto

    if (clients.length === 0) {
        // Si no hay clientes, muestra un mensaje
        const noClientsMsg = document.createElement('li');
        noClientsMsg.textContent = 'No hay clientes registrados aún.';
        clientListUl.appendChild(noClientsMsg);
    } else {
        // Si hay clientes, los itera y los añade a la lista y al select
        clients.forEach((client, index) => {
            // Renderiza en la lista de clientes
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${client.name} (${client.contact})</span>
                <button class="delete-client-btn" data-index="${index}">Eliminar</button>
            `;
            clientListUl.appendChild(li);

            // Añade al select de eventos
            const option = document.createElement('option');
            option.value = client.name; // El valor de la opción será el nombre del cliente
            option.textContent = client.name; // El texto visible será el nombre del cliente
            eventClientSelect.appendChild(option);
        });
    }

    // Añade event listeners a los botones de eliminar cliente
    document.querySelectorAll('.delete-client-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const indexToDelete = parseInt(e.target.dataset.index); // Obtiene el índice del cliente a eliminar
            deleteClient(indexToDelete); // Llama a la función para eliminar
        });
    });
}

/**
 * Añade un nuevo cliente al array de clientes y lo guarda en localStorage.
 */
function addClient() {
    const name = newClientNameInput.value.trim(); // Obtiene el nombre y elimina espacios extra
    const contact = newClientContactInput.value.trim(); // Obtiene el contacto y elimina espacios extra

    if (name === '') {
        alert('El nombre del cliente no puede estar vacío.');
        return;
    }

    // Verifica si el cliente ya existe (sensible a mayúsculas/minúsculas)
    if (clients.some(client => client.name.toLowerCase() === name.toLowerCase())) {
        alert('Este cliente ya está registrado.');
        return;
    }

    const newClient = { name, contact }; // Crea el objeto cliente
    clients.push(newClient); // Añade el nuevo cliente al array
    localStorage.setItem('clients', JSON.stringify(clients)); // Guarda el array actualizado en localStorage
    newClientNameInput.value = ''; // Limpia los campos de entrada
    newClientContactInput.value = '';
    renderClients(); // Vuelve a renderizar la lista de clientes y el select
}

/**
 * Elimina un cliente del array de clientes y de localStorage.
 * @param {number} index - El índice del cliente a eliminar.
 */
function deleteClient(index) {
    // Pide confirmación antes de eliminar
    if (confirm(`¿Estás seguro de que quieres eliminar a "${clients[index].name}"? Ten en cuenta que esto no eliminará eventos ya creados para este cliente.`)) {
        clients.splice(index, 1); // Elimina el cliente del array
        localStorage.setItem('clients', JSON.stringify(clients)); // Guarda el array actualizado
        renderClients(); // Vuelve a renderizar las listas
    }
}

// --- Inicialización ---

// Asegura que el DOM esté completamente cargado antes de renderizar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    renderClients(); // Renderiza los clientes primero para que el select de cliente esté lleno
    renderCalendar(); // Luego renderiza el calendario
});

// Event Listener para el botón de añadir cliente
addClientButton.addEventListener('click', addClient);