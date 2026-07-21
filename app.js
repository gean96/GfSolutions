document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const header = document.getElementById('main-header');
  const menuToggleBtn = document.getElementById('menu-toggle-button');
  const mobileOverlay = document.getElementById('mobile-navigation-overlay');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
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

  // --- 4. Interactive Mouse-Move Reactive Glow Effect ---
  document.addEventListener('mousemove', (e) => {
    if (glowOrb1) {
      // Calculate coordinates relative to screen, adjusting background glow orb position slightly
      const x = e.clientX / 6;
      const y = e.clientY / 6;
      glowOrb1.style.transform = `translate(${x}px, ${y}px)`;
    }
  });

  // --- 5. Portfolio Carousel Logic ---
  const track = document.getElementById('carousel-track-element');
  const cards = document.querySelectorAll('.portfolio-card');
  const prevBtn = document.getElementById('carousel-prev-btn');
  const nextBtn = document.getElementById('carousel-next-btn');
  const dotsContainer = document.getElementById('carousel-dots-container');

  if (track && cards.length > 0) {
    let currentIndex = 0;
    let cardsToShow = getCardsToShow();

    function getCardsToShow() {
      if (window.innerWidth > 1024) return 3;
      if (window.innerWidth > 768) return 2;
      return 1;
    }

    function updateCarousel() {
      cardsToShow = getCardsToShow();
      const maxIndex = Math.max(0, cards.length - cardsToShow);
      
      // Keep currentIndex within bounds
      if (currentIndex > maxIndex) currentIndex = maxIndex;
      if (currentIndex < 0) currentIndex = 0;

      // Calculate translation distance
      const cardWidth = cards[0].getBoundingClientRect().width;
      const trackStyle = window.getComputedStyle(track);
      const gap = parseFloat(trackStyle.gap) || 0;
      
      const offset = -currentIndex * (cardWidth + gap);
      track.style.transform = `translateX(${offset}px)`;

      // Update dots
      updateDots();

      // Disable/enable arrows (change visual opacity)
      if (prevBtn) {
        prevBtn.style.opacity = currentIndex === 0 ? '0.3' : '1';
        prevBtn.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
      }
      if (nextBtn) {
        const maxIndexReached = currentIndex >= maxIndex;
        nextBtn.style.opacity = maxIndexReached ? '0.3' : '1';
        nextBtn.style.pointerEvents = maxIndexReached ? 'none' : 'auto';
      }
    }

    function updateDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      const totalDots = Math.max(0, cards.length - getCardsToShow() + 1);
      
      if (totalDots <= 1) return; // No need for dots if all cards are shown in viewport

      for (let i = 0; i < totalDots; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === currentIndex) dot.classList.add('active');
        dot.addEventListener('click', () => {
          currentIndex = i;
          updateCarousel();
        });
        dotsContainer.appendChild(dot);
      }
    }

    // Navigation Click Listeners
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const maxIndex = cards.length - getCardsToShow();
        if (currentIndex < maxIndex) {
          currentIndex++;
          updateCarousel();
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
          currentIndex--;
          updateCarousel();
        }
      });
    }

    // Drag / Touch Swipe Support for mobile and touch screens
    let isDragging = false;
    let startX = 0;

    track.addEventListener('touchstart', (e) => {
      isDragging = true;
      startX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const currentX = e.touches[0].clientX;
      const diffX = currentX - startX;
      
      if (Math.abs(diffX) > 60) { // Swipe threshold
        isDragging = false;
        if (diffX > 0) {
          // Swipe right -> Show previous
          if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
          }
        } else {
          // Swipe left -> Show next
          const maxIndex = cards.length - getCardsToShow();
          if (currentIndex < maxIndex) {
            currentIndex++;
            updateCarousel();
          }
        }
      }
    }, { passive: true });

    track.addEventListener('touchend', () => {
      isDragging = false;
    });

    // Auto Play Carousel Logic
    let autoPlayInterval;
    function startAutoPlay() {
      autoPlayInterval = setInterval(() => {
        const maxIndex = cards.length - getCardsToShow();
        if (currentIndex < maxIndex) {
          currentIndex++;
        } else {
          currentIndex = 0;
        }
        updateCarousel();
      }, 5000); // rotate every 5 seconds
    }

    function stopAutoPlay() {
      clearInterval(autoPlayInterval);
    }

    // Hover wrapper triggers to stop/start autoplay
    const carouselWrapper = document.getElementById('portfolio-carousel');
    if (carouselWrapper) {
      carouselWrapper.addEventListener('mouseenter', stopAutoPlay);
      carouselWrapper.addEventListener('mouseleave', startAutoPlay);
    }

    // Resize Handler
    window.addEventListener('resize', () => {
      // Re-trigger layout calculations
      updateCarousel();
    });
    
    // Initial Render trigger
    setTimeout(updateCarousel, 250);
    startAutoPlay();
  }
});
