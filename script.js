const yearEl = document.getElementById('year');
const form = document.getElementById('signup-form');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const emailInput = form.querySelector('input[type="email"]');
    const button = form.querySelector('button');

    if (!emailInput) return;

    button.textContent = 'You’re in!';
    button.disabled = true;
    emailInput.value = '';
    emailInput.placeholder = 'Thanks for joining';
  });
}
