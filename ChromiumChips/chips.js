document.querySelectorAll('.cr-chip').forEach(chip => {
  chip.addEventListener('click', function(e) {
    // 1. Create the ripple span
    const ripple = document.createElement('span');
    ripple.classList.add('cr-ripple');
    this.appendChild(ripple);

    // 2. Calculate ripple dimensions and position
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    // 3. Remove the ripple after animation completes
    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
});
