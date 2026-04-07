/**
 * IL MONDO DI UGO - Main JavaScript
 * Interactive features and animations
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  initCursorGlow();
  initParticles();
  initNavigation();
  initScrollEffects();
  initWisdomCarousel();
  initGallery();
  initLightbox();
  initCounters();
  initForms();
  initBackToTop();
});

/**
 * Cursor Glow Effect
 * Creates a subtle glow that follows the cursor
 */
function initCursorGlow() {
  const cursorGlow = document.getElementById('cursorGlow');
  if (!cursorGlow) return;

  // Only enable on devices with hover capability
  if (!matchMedia('(hover: hover)').matches) {
    cursorGlow.style.display = 'none';
    return;
  }

  let mouseX = 0, mouseY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    const dx = mouseX - currentX;
    const dy = mouseY - currentY;
    
    currentX += dx * 0.1;
    currentY += dy * 0.1;
    
    cursorGlow.style.left = currentX + 'px';
    cursorGlow.style.top = currentY + 'px';
    
    requestAnimationFrame(animateCursor);
  }

  animateCursor();
}

/**
 * Floating Particles Background
 * Creates decorative floating particles
 */
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  // Only add particles on larger screens for performance
  if (window.innerWidth < 768) return;

  const particleCount = 30;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random positioning and timing
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 15 + 's';
    particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
    particle.style.opacity = Math.random() * 0.5 + 0.2;
    particle.style.width = (Math.random() * 6 + 4) + 'px';
    particle.style.height = particle.style.width;
    
    container.appendChild(particle);
  }
}

/**
 * Navigation
 * Handles sticky navbar and mobile menu
 */
function initNavigation() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (!navbar) return;

  // Scroll effect for navbar
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });

  // Mobile menu toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // Update active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  
  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/**
 * Scroll Effects
 * Reveal animations on scroll
 */
function initScrollEffects() {
  const revealElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale, .stagger-children');
  
  if (revealElements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => observer.observe(el));

  // Add reveal classes to sections for animation
  addScrollRevealClasses();
}

function addScrollRevealClasses() {
  // About cards
  document.querySelectorAll('.about-card').forEach((card, i) => {
    card.classList.add('scroll-reveal');
    card.style.transitionDelay = `${i * 100}ms`;
  });

  // Gallery items
  document.querySelectorAll('.gallery-item').forEach((item, i) => {
    item.classList.add('scroll-reveal-scale');
    item.style.transitionDelay = `${i * 50}ms`;
  });

  // Story cards
  document.querySelectorAll('.story-card').forEach((card, i) => {
    card.classList.add('scroll-reveal');
    card.style.transitionDelay = `${i * 100}ms`;
  });

  // Contact cards
  document.querySelectorAll('.contact-card').forEach((card, i) => {
    card.classList.add('scroll-reveal');
    card.style.transitionDelay = `${i * 100}ms`;
  });

  // Trigger observer for new elements
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.scroll-reveal, .scroll-reveal-scale').forEach(el => {
    observer.observe(el);
  });
}

/**
 * Wisdom Carousel
 * Auto-rotating quotes carousel
 */
function initWisdomCarousel() {
  const cards = document.querySelectorAll('.wisdom-card');
  const dots = document.querySelectorAll('.wisdom-dot');
  
  if (cards.length === 0) return;

  let currentSlide = 0;
  let autoPlayInterval;

  function showSlide(index) {
    cards.forEach(card => card.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    cards[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlide = index;
  }

  function nextSlide() {
    const next = (currentSlide + 1) % cards.length;
    showSlide(next);
  }

  // Dot click handlers
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      showSlide(i);
      resetAutoPlay();
    });
  });

  // Auto-play
  function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 5000);
  }

  function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    startAutoPlay();
  }

  startAutoPlay();

  // Pause on hover
  const carousel = document.querySelector('.wisdom-carousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    carousel.addEventListener('mouseleave', startAutoPlay);
  }
}

/**
 * Gallery
 * Filter and interaction effects
 */
