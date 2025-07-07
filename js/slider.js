ScrollReveal().reveal('.reveal', {
    duration: 1000,
    distance: '40px',
    easing: 'ease-in-out',
    origin: 'bottom',
    interval: 200
  });

  function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      let current = 0;
      const increment = target / 120; 
  
      const updateCounter = () => {
        current += increment;
        if (current < target) {
          counter.innerText = '+' + Math.floor(current);
          requestAnimationFrame(updateCounter);
        } else {
          counter.innerText = '+' + target;
        }
      };
      updateCounter();
    });
  }
  
  // Lance uniquement quand la section stats est visible
  const statsSection = document.querySelector('#stats');
  let hasAnimated = false;
  
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !hasAnimated) {
      animateCounters();
      hasAnimated = true;
    }
  }, { threshold: 0.6 });
  
  if (statsSection) {
    observer.observe(statsSection);
  }
  

  document.querySelector('.contact-form').addEventListener('submit', function (e) {
    const captcha = document.querySelector('#captcha').value.trim();
    if (captcha !== '7') {
      e.preventDefault();
      alert('Veuillez répondre correctement à la question anti-bot.');
    }
  });
  