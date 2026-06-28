const publicEventsList = document.getElementById("publicEventsList");

async function loadPublicEvents() {
  const response = await fetch("/api/events");
  const events = await response.json();

  publicEventsList.innerHTML = "";

  if (!events.length) {
    publicEventsList.innerHTML = `
      <div class="event-item">
        <span class="event-date">Soon</span>
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
        ${event.image_url ? `<img class="event-image" src="${event.image_url}" alt="${event.title}">` : ""}
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
