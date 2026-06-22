const publicEventsList = document.getElementById("publicEventsList");

async function loadPublicEvents() {
  const response = await fetch("/api/events");
  const events = await response.json();

  publicEventsList.innerHTML = "";

  events.forEach(event => {
    publicEventsList.innerHTML += `
      <div class="event-item">
        <span class="event-date">${event.event_date}</span>
        <div>
          <h3>${event.title}</h3>
          <p>${event.description}</p>
        </div>
      </div>
    `;
  });
}

loadPublicEvents();
