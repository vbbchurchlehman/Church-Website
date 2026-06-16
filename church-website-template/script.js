const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const year = document.getElementById('year');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

year.textContent = new Date().getFullYear();

const form = document.getElementById('contactForm');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const status = document.getElementById('formStatus');

    const response = await fetch('/contact', {
      method: 'POST',
      body: new FormData(form)
    });

    if (response.ok) {
      status.textContent =
        'Thank you! Your message has been sent.';
      form.reset();
    } else {
      status.textContent =
        'Sorry, there was a problem sending your message.';
    }
  });
}
