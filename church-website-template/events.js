const publicEventsList = document.getElementById("publicEventsList");

function formatDisplayDate(sortDate) {
  if (!sortDate) return "";

  const [year, month, day] = sortDate.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric"
  });
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
  return `
    <div class="event-date-group">
      <span class="event-date">${event.event_date}${event.event_end_date ? " -" : ""}</span>
      ${
        event.event_end_date
          ? `<span class="event-date">${formatDisplayDate(event.event_end_date)}</span>`
          : ""
      }
      ${
        event.event_time
          ? `<span class="event-time">${formatTime(event.event_time)}</span>`
          : ""
      }
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
        <div class="event-date-group">
          <span class="event-date">Soon</span>
        </div>
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
        ${
          event.image_url
            ? `<img class="event-image" src="${event.image_url}" alt="${event.title}" onclick="openImage('${event.image_url}')">`
            : ""
        }

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
