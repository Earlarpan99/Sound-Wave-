const yearEl = document.getElementById('year');
const form = document.getElementById('signup-form');

document.addEventListener('keydown', (event) => {
  if (!event.ctrlKey || event.key.toLowerCase() !== 'g') return;

  event.preventDefault();

  let dialog = document.getElementById('admin-password-dialog');

  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = 'admin-password-dialog';
    dialog.className = 'admin-password-dialog';
    dialog.innerHTML = `
      <form class="admin-password-form">
        <h2>Admin access</h2>
        <label for="admin-password">Admin password</label>
        <input id="admin-password" type="password" autocomplete="current-password" required />
        <p class="admin-password-status" role="status">Password verification is not configured yet.</p>
        <div class="admin-password-actions">
          <button type="button" class="admin-password-cancel">Cancel</button>
          <button type="submit">Continue</button>
        </div>
      </form>`;
    document.body.append(dialog);

    const passwordForm = dialog.querySelector('form');
    const passwordInput = dialog.querySelector('input');
    const status = dialog.querySelector('.admin-password-status');

    passwordForm.addEventListener('submit', (submitEvent) => {
      submitEvent.preventDefault();
      passwordInput.value = '';
      status.textContent = 'Password verification is not configured yet.';
      passwordInput.focus();
    });

    dialog.querySelector('.admin-password-cancel').addEventListener('click', () => {
      dialog.close();
    });
  }

  if (!dialog.open) dialog.showModal();
  dialog.querySelector('input').focus();
});

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
