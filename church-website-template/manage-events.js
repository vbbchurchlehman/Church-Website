const eventForm = document.getElementById("eventForm");
const eventId = document.getElementById("eventId");
const eventSortDate = document.getElementById("eventSortDate");
const eventTitle = document.getElementById("eventTitle");
const eventDescription = document.getElementById("eventDescription");
const eventsAdminList = document.getElementById("eventsAdminList");
const cancelEdit = document.getElementById("cancelEdit");

function formatDisplayDate(sortDate) {
  const [year, month, day] = sortDate.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric"
  });
}

async function loadEvents() {
  const response = await fetch("/api/events");
  const events = await response.json();

  eventsAdminList.innerHTML = "";

  events.forEach(event => {
    const item = document.createElement("div");
    item.className = "event-item";

    item.innerHTML = `
      <span class="event-date">${event.event_date}</span>
      <div>
        <h3>${event.title}</h3>
        <p>${event.description}</p>

        <div class="admin-actions">
          <button class="btn primary" type="button">Edit</button>
          <button class="btn danger" type="button">Delete</button>
        </div>
      </div>
    `;

    const buttons = item.querySelectorAll("button");

    buttons[0].addEventListener("click", () => {
      editEvent(event);
    });

    buttons[1].addEventListener("click", () => {
      deleteEvent(event.id);
    });

    eventsAdminList.appendChild(item);
  });
}

function editEvent(event) {
  eventId.value = event.id;
  eventSortDate.value = event.event_sort_date;
  eventTitle.value = event.title;
  eventDescription.value = event.description;

  window.scrollTo({
    top: eventForm.offsetTop - 100,
    behavior: "smooth"
  });
}

eventForm.addEventListener("submit", async e => {
  e.preventDefault();

  const payload = {
    id: eventId.value,
    event_date: formatDisplayDate(eventSortDate.value),
    event_sort_date: eventSortDate.value,
    title: eventTitle.value,
    description: eventDescription.value
  };

  const isEditing = Boolean(eventId.value);

  const response = await fetch("/api/events", {
    method: isEditing ? "PUT" : "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const resultText = await response.text();

  if (!response.ok) {
    alert("Event did not save: " + resultText);
    return;
  }

  eventForm.reset();
  eventId.value = "";
  await loadEvents();

  alert(isEditing ? "Event updated." : "Event added.");
});

cancelEdit.addEventListener("click", () => {
  eventForm.reset();
  eventId.value = "";
});

async function deleteEvent(id) {
  if (!confirm("Delete this event?")) return;

  const response = await fetch(`/api/events?id=${id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    const errorText = await response.text();
    alert("Event did not delete: " + errorText);
    return;
  }

  await loadEvents();
}

loadEvents();
