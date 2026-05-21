// Native Dialog Management
function openDialog(id) {
  const dialog = document.getElementById(id);
  if (dialog) dialog.showModal();
}

function closeDialog(id) {
  const dialog = document.getElementById(id);
  if (dialog) dialog.close();
}

// Global Ripple Initialization
document.addEventListener('DOMContentLoaded', () => {
  const rippleElements = document.querySelectorAll('.md-ripple');
  
  rippleElements.forEach(button => {
    button.addEventListener('click', function(e) {
      // Remove any leftover ripples
      const oldRipple = this.querySelector('.ripple');
      if (oldRipple) oldRipple.remove();

      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      
      // Calculate sizes and coordinates
      const rect = this.getBoundingClientRect();
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;
      
      ripple.style.width = ripple.style.height = `${diameter}px`;
      ripple.style.left = `${e.clientX - rect.left - radius}px`;
      ripple.style.top = `${e.clientY - rect.top - radius}px`;
      
      this.appendChild(ripple);
      
      // Clear element after animation completes
      ripple.addEventListener('animationend', () => {
        ripple.remove();
      });
    });
  });
});
