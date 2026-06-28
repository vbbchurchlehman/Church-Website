const homeEventsList = document.getElementById("homeEventsList");

function formatTime(time) {
  if (!time) return "";

  const [hours, minutes] = time.split(":");

  return new Date(2000, 0, 1, hours, minutes).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });
}

async function loadHomeEvents() {
  const response = await fetch("/api/events");
  const events = await response.json();

  homeEventsList.innerHTML = "";

  if (!events.length) {
    homeEventsList.innerHTML = `
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

  events.slice(0, 3).forEach(event => {
    homeEventsList.innerHTML += `
      <div class="event-item">
        ${
          event.image_url
            ? `<img class="event-image" src="${event.image_url}" alt="${event.title}" onclick="openImage('${event.image_url}')">`
            : ""
        }

        <div class="event-date-group">
          <span class="event-date">${event.event_date}</span>
          ${
            event.event_time
              ? `<span class="event-time">${formatTime(event.event_time)}</span>`
              : ""
          }
        </div>

        <div>
          <h3>${event.title}</h3>
          <p>${event.description}</p>
        </div>
      </div>
    `;
  });
}

if (homeEventsList) {
  loadHomeEvents();
}
