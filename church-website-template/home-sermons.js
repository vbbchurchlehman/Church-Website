const homeSermonBox = document.getElementById("homeSermonBox");

async function loadHomeSermon() {
  const response = await fetch("/api/sermons");
  const sermons = await response.json();

  if (!sermons.length) {
    homeSermonBox.innerHTML = `
      <div>
        <h3>No Sermons Posted Yet</h3>
        <p>Please check back soon.</p>
      </div>
    `;
    return;
  }

  const sermon = sermons[0];

  homeSermonBox.innerHTML = `
    <div>
      <h3>${sermon.sermon_title}</h3>
      <p>${sermon.speaker} · ${sermon.service} · ${formatSermonDate(sermon.sermon_date)}</p>
      <audio controls src="${sermon.mp3_url}"></audio>
    </div>
  `;
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

loadHomeSermon();
