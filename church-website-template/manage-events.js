const eventForm = document.getElementById('eventForm');
const eventId = document.getElementById('eventId');
const eventDate = document.getElementById('eventDate');
const eventTitle = document.getElementById('eventTitle');
const eventDescription = document.getElementById('eventDescription');
const eventsAdminList = document.getElementById('eventsAdminList');
const cancelEdit = document.getElementById('cancelEdit');

let events = JSON.parse(localStorage.getItem('churchEvents')) || [
  {
    id: crypto.randomUUID(),
    date: 'MONTH DATE',
    title: 'EVENT TITLE',
    description: 'EVENT DESCRIPTION.'
  },
  {
    id: crypto.randomUUID(),
    date: 'MONTH DATE',
    title: 'EVENT TITLE',
    description: 'EVENT DESCRIPTION.'
  },
  {
    id: crypto.randomUUID(),
    date: 'MONTH DATE',
    title: 'EVENT TITLE',
    description: 'EVENT DESCRIPTION.'
  }
];

function saveEvents() {
  localStorage.setItem('churchEvents', JSON.stringify(events));
}

function renderEvents() {
  eventsAdminList.innerHTML = '';

  events.forEach(event => {
    const item = document.createElement('div');
    item.className = 'event-item';

    item.innerHTML = `
      <span class="event-date">${event.date}</span>
      <div>
        <h3>${event.title}</h3>
        <p>${event.description}</p>
        <div class="admin-actions">
          <button class="btn primary" onclick="editEvent('${event.id}')">Edit</button>
          <button class="btn danger" onclick="deleteEvent('${event.id}')">Delete</button>
        </div>
      </div>
    `;

    eventsAdminList.appendChild(item);
  });
}

function editEvent(id) {
  const event = events.find(e => e.id === id);

  if (!event) return;

  eventId.value = event.id;
  eventDate.value = event.date;
  eventTitle.value = event.title;
  eventDescription.value = event.description;
}

function deleteEvent(id) {
  if (!confirm('Delete this event?')) return;

  events = events.filter(e => e.id !== id);
  saveEvents();
  renderEvents();
}

eventForm.addEventListener('submit', e => {
  e.preventDefault();

  const event = {
    id: eventId.value || crypto.randomUUID(),
    date: eventDate.value,
    title: eventTitle.value,
    description: eventDescription.value
  };

  if (eventId.value) {
    events = events.map(e => e.id === event.id ? event : e);
  } else {
    events.push(event);
  }

  saveEvents();
  eventForm.reset();
  eventId.value = '';
  renderEvents();
});

cancelEdit.addEventListener('click', () => {
  eventForm.reset();
  eventId.value = '';
});

renderEvents();
