const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  nav?.classList.toggle('open', open);
});

const form = document.querySelector('#signup-form');
const status = document.querySelector('#form-status');
form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const button = form.querySelector('button[type="submit"]');
  const label = button.innerHTML;
  button.disabled = true;
  button.innerHTML = 'Adding you…';
  status.textContent = '';
  status.classList.remove('error');
  try {
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not save your signup. Please try again.');
    status.textContent = result.message;
    form.reset();
  } catch (error) {
    status.textContent = error.message || 'Could not connect. Please try again.';
    status.classList.add('error');
  } finally {
    button.disabled = false;
    button.innerHTML = label;
  }
});

