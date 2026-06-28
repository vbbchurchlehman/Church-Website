const homeEventsList = document.getElementById("homeEventsList");

async function loadHomeEvents() {
  const response = await fetch("/api/events");
  const events = await response.json();

  homeEventsList.innerHTML = "";

  if (!events.length) {
    homeEventsList.innerHTML = `
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

  events.slice(0, 3).forEach(event => {
    homeEventsList.innerHTML += `
      <div class="event-item">
        ${
          event.image_url
            ? `<img class="event-image" src="${event.image_url}" alt="${event.title}" onclick="openImage('${event.image_url}')">`
            : ""
        }
        <span class="event-date">${event.event_date}</span>
        <div>
          <h3>${event.title}</h3>
          <p>${event.description}</p>
        </div>
      </div>
    `;
  });
}

loadHomeEvents();
