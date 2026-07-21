document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const header = document.getElementById('main-header');
  const menuToggleBtn = document.getElementById('menu-toggle-button');
  const mobileOverlay = document.getElementById('mobile-navigation-overlay');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const contactForm = document.getElementById('contact-form-element');
  const formSuccessAlert = document.getElementById('form-success-alert');
  const glowOrb1 = document.querySelector('.glow-1');

  // --- 1. Sticky Header Scroll Effect ---
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // --- 2. Mobile Menu Toggle ---
  function toggleMobileMenu() {
    const isExpanded = menuToggleBtn.getAttribute('aria-expanded') === 'true';
    menuToggleBtn.setAttribute('aria-expanded', !isExpanded);
    menuToggleBtn.classList.toggle('active');
    mobileOverlay.classList.toggle('active');
    document.body.style.overflow = isExpanded ? 'auto' : 'hidden'; // Lock background scroll when menu is open
  }

  menuToggleBtn.addEventListener('click', toggleMobileMenu);

  // Close mobile menu when clicking a link
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuToggleBtn.setAttribute('aria-expanded', 'false');
      menuToggleBtn.classList.remove('active');
      mobileOverlay.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  });

  // --- 3. Active Link Indicator on Scroll (Intersection Observer) ---
  const sections = document.querySelectorAll('section');
  const observerOptions = {
    root: null,
    rootMargin: '-50px 0px -50px 0px',
    threshold: 0.3
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        
        // Update Desktop active class
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });

        // Update Mobile active class
        mobileNavLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    observer.observe(section);
  });

  // --- 4. AJAX Form Submission via Formspree ---
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitButton = document.getElementById('btn-form-submit');
      const submitText = submitButton.querySelector('span');
      const originalText = submitText.textContent;
      
      // Update button state to sending
      submitButton.disabled = true;
      submitText.textContent = 'Enviando...';

      const formData = new FormData(contactForm);

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          // Hide form and show success message
          contactForm.style.display = 'none';
          formSuccessAlert.style.display = 'block';
          contactForm.reset();
        } else {
          // Handle error
          const data = await response.json();
          if (Object.hasOwn(data, 'errors')) {
            alert(data.errors.map(error => error.message).join(', '));
          } else {
            alert('Ops! Ocorreu um problema ao enviar seu formulário. Tente novamente mais tarde.');
          }
          submitButton.disabled = false;
          submitText.textContent = originalText;
        }
      } catch (error) {
        alert('Ops! Ocorreu um erro de rede. Verifique sua conexão e tente novamente.');
        submitButton.disabled = false;
        submitText.textContent = originalText;
      }
    });
  }

  // --- 5. Interactive Mouse-Move Reactive Glow Effect ---
  document.addEventListener('mousemove', (e) => {
    if (glowOrb1) {
      // Calculate coordinates relative to screen, adjusting background glow orb position slightly
      const x = e.clientX / 6;
      const y = e.clientY / 6;
      glowOrb1.style.transform = `translate(${x}px, ${y}px)`;
    }
  });
});
