const eventForm = document.getElementById("eventForm");
const eventId = document.getElementById("eventId");
const eventSortDate = document.getElementById("eventSortDate");
const eventEndDate = document.getElementById("eventEndDate");
const eventTime = document.getElementById("eventTime");
const eventTitle = document.getElementById("eventTitle");
const eventDescription = document.getElementById("eventDescription");
const eventImage = document.getElementById("eventImage");
const eventsAdminList = document.getElementById("eventsAdminList");
const cancelEdit = document.getElementById("cancelEdit");

function getDateParts(sortDate) {
  if (!sortDate) return null;

  const [year, month, day] = sortDate.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return {
    month: date.toLocaleDateString("en-US", { month: "long" }),
    day: date.toLocaleDateString("en-US", { day: "numeric" })
  };
}

function formatDisplayDate(sortDate) {
  const parts = getDateParts(sortDate);
  return parts ? `${parts.month} ${parts.day}` : "";
}

function formatTime(time) {
  if (!time) return "";

  const [hours, minutes] = time.split(":");

  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });
}

function eventDateHtml(event) {
  const start = getDateParts(event.event_sort_date);
  const end = getDateParts(event.event_end_date);

  if (!start) {
    return `
      <div class="event-date-group">
        <span class="event-date">Soon</span>
      </div>
    `;
  }

  let dateHtml = "";

  if (end && start.month === end.month) {
    dateHtml = `<span class="event-date">${start.month} ${start.day}-${end.day}</span>`;
  } else {
    dateHtml = `
      <span class="event-date">${start.month} ${start.day}${end ? " -" : ""}</span>
      ${end ? `<span class="event-date">${end.month} ${end.day}</span>` : ""}
    `;
  }

  return `
    <div class="event-date-group">
      ${dateHtml}
      ${event.event_time ? `<span class="event-time">${formatTime(event.event_time)}</span>` : ""}
    </div>
  `;
}

async function loadEvents() {
  const response = await fetch("/api/events");
  const events = await response.json();

  eventsAdminList.innerHTML = "";

  events.forEach(event => {
    const item = document.createElement("div");
    item.className = "event-item";

    item.innerHTML = `
      ${event.image_url ? `<img class="event-image" src="${event.image_url}" alt="${event.title}" onclick="openImage('${event.image_url}')">` : ""}
      ${eventDateHtml(event)}
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

    buttons[0].addEventListener("click", () => editEvent(event));
    buttons[1].addEventListener("click", () => deleteEvent(event.id));

    eventsAdminList.appendChild(item);
  });
}

function editEvent(event) {
  eventId.value = event.id;
  eventSortDate.value = event.event_sort_date;
  eventEndDate.value = event.event_end_date || "";
  eventTime.value = event.event_time || "";
  eventTitle.value = event.title;
  eventDescription.value = event.description;
  eventImage.value = "";

  window.scrollTo({
    top: eventForm.offsetTop - 100,
    behavior: "smooth"
  });
}

eventForm.addEventListener("submit", async e => {
  e.preventDefault();

  const formData = new FormData();

  formData.append("id", eventId.value);
  formData.append("event_date", formatDisplayDate(eventSortDate.value));
  formData.append("event_sort_date", eventSortDate.value);
  formData.append("event_end_date", eventEndDate.value);
  formData.append("event_time", eventTime.value);
  formData.append("title", eventTitle.value);
  formData.append("description", eventDescription.value);

  if (eventImage.files.length > 0) {
    formData.append("event_image", eventImage.files[0]);
  }

  const isEditing = Boolean(eventId.value);

  const response = await fetch("/api/events", {
    method: isEditing ? "PUT" : "POST",
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    alert("Event did not save: " + errorText);
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

if (eventForm) {
  loadEvents();
}
