document.querySelectorAll('.cr-button').forEach(button => {
  button.addEventListener('click', function (e) {
    const rect = button.getBoundingClientRect();
    
    // Calculate size and position of ripple
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - (size / 2);
    const y = e.clientY - rect.top - (size / 2);
    
    // Create ripple element
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    // Add color specific ripple contrast
    if (button.classList.contains('cr-filled') || button.classList.contains('cr-tertiary')) {
      ripple.style.background = 'rgba(255, 255, 255, 0.3)';
    } else {
      ripple.style.background = 'rgba(103, 80, 164, 0.2)';
    }

    // Append and cleanup
    this.appendChild(ripple);
    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
});
