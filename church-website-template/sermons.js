const publicSermonsList = document.getElementById("publicSermonsList");

async function loadPublicSermons() {
  const response = await fetch("/api/sermons");
  const sermons = await response.json();

  publicSermonsList.innerHTML = "";

  if (!sermons.length) {
    publicSermonsList.innerHTML = `
      <div class="sermon-box">
        <div>
          <h3>No Sermons Posted Yet</h3>
          <p>Please check back soon.</p>
        </div>
      </div>
    `;
    return;
  }

  sermons.forEach(sermon => {
    publicSermonsList.innerHTML += `
      <div class="sermon-box">
        <div>
          <h3>${sermon.sermon_title}</h3>
          <p>${sermon.speaker} · ${sermon.service} · ${formatSermonDate(sermon.sermon_date)}</p>
          <audio controls src="${sermon.mp3_url}"></audio>
        </div>
      </div>
    `;
  });
}

function formatSermonDate(dateValue) {
  const [year, month, day] = dateValue.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

loadPublicSermons();
