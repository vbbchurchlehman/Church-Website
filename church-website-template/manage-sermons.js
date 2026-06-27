const sermonForm = document.getElementById("sermonForm");
const sermonsAdminList = document.getElementById("sermonsAdminList");

async function loadSermons() {
  const response = await fetch("/api/sermons");
  const sermons = await response.json();

  sermonsAdminList.innerHTML = "";

  sermons.forEach(sermon => {
    const item = document.createElement("div");
    item.className = "sermon-box";

    item.innerHTML = `
      <div>
        <h3>${sermon.sermon_title}</h3>
        <p>${sermon.speaker} · ${sermon.service} · ${sermon.sermon_date}</p>
        <audio controls src="${sermon.mp3_url}"></audio>
        <div class="admin-actions">
          <button class="btn danger" type="button">Delete</button>
        </div>
      </div>
    `;

    item.querySelector("button").addEventListener("click", () => {
      deleteSermon(sermon.id);
    });

    sermonsAdminList.appendChild(item);
  });
}

sermonForm.addEventListener("submit", async e => {
  e.preventDefault();

  const formData = new FormData(sermonForm);

  const response = await fetch("/api/sermons", {
    method: "POST",
    body: formData
  });

  const resultText = await response.text();

  if (!response.ok) {
    alert("Sermon did not save: " + resultText);
    return;
  }

  sermonForm.reset();
  await loadSermons();

  alert("Sermon added.");
});

async function deleteSermon(id) {
  if (!confirm("Delete this sermon?")) return;

  const response = await fetch(`/api/sermons?id=${id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    const errorText = await response.text();
    alert("Sermon did not delete: " + errorText);
    return;
  }

  await loadSermons();
}

loadSermons();
