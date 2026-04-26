/**
 * Performance & Responsiveness Optimizations
 * Adds debouncing, lazy loading, and improved event handling
 */

(function() {
  "use strict";

  /**
   * Debounce function to optimize scroll events
   * Reduces the number of times expensive functions are called
   */
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  /**
   * Throttle function for scroll events
   * Ensures function runs at most once per specified interval
   */
  const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  /**
   * Lazy load images using Intersection Observer
   * Much more efficient than scroll listeners
   */
  const setupLazyLoading = () => {
    // Check if Intersection Observer is supported
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            
            // Load image
            if (img.dataset.src) {
              img.src = img.dataset.src;
            }
            
            // Remove loading animation
            img.classList.remove('loading');
            img.classList.add('loaded');
            
            // Stop observing
            observer.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px' // Start loading 50px before image comes into view
      });

      // Observe all lazy-load images
      document.querySelectorAll('img[loading="lazy"], img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  };

  /**
   * Responsive image setup
   * Monitors viewport changes for responsive image loading
   */
  const setupResponsiveImages = () => {
    if ('ResizeObserver' in window) {
      const images = document.querySelectorAll('img[data-srcset-mobile], img[data-srcset-tablet], img[data-srcset-desktop]');
      
      images.forEach(img => {
        const resizeObserver = new ResizeObserver(() => {
          const width = img.clientWidth;
          
          if (width < 480 && img.dataset.srcsetMobile) {
            img.src = img.dataset.srcsetMobile;
          } else if (width < 992 && img.dataset.srcsetTablet) {
            img.src = img.dataset.srcsetTablet;
          } else if (img.dataset.srcsetDesktop) {
            img.src = img.dataset.srcsetDesktop;
          }
        });
        
        resizeObserver.observe(img);
      });
    }
  };

  /**
   * Preload critical images
   */
  const preloadCriticalImages = () => {
    const criticalImages = [
      'assets/img/hero-logo.png',
      'assets/img/logo.png'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  };

  /**
   * Optimize scroll performance
   * Use throttled scroll listener instead of constant updates
   */
  const optimizeScrollPerformance = () => {
    const scrollHandler = throttle(() => {
      // Dispatch custom scroll event
      window.dispatchEvent(new CustomEvent('customScroll'));
    }, 100);

    window.addEventListener('scroll', scrollHandler, { passive: true });
  };

  /**
   * Defer non-critical AOS animations
   * Only enable AOS if not on a slow connection
   */
  const deferNonCriticalAnimations = () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        if (window.AOS) {
          AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            mirror: false,
            disable: () => {
              const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
              return mediaQuery.matches;
            }
          });
        }
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      window.addEventListener('load', () => {
        if (window.AOS) {
          AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            mirror: false
          });
        }
      });
    }
  };

  /**
   * Optimize Swiper carousels
   */
  const optimizeCarousels = () => {
    window.addEventListener('load', () => {
      // Defer Swiper initialization
      if (window.Swiper) {
        // Portfolio details slider
        const portfolioDetailsSlider = document.querySelector('.portfolio-details-slider');
        if (portfolioDetailsSlider) {
          new Swiper('.portfolio-details-slider', {
            speed: 300,
            loop: true,
            autoplay: {
              delay: 5000,
              disableOnInteraction: true
            },
            pagination: {
              el: '.swiper-pagination',
              type: 'bullets',
              clickable: true
            },
            observer: true,
            observeParents: true
          });
        }

        // Testimonials slider
        const testimonialsSlider = document.querySelector('.testimonials-slider');
        if (testimonialsSlider) {
          new Swiper('.testimonials-slider', {
            speed: 500,
            loop: true,
            autoplay: {
              delay: 5000,
              disableOnInteraction: true
            },
            slidesPerView: 'auto',
            pagination: {
              el: '.swiper-pagination',
              type: 'bullets',
              clickable: true
            },
            observer: true,
            observeParents: true
          });
        }
      }
    });
  };

  /**
   * Optimize lightbox
   */
  const optimizeLightbox = () => {
    window.addEventListener('load', () => {
      if (window.GLightbox) {
        GLightbox({
          selector: '.portfolio-lightbox',
          descPosition: 'bottom'
        });
      }
    });
  };

  /**
   * Setup passive event listeners for better scroll performance
   */
  const setupPassiveEventListeners = () => {
    // Listen to custom scroll event instead of native scroll
    window.addEventListener('customScroll', () => {
      // Navigation highlight on scroll
      updateActiveNavLinks();
      // Back to top button visibility
      updateBackToTopButton();
    }, { passive: true });
  };

  /**
   * Update active navigation links
   */
  const updateActiveNavLinks = () => {
    const navbarlinks = document.querySelectorAll('#navbar .scrollto');
    let position = window.scrollY + 200;

    navbarlinks.forEach(navbarlink => {
      if (!navbarlink.hash) return;
      let section = document.querySelector(navbarlink.hash);
      if (!section) return;

      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        navbarlink.classList.add('active');
      } else {
        navbarlink.classList.remove('active');
      }
    });
  };

  /**
   * Update back to top button visibility
   */
  const updateBackToTopButton = () => {
    const backtotop = document.querySelector('.back-to-top');
    if (backtotop) {
      if (window.scrollY > 100) {
        backtotop.classList.add('active');
      } else {
        backtotop.classList.remove('active');
      }
    }
  };

  /**
   * Optimize header fixed positioning
   */
  const optimizeHeaderFixed = () => {
    const selectHeader = document.querySelector('#header');
    if (!selectHeader) return;

    const headerOffset = selectHeader.offsetTop;
    const nextElement = selectHeader.nextElementSibling;

    const checkHeaderFixed = throttle(() => {
      if ((headerOffset - window.scrollY) <= 0) {
        selectHeader.classList.add('fixed-top');
        if (nextElement) nextElement.classList.add('scrolled-offset');
      } else {
        selectHeader.classList.remove('fixed-top');
        if (nextElement) nextElement.classList.remove('scrolled-offset');
      }
    }, 50);

    window.addEventListener('scroll', checkHeaderFixed, { passive: true });
    window.addEventListener('load', checkHeaderFixed);
  };

  /**
   * Setup smooth scroll behavior
   */
  const setupSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        const header = document.querySelector('#header');
        const offset = header ? header.offsetHeight : 0;
        const elementPos = target.offsetTop;

        window.scrollTo({
          top: elementPos - offset,
          behavior: 'smooth'
        });
      });
    });
  };

  /**
   * Monitor connection quality and adjust performance
   */
  const monitorConnection = () => {
    if ('connection' in navigator) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        const effectiveType = connection.effectiveType;
        const saveData = connection.saveData;

        if (effectiveType === '4g' && !saveData) {
          // Load animations and effects normally
          document.documentElement.setAttribute('data-connection', 'fast');
        } else {
          // Reduce animations for slower connections
          document.documentElement.setAttribute('data-connection', 'slow');
        }
      }
    }
  };

  /**
   * Initialize performance optimizations on DOM ready
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initPerformanceOptimizations();
    });
  } else {
    initPerformanceOptimizations();
  }

  function initPerformanceOptimizations() {
    // Run all optimizations
    setupLazyLoading();
    setupResponsiveImages();
    preloadCriticalImages();
    optimizeScrollPerformance();
    setupPassiveEventListeners();
    optimizeHeaderFixed();
    setupSmoothScroll();
    deferNonCriticalAnimations();
    optimizeCarousels();
    optimizeLightbox();
    monitorConnection();

    // Initialize on load
    window.addEventListener('load', () => {
      updateActiveNavLinks();
      updateBackToTopButton();
    });
  }

})();
