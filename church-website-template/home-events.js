const homeEventsList = document.getElementById("homeEventsList");

async function loadHomeEvents() {
  const response = await fetch("/api/events");
  const events = await response.json();

  homeEventsList.innerHTML = "";

  events.slice(0, 3).forEach(event => {
    homeEventsList.innerHTML += `
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

loadHomeEvents();
