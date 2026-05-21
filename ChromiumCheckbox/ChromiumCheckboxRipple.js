document.addEventListener('DOMContentLoaded', () => {
  const checkboxes = document.querySelectorAll('.cr-checkbox');

  checkboxes.forEach(container => {
    const box = container.querySelector('.cr-box');
    
    box.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent double toggling from label event
      
      const input = container.querySelector('input');
      input.checked = !input.checked; // Manually toggle state
      
      // Create ripple element
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      
      // Calculate ripple size & position
      const rect = box.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2.5;
      ripple.style.width = ripple.style.height = `${size}px`;
      
      const x = e.clientX - rect.left - (size / 2);
      const y = e.clientY - rect.top - (size / 2);
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      // Set ripple color to match the checkbox container outline
      const style = window.getComputedStyle(container);
      ripple.style.backgroundColor = style.borderColor || 'rgba(0, 0, 0, 0.15)';
      
      // Append and trigger animation
      box.appendChild(ripple);
      ripple.classList.add('animate');
      
      // Remove ripple after animation
      ripple.addEventListener('animationend', () => {
        ripple.remove();
      });
      
      // Trigger change event to notify any form listeners
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });
});
