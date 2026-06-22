const eventForm = document.getElementById("eventForm");
const eventId = document.getElementById("eventId");
const eventDate = document.getElementById("eventDate");
const eventTitle = document.getElementById("eventTitle");
const eventDescription = document.getElementById("eventDescription");
const eventsAdminList = document.getElementById("eventsAdminList");
const cancelEdit = document.getElementById("cancelEdit");
const eventSortDate = document.getElementById("eventSortDate");

async function loadEvents() {
  const response = await fetch("/api/events");
  const events = await response.json();

  eventsAdminList.innerHTML = "";

  events.forEach(event => {
    eventsAdminList.innerHTML += `
      <div class="event-item">
        <span class="event-date">${event.event_date}</span>
        <div>
          <h3>${event.title}</h3>
          <p>${event.description}</p>

          <div class="admin-actions">
            <button
              class="btn primary"
              type="button"
              onclick="editEvent(${event.id}, '${escapeForJs(event.event_date)}', '${escapeForJs(event.title)}', '${escapeForJs(event.description)}')">
              Edit
            </button>

            <button
              class="btn danger"
              type="button"
              onclick="deleteEvent(${event.id})">
              Delete
            </button>
          </div>
        </div>
      </div>
    `;
  });
}

function escapeForJs(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");
}

function editEvent(id, date, sortDate, title, description) {
  eventId.value = id;
  eventDate.value = date;
  eventSortDate.value = sortDate;
  eventTitle.value = title;
  eventDescription.value = description;

  window.scrollTo({
    top: eventForm.offsetTop - 100,
    behavior: "smooth"
  });
}

eventForm.addEventListener("submit", async e => {
  e.preventDefault();

  const payload = {
  id: eventId.value,
  event_date: eventDate.value,
  event_sort_date: eventSortDate.value,
  title: eventTitle.value,
  description: eventDescription.value
};

  const isEditing = Boolean(eventId.value);

  await fetch("/api/events", {
    method: isEditing ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  eventForm.reset();
  eventId.value = "";
  loadEvents();
});

cancelEdit.addEventListener("click", () => {
  eventForm.reset();
  eventId.value = "";
});

async function deleteEvent(id) {
  if (!confirm("Delete this event?")) return;

  await fetch(`/api/events?id=${id}`, {
    method: "DELETE"
  });

  loadEvents();
}

loadEvents();
