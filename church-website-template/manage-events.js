const sermonForm = document.getElementById("sermonForm");
const sermonId = document.getElementById("sermonId");
const sermonTitle = document.getElementById("sermonTitle");
const sermonSpeaker = document.getElementById("sermonSpeaker");
const sermonService = document.getElementById("sermonService");
const sermonDate = document.getElementById("sermonDate");
const scripturePassage = document.getElementById("scripturePassage");
const sermonMp3 = document.getElementById("sermonMp3");
const sermonsAdminList = document.getElementById("sermonsAdminList");
const cancelEdit = document.getElementById("cancelEdit");

function formatSermonDate(dateValue) {
  if (!dateValue) return "";

  const [year, month, day] = dateValue.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

async function loadSermons() {
  const response = await fetch("/api/sermons");

  if (!response.ok) {
    const errorText = await response.text();
    alert("Sermons could not be loaded: " + errorText);
    return;
  }

  const sermons = await response.json();

  sermonsAdminList.innerHTML = "";

  sermons.forEach(sermon => {
    const item = document.createElement("div");
    item.className = "sermon-box";

    item.innerHTML = `
      <div>
        <h3>${sermon.sermon_title || ""}</h3>

        <p>
          ${sermon.speaker || ""}
          ${sermon.service ? ` · ${sermon.service}` : ""}
          ${sermon.sermon_date ? ` · ${formatSermonDate(sermon.sermon_date)}` : ""}
          ${sermon.scripture_passage ? ` · ${sermon.scripture_passage}` : ""}
        </p>

        ${
          sermon.mp3_url
            ? `<audio controls src="${sermon.mp3_url}"></audio>`
            : ""
        }

        <div class="admin-actions">
          <button class="btn primary edit-sermon" type="button">
            Edit
          </button>

          <button class="btn danger delete-sermon" type="button">
            Delete
          </button>
        </div>
      </div>
    `;

    item
      .querySelector(".edit-sermon")
      .addEventListener("click", () => editSermon(sermon));

    item
      .querySelector(".delete-sermon")
      .addEventListener("click", () => deleteSermon(sermon.id));

    sermonsAdminList.appendChild(item);
  });
}

function editSermon(sermon) {
  sermonId.value = sermon.id || "";
  sermonTitle.value = sermon.sermon_title || "";
  sermonSpeaker.value = sermon.speaker || "";
  sermonService.value = sermon.service || "";
  sermonDate.value = sermon.sermon_date || "";
  scripturePassage.value = sermon.scripture_passage || "";

  // Browsers do not allow setting a file input's value.
  sermonMp3.value = "";

  if (cancelEdit) {
    cancelEdit.hidden = false;
  }

  window.scrollTo({
    top: sermonForm.offsetTop - 100,
    behavior: "smooth"
  });
}

function resetSermonForm() {
  sermonForm.reset();
  sermonId.value = "";

  if (cancelEdit) {
    cancelEdit.hidden = true;
  }
}

sermonForm.addEventListener("submit", async e => {
  e.preventDefault();

  const formData = new FormData();

  formData.append("id", sermonId.value);
  formData.append("sermon_title", sermonTitle.value);
  formData.append("speaker", sermonSpeaker.value);
  formData.append("service", sermonService.value);
  formData.append("sermon_date", sermonDate.value);
  formData.append("scripture_passage", scripturePassage.value);

  if (sermonMp3.files.length > 0) {
    formData.append("sermon_mp3", sermonMp3.files[0]);
  }

  const isEditing = Boolean(sermonId.value);

  const response = await fetch("/api/sermons", {
    method: isEditing ? "PUT" : "POST",
    body: formData
  });

  const resultText = await response.text();

  if (!response.ok) {
    alert("Sermon did not save: " + resultText);
    return;
  }

  resetSermonForm();
  await loadSermons();

  alert(isEditing ? "Sermon updated." : "Sermon added.");
});

if (cancelEdit) {
  cancelEdit.addEventListener("click", () => {
    resetSermonForm();
  });
}

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

  if (sermonId.value === String(id)) {
    resetSermonForm();
  }

  await loadSermons();
}

if (sermonForm && sermonsAdminList) {
  loadSermons();
}
