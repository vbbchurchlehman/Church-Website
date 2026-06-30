const homeEventsList = document.getElementById("homeEventsList");

function getDateParts(sortDate) {
  if (!sortDate) return null;

  const [year, month, day] = sortDate.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return {
    date,
    year: Number(year),
    monthIndex: Number(month) - 1,
    dayNumber: Number(day),
    month: date.toLocaleDateString("en-US", { month: "long" }),
    day: date.toLocaleDateString("en-US", { day: "numeric" }),
    weekday: date.toLocaleDateString("en-US", { weekday: "long" })
  };
}

function formatDateInput(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

function formatTime(time) {
  if (!time) return "";

  const [hours, minutes] = time.split(":");

  return new Date(2000, 0, 1, Number(hours), Number(minutes)).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });
}

function formatTimeRange(start, end) {
  if (!start) return "";

  if (!end) {
    return formatTime(start);
  }

  return `${formatTime(start)} - ${formatTime(end)}`;
}

function expandRecurringEvents(events) {
  const expanded = [];

  events.forEach(event => {
    if (event.recurrence_type !== "weekly_in_range") {
      expanded.push(event);
      return;
    }

    const start = getDateParts(event.event_sort_date);
    const end = getDateParts(event.event_end_date);
    const targetWeekday = Number(event.recurrence_weekday);

    if (!start || !end || Number.isNaN(targetWeekday)) {
      expanded.push(event);
      return;
    }

    const current = new Date(start.year, start.monthIndex, start.dayNumber);
    const finalDate = new Date(end.year, end.monthIndex, end.dayNumber);

    while (current <= finalDate) {
      if (current.getDay() === targetWeekday) {
        const currentSortDate = formatDateInput(current);
        const currentParts = getDateParts(currentSortDate);

        expanded.push({
          ...event,
          event_sort_date: currentSortDate,
          event_date: `${currentParts.month} ${currentParts.day}`,
          event_end_date: ""
        });
      }

      current.setDate(current.getDate() + 1);
    }
  });

  return expanded.sort((a, b) => {
    const dateCompare = String(a.event_sort_date).localeCompare(String(b.event_sort_date));

    if (dateCompare !== 0) {
      return dateCompare;
    }

    return String(a.event_time || "").localeCompare(String(b.event_time || ""));
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
    dateHtml = `
      <span class="event-date">${start.month} ${start.day}-${end.day}</span>
    `;
  } else {
    dateHtml = `
      <span class="event-date">${start.month} ${start.day}${end ? " -" : ""}</span>
      ${end ? `<span class="event-date">${end.month} ${end.day}</span>` : ""}
    `;
  }

  return `
    <div class="event-date-group">
      ${dateHtml}
      ${
        event.event_time
          ? `<span class="event-time">${formatTimeRange(event.event_time, event.event_end_time)}</span>`
          : ""
      }
    </div>
  `;
}

async function loadHomeEvents() {
  const response = await fetch("/api/events");
  const events = expandRecurringEvents(await response.json());

  homeEventsList.innerHTML = "";

  if (!events.length) {
    homeEventsList.innerHTML = `
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

  events.slice(0, 3).forEach(event => {
    homeEventsList.innerHTML += `
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

if (homeEventsList) {
  loadHomeEvents();
}
