document.addEventListener('DOMContentLoaded', () => {
  // 1. Ripple Effect Logic
  const buttons = document.querySelectorAll('.cr-btn');
  buttons.forEach(button => {
    button.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      
      const diameter = Math.max(this.clientWidth, this.clientHeight);
      const radius = diameter / 2;

      ripple.style.width = ripple.style.height = `${diameter}px`;
      ripple.style.left = `${e.clientX - this.getBoundingClientRect().left - radius}px`;
      ripple.style.top = `${e.clientY - this.getBoundingClientRect().top - radius}px`;

      this.appendChild(ripple);

      // Remove the ripple element after animation completes
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  // 2. Dialog open/close logic
  // Helper to attach event listeners to a dialog instance
  function setupDialog(dialogId) {
    const dialog = document.getElementById(dialogId);
    if (!dialog) return;

    // Close on action/dismiss triggers
    dialog.querySelectorAll('[data-dismiss], [data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        dialog.close(e.target.hasAttribute('data-action') ? 'action' : 'dismiss');
      });
    });

    // Close on click outside (backdrop)
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) {
        dialog.close('backdrop');
      }
    });
  }

  setupDialog('standard-dialog');
  setupDialog('alert-dialog');
  setupDialog('fullscreen-dialog');

  // 3. Optional: Example of how to programmatically open them
  // document.getElementById('my-open-button').addEventListener('click', () => {
  //   document.getElementById('alert-dialog').showModal();
  // });
});
