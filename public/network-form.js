// Native HTML submission remains available if this small enhancement fails.
document.querySelectorAll('[data-network-form]').forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const status = form.querySelector('[role="status"]');
    button.disabled = true;
    status.textContent = 'Saving your request…';
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
        signal: AbortSignal.timeout(25000),
      });
      const result = await response.json();
      if (!response.ok || !result.submissionId) throw new Error(result.error || 'We could not confirm the request was saved. Please try again.');
      window.location.assign('/partner-network/thank-you');
    } catch (error) {
      status.textContent = error.name === 'TimeoutError' ? 'We could not confirm the result. Please contact john@mastercleanhq.com before resending.' : error.message || 'Please try again or email john@mastercleanhq.com.';
      button.disabled = false;
    }
  });
});
