const eventForm = document.getElementById("eventForm");
const eventDate = document.getElementById("eventDate");
const eventTitle = document.getElementById("eventTitle");
const eventDescription = document.getElementById("eventDescription");
const eventsAdminList = document.getElementById("eventsAdminList");

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
          <button class="btn danger" onclick="deleteEvent(${event.id})">
            Delete
          </button>
        </div>
      </div>
    `;
  });
}

eventForm.addEventListener("submit", async e => {
  e.preventDefault();

  await fetch("/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      event_date: eventDate.value,
      title: eventTitle.value,
      description: eventDescription.value
    })
  });

  eventForm.reset();
  loadEvents();
});

async function deleteEvent(id) {
  if (!confirm("Delete this event?")) return;

  await fetch(`/api/events?id=${id}`, {
    method: "DELETE"
  });

  loadEvents();
}

loadEvents();
