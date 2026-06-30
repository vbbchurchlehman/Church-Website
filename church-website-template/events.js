const publicEventsList = document.getElementById("publicEventsList");

function getDateParts(sortDate) {
  if (!sortDate) return null;

  const [year, month, day] = sortDate.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return {
    month: date.toLocaleDateString("en-US", { month: "long" }),
    day: date.toLocaleDateString("en-US", { day: "numeric" })
  };
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

async function loadPublicEvents() {
  const response = await fetch("/api/events");
  const events = await response.json();

  publicEventsList.innerHTML = "";

  if (!events.length) {
    publicEventsList.innerHTML = `
      <div class="event-item">
        ${eventDateHtml({})}
        <div>
          <h3>No Events Posted Yet</h3>
          <p>Please check back soon.</p>
        </div>
      </div>
    `;
    return;
  }

  events.forEach(event => {
    publicEventsList.innerHTML += `
      <div class="event-item">
        ${event.image_url ? `<img class="event-image" src="${event.image_url}" alt="${event.title}" onclick="openImage('${event.image_url}')">` : ""}
        ${eventDateHtml(event)}
        <div>
          <h3>${event.title}</h3>
          <p>${event.description}</p>
        </div>
      </div>
    `;
  });
}

if (publicEventsList) {
  loadPublicEvents();
}