function initGallery() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (filterBtns.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter items
      galleryItems.forEach(item => {
        const category = item.dataset.category;
        
        if (filter === 'all' || category === filter) {
          item.style.display = '';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 10);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.8)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/**
 * Lightbox
 * Full-screen image viewer
 */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-prev');
  const nextBtn = document.querySelector('.lightbox-next');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (!lightbox || galleryItems.length === 0) return;

  let currentIndex = 0;
  const images = Array.from(galleryItems).map(item => ({
    src: item.querySelector('img').src,
    caption: item.querySelector('.gallery-title')?.textContent || ''
  }));

  function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updateLightbox() {
    lightboxImg.src = images[currentIndex].src;
    lightboxCaption.textContent = images[currentIndex].caption;
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateLightbox();
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    updateLightbox();
  }

  // Event listeners
  galleryItems.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
  });

  closeBtn?.addEventListener('click', closeLightbox);
  prevBtn?.addEventListener('click', showPrev);
  nextBtn?.addEventListener('click', showNext);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    switch (e.key) {
      case 'Escape': closeLightbox(); break;
      case 'ArrowLeft': showPrev(); break;
      case 'ArrowRight': showNext(); break;
    }
  });
}

/**
 * Counter Animation
 * Animates numbers counting up
 */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  
  if (counters.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = counter.dataset.count;
        
        if (target === '∞') {
          counter.textContent = '∞';
          return;
        }

        const targetNum = parseInt(target);
        const duration = 2000;
        const step = targetNum / (duration / 16);
        let current = 0;

        const updateCounter = () => {
          current += step;
          if (current < targetNum) {
            counter.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = targetNum;
          }
        };

        updateCounter();
        observer.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

/**
 * Form Handling
 * Newsletter and contact form submission
 */
function initForms() {
  // Newsletter form
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = newsletterForm.querySelector('input[type="email"]').value;
      
      // Simulated success
      showNotification('Grazie per esserti iscritto! 🐾', 'success');
      newsletterForm.reset();
    });
  }

  // Contact form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Simulated success
      showNotification('Messaggio inviato! Ugo ti risponderà presto 🐕', 'success');
      contactForm.reset();
    });
  }
}

/**
 * Show Notification
 * Display a toast notification
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <span>${message}</span>
    <button class="notification-close">&times;</button>
  `;
  
  // Add styles
  Object.assign(notification.style, {
    position: 'fixed',
    bottom: '100px',
    right: '20px',
    padding: '16px 24px',
    background: type === 'success' ? 'linear-gradient(135deg, #38D9A9, #20C997)' : '#339AF0',
    color: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    zIndex: '9999',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    fontWeight: '500',
    animation: 'slideInUp 0.3s ease-out',
    transform: 'translateX(0)'
  });
  
  document.body.appendChild(notification);

  // Close button
  notification.querySelector('.notification-close').addEventListener('click', () => {
    removeNotification(notification);
  });

  // Auto remove after 5 seconds
  setTimeout(() => removeNotification(notification), 5000);
}

function removeNotification(notification) {
  notification.style.animation = 'fadeIn 0.3s ease-out reverse';
  setTimeout(() => notification.remove(), 300);
}

/**
 * Back to Top Button
 */
function initBackToTop() {
  const backToTopBtn = document.getElementById('backToTop');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * Smooth Scroll for Anchor Links
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

/**
 * Lazy Loading Images
 */
if ('loading' in HTMLImageElement.prototype) {
  // Native lazy loading supported
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    img.src = img.src;
  });
} else {
  // Fallback with Intersection Observer
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        imageObserver.unobserve(img);
      }
    });
  });

  lazyImages.forEach(img => imageObserver.observe(img));
}

/**
 * Performance: Request Idle Callback for non-critical tasks
 */
function runWhenIdle(callback) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback);
  } else {
    setTimeout(callback, 1);
  }
}

// Log initialization
console.log('🐾 Il Mondo di Ugo - Initialized successfully!');
