/**
 * IA & Design — O Novo Ciclo do Processo Criativo
 * Immersive scroll experience: particles, parallax,
 * dynamic gradients, fluid micro-interactions
 * Inspired by Reflect.app
 */
(function () {
  'use strict';

  /* -------------------------------------------------------
     PARTICLE SYSTEM
     Lightweight canvas-based particles that drift gently
     and respond subtly to scroll position.
     ------------------------------------------------------- */
  function initParticleSystem() {
    var canvas = document.getElementById('particle-canvas');
    if (!canvas) { return; }
    var ctx = canvas.getContext('2d');
    var particles = [];
    var scrollY = 0;
    var animFrame = 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Particle count based on screen size (performance-conscious)
    function getParticleCount() {
      var area = window.innerWidth * window.innerHeight;
      if (area < 500000) { return 50; }
      if (area < 1200000) { return 80; }
      return 120;
    }

    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticle() {
      var size = Math.random() * 3 + 1;
      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: size,
        baseSize: size,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.25 - 0.1,
        opacity: Math.random() * 0.5 + 0.2,
        baseOpacity: Math.random() * 0.5 + 0.2,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.015 + 0.005,
        // Depth layer: 0 = far (slower), 1 = near (faster)
        depth: Math.random()
      };
    }

    function initParticles() {
      particles = [];
      var count = getParticleCount();
      for (var i = 0; i < count; i++) {
        particles.push(createParticle());
      }
    }

    function draw() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      var w = window.innerWidth;
      var h = window.innerHeight;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        // Pulse size and opacity
        p.pulse += p.pulseSpeed;
        var pulseFactor = Math.sin(p.pulse) * 0.3 + 0.7;
        p.size = p.baseSize * pulseFactor;
        p.opacity = p.baseOpacity * (0.6 + pulseFactor * 0.4);

        // Movement: drift + subtle scroll influence
        var scrollInfluence = (scrollY * 0.02) * (1 - p.depth);
        p.x += p.speedX;
        p.y += p.speedY - scrollInfluence * 0.01;

        // Wrap around screen edges softly
        if (p.x < -10) { p.x = w + 10; }
        if (p.x > w + 10) { p.x = -10; }
        if (p.y < -10) { p.y = h + 10; }
        if (p.y > h + 10) { p.y = -10; }

        // Draw particle with glow for larger ones
        var r = Math.round(155 + (100 * p.depth));
        var g = Math.round(109 + (146 * p.depth));
        var b = 255;

        // Add soft glow for particles larger than 2px
        if (p.size > 2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (p.opacity * 0.15) + ')';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + p.opacity + ')';
        ctx.fill();
      }

      animFrame = requestAnimationFrame(draw);
    }

    // Track scroll for particle response
    window.addEventListener('scroll', function () {
      scrollY = window.pageYOffset || document.documentElement.scrollTop;
    }, { passive: true });

    window.addEventListener('resize', function () {
      resize();
      initParticles();
    });

    resize();
    initParticles();
    draw();

    // Return cleanup function
    return function () {
      cancelAnimationFrame(animFrame);
    };
  }


  /* -------------------------------------------------------
     DYNAMIC GRADIENT — orbs respond to scroll position
     Subtle color and position shifts as user scrolls
     ------------------------------------------------------- */
  function initDynamicGradient() {
    var orbs = document.querySelectorAll('.gradient-orb');
    if (!orbs.length) { return; }

    var ticking = false;

    function updateGradient() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? scrollTop / docHeight : 0;

      // Shift orb positions subtly based on scroll
      for (var i = 0; i < orbs.length; i++) {
        var orb = orbs[i];
        var speed = (i + 1) * 0.05;
        var yShift = scrollTop * speed * -0.15;
        var xShift = Math.sin(progress * Math.PI * 2 + i) * 30;

        orb.style.transform =
          'translate(' + xShift.toFixed(1) + 'px, ' + yShift.toFixed(1) + 'px) ' +
          'scale(' + (1 + Math.sin(progress * Math.PI + i * 0.5) * 0.08).toFixed(3) + ')';
      }

      // Adjust opacity based on which section type is visible
      var lightSections = document.querySelectorAll('.chapter--light');
      var isInLight = false;
      for (var j = 0; j < lightSections.length; j++) {
        var rect = lightSections[j].getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.5) {
          isInLight = true;
          break;
        }
      }

      // Reduce orb intensity during light sections but keep them visible
      var targetOpacity = isInLight ? 0.4 : 1;
      for (var k = 0; k < orbs.length; k++) {
        orbs[k].style.opacity = targetOpacity;
      }

      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateGradient);
        ticking = true;
      }
    }, { passive: true });

    updateGradient();
  }


  /* -------------------------------------------------------
     PARALLAX SCROLL
     Elements with data-parallax get subtle Y translation
     based on their scroll position relative to viewport
     ------------------------------------------------------- */
  function initParallax() {
    var elements = document.querySelectorAll('[data-parallax]');
    if (!elements.length) { return; }

    var ticking = false;

    function update() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var winH = window.innerHeight;

      for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        var rect = el.getBoundingClientRect();
        var center = rect.top + rect.height / 2;

        // Only apply parallax when element is near viewport
        if (center > -winH && center < winH * 2) {
          // How far from viewport center (normalized -1 to 1)
          var offset = (center - winH / 2) / winH;
          var yShift = offset * speed * -80;

          el.style.transform = 'translateY(' + yShift.toFixed(1) + 'px)';
        }
      }

      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }


  /* -------------------------------------------------------
     SPLIT TEXT
     ------------------------------------------------------- */
  function initSplitText() {
    var elements = document.querySelectorAll('[data-animate="split-words"]');
    elements.forEach(function (el) {
      splitWords(el, 0);
    });
  }

  function splitWords(parent, startIdx) {
    var nodes = Array.prototype.slice.call(parent.childNodes);
    var frag = document.createDocumentFragment();
    var idx = startIdx;

    nodes.forEach(function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (/^\s+$/.test(part)) {
            if (part.indexOf('\n') === -1) {
              var sp = document.createElement('span');
              sp.className = 'word-space';
              sp.textContent = ' ';
              frag.appendChild(sp);
            }
          } else if (part.length > 0) {
            var w = document.createElement('span');
            w.className = 'word';
            w.textContent = part;
            w.style.transitionDelay = (idx * 45) + 'ms';
            idx++;
            frag.appendChild(w);
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'BR') {
          frag.appendChild(node.cloneNode());
        } else {
          var clone = node.cloneNode(false);
          idx = recurse(node, clone, idx);
          frag.appendChild(clone);
        }
      }
    });

    parent.textContent = '';
    parent.appendChild(frag);
    return idx;
  }

  function recurse(src, target, idx) {
    Array.prototype.slice.call(src.childNodes).forEach(function (child) {
      if (child.nodeType === Node.TEXT_NODE) {
        child.textContent.split(/(\s+)/).forEach(function (part) {
          if (/^\s+$/.test(part)) {
            if (part.indexOf('\n') === -1) {
              var sp = document.createElement('span');
              sp.className = 'word-space';
              sp.textContent = ' ';
              target.appendChild(sp);
            }
          } else if (part.length > 0) {
            var w = document.createElement('span');
            w.className = 'word';
            w.textContent = part;
            w.style.transitionDelay = (idx * 45) + 'ms';
            idx++;
            target.appendChild(w);
          }
        });
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        if (child.tagName === 'BR') {
          target.appendChild(child.cloneNode());
        } else {
          var c = child.cloneNode(false);
          idx = recurse(child, c, idx);
          target.appendChild(c);
        }
      }
    });
    return idx;
  }


  /* -------------------------------------------------------
     SCROLL PROGRESS
     ------------------------------------------------------- */
  function initScrollProgress() {
    var fill = document.querySelector('.scroll-progress__fill');
    if (!fill) { return; }
    var ticking = false;

    function update() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      fill.style.width = (docHeight > 0 ? Math.min(scrollTop / docHeight * 100, 100) : 0) + '%';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }


  /* -------------------------------------------------------
     SCROLL ANIMATIONS (Intersection Observer)
     Enhanced with more organic reveal timing
     ------------------------------------------------------- */
  function initScrollAnimations() {
    var els = document.querySelectorAll('[data-animate], [data-stagger]');

    // Batch observer with staggered delay for nearby elements
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var animType = el.getAttribute('data-animate');

          // Small delay based on element position within viewport
          // Creates a natural cascade effect
          var rect = el.getBoundingClientRect();
          var viewportOffset = rect.top / window.innerHeight;
          var delay = Math.max(0, viewportOffset * 100);

          setTimeout(function () {
            if (animType === 'split-words') {
              el.classList.add('split-visible');
            } else {
              el.classList.add('visible');
            }
          }, delay);

          observer.unobserve(el);
        }
      });
    }, { rootMargin: '0px 0px -40px 0px', threshold: 0.1 });

    els.forEach(function (el) { observer.observe(el); });
  }


  /* -------------------------------------------------------
     CHAPTER NAV
     ------------------------------------------------------- */
  function initChapterNav() {
    var nav = document.querySelector('.chapter-nav');
    var dots = document.querySelectorAll('.chapter-dot');
    var chapters = document.querySelectorAll('[data-chapter]');
    if (!nav || !dots.length || !chapters.length) { return; }

    var shown = false;
    function checkVis() {
      var show = window.pageYOffset > window.innerHeight * 0.3;
      if (show !== shown) {
        nav.classList.toggle('chapter-nav--visible', show);
        shown = show;
      }
    }
    window.addEventListener('scroll', checkVis, { passive: true });
    checkVis();

    dots.forEach(function (d) {
      d.addEventListener('click', function () {
        var t = document.getElementById(d.getAttribute('data-target'));
        if (t) { t.scrollIntoView({ behavior: 'smooth' }); }
      });
    });

    chapters.forEach(function (ch) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.id;
            var light = entry.target.classList.contains('chapter--light');
            nav.classList.toggle('chapter-nav--on-light', light);
            dots.forEach(function (d) {
              d.classList.toggle('chapter-dot--active', d.getAttribute('data-target') === id);
            });
          }
        });
      }, { rootMargin: '-30% 0px -30% 0px', threshold: 0 }).observe(ch);
    });
  }


  /* -------------------------------------------------------
     KEYBOARD NAV
     ------------------------------------------------------- */
  function initKeyboardNav() {
    var slides = document.querySelectorAll('.slide--statement, .slide--content, .slide--hero');
    if (!slides.length) { return; }

    function current() {
      var y = window.pageYOffset + window.innerHeight / 2;
      for (var i = slides.length - 1; i >= 0; i--) {
        if (slides[i].offsetTop <= y) { return i; }
      }
      return 0;
    }

    document.addEventListener('keydown', function (e) {
      var idx;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        idx = Math.min(current() + 1, slides.length - 1);
        slides[idx].scrollIntoView({ behavior: 'smooth' });
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        idx = Math.max(current() - 1, 0);
        slides[idx].scrollIntoView({ behavior: 'smooth' });
      }
    });
  }


  /* -------------------------------------------------------
     DIAMOND DRAW
     ------------------------------------------------------- */
  function initDiamondDraw() {
    var vis = document.querySelector('.diamond-visual');
    if (!vis) { return; }
    var paths = vis.querySelectorAll('.diamond-path');
    paths.forEach(function (p) {
      var len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
    });

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          paths.forEach(function (p, i) {
            p.style.transition = 'stroke-dashoffset ' + (1.4 + i * 0.3) + 's cubic-bezier(0.16,1,0.3,1) ' + (i * 0.25) + 's';
            p.style.strokeDashoffset = '0';
          });
          obs.unobserve(vis);
        }
      });
    }, { threshold: 0.3 });
    obs.observe(vis);
  }


  /* -------------------------------------------------------
     ORBIT SEQUENCE
     ------------------------------------------------------- */
  function initOrbitSequence() {
    var container = document.querySelector('.orbit-container');
    if (!container) { return; }
    var tags = container.querySelectorAll('.orbit-tag');

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          tags.forEach(function (tag, i) {
            setTimeout(function () { tag.classList.add('orbit-tag--active'); }, 250 + i * 180);
          });
          obs.unobserve(container);
        }
      });
    }, { threshold: 0.3 });
    obs.observe(container);
  }


  /* -------------------------------------------------------
     SMOOTH SECTION COLOR TRANSITIONS
     Fade background subtly between dark/light sections
     by adjusting the immersive-bg opacity
     ------------------------------------------------------- */
  function initSectionColorTransitions() {
    var immersiveBg = document.querySelector('.immersive-bg');
    if (!immersiveBg) { return; }
    var ticking = false;

    function update() {
      var lightSections = document.querySelectorAll('.chapter--light');
      var isInLight = false;

      for (var i = 0; i < lightSections.length; i++) {
        var rect = lightSections[i].getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.6 && rect.bottom > window.innerHeight * 0.4) {
          isInLight = true;
          break;
        }
      }

      // Reduce background layer during light sections, keep it partially visible
      immersiveBg.style.opacity = isInLight ? '0.35' : '1';
      immersiveBg.style.transition = 'opacity 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }


  /* -------------------------------------------------------
     INIT
     ------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('[data-animate], [data-stagger]').forEach(function (el) {
        el.classList.add('visible');
        if (el.getAttribute('data-animate') === 'split-words') { el.classList.add('split-visible'); }
      });
      document.querySelectorAll('.orbit-tag').forEach(function (t) { t.classList.add('orbit-tag--active'); });
      document.querySelectorAll('.diamond-path').forEach(function (p) { p.style.strokeDashoffset = '0'; });
      initScrollProgress();
      initChapterNav();
      initKeyboardNav();
      return;
    }

    // Core systems
    initSplitText();
    initScrollProgress();
    initScrollAnimations();
    initChapterNav();
    initKeyboardNav();
    initDiamondDraw();
    initOrbitSequence();

    // Immersive enhancements
    initParticleSystem();
    initDynamicGradient();
    initParallax();
    initSectionColorTransitions();
  });
})();
