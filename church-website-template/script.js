const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const year = document.getElementById("year");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("open");
  });
}

if (year) {
  year.textContent = new Date().getFullYear();
}

function openImage(src) {
  const lightbox = document.getElementById("imageLightbox");
  const image = document.getElementById("lightboxImage");

  if (!lightbox || !image) return;

  image.src = src;
  lightbox.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeImage() {
  const lightbox = document.getElementById("imageLightbox");
  const image = document.getElementById("lightboxImage");

  if (!lightbox || !image) return;

  lightbox.classList.remove("show");
  image.src = "";
  document.body.style.overflow = "";
}
