/**
 * Como Usar IA no Processo de Design — Na Prática
 * Horizontal slide navigation with premium transitions
 * Blue cosmic star particle system
 */
(function () {
  'use strict';

  var currentIndex = 0;
  var isTransitioning = false;
  var totalSlides = 0;

  var track = null;
  var slides = [];
  var navItems = [];
  var progressFill = null;
  var counterCurrent = null;
  var prevArrow = null;
  var nextArrow = null;
  var keyHint = null;
  var sideNav = null;
  var slideCounter = null;


  /* -------------------------------------------------------
     STAR PARTICLE SYSTEM (blue tint)
     ------------------------------------------------------- */
  function initStarCanvas() {
    var canvas = document.getElementById('starsCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var particles = [];
    var particleCount = 120;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticles() {
      particles = [];
      for (var i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.2 + 0.3,
          opacity: Math.random() * 0.25 + 0.1,
          speed: Math.random() * 0.15 + 0.05,
          drift: (Math.random() - 0.5) * 0.03,
          twinkleSpeed: Math.random() * 0.005 + 0.002,
          twinklePhase: Math.random() * Math.PI * 2
        });
      }
    }

    function draw(timestamp) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        p.y -= p.speed;
        p.x += p.drift;

        var twinkle = Math.sin(timestamp * p.twinkleSpeed + p.twinklePhase);
        var currentOpacity = p.opacity + twinkle * 0.08;
        if (currentOpacity < 0.05) currentOpacity = 0.05;

        if (p.y < -5) {
          p.y = canvas.height + 5;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -5) p.x = canvas.width + 5;
        if (p.x > canvas.width + 5) p.x = -5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(180, 210, 255, ' + currentOpacity + ')';
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    requestAnimationFrame(draw);

    window.addEventListener('resize', function () {
      resize();
      createParticles();
    });
  }


  /* -------------------------------------------------------
     SPLIT TEXT ENGINE
     ------------------------------------------------------- */
  function initSplitText() {
    var elements = document.querySelectorAll('[data-animate="words"]');
    elements.forEach(function (el) {
      splitWordsInNode(el);
    });
  }

  function splitWordsInNode(parentEl) {
    var childNodes = Array.prototype.slice.call(parentEl.childNodes);
    var fragment = document.createDocumentFragment();
    var wordIndex = 0;

    childNodes.forEach(function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        var words = node.textContent.split(/(\s+)/);
        words.forEach(function (part) {
          if (/^\s+$/.test(part)) {
            if (part.indexOf('\n') !== -1) return;
            var sp = document.createElement('span');
            sp.className = 'word-space';
            sp.textContent = ' ';
            fragment.appendChild(sp);
          } else if (part.length > 0) {
            var w = document.createElement('span');
            w.className = 'word';
            w.textContent = part;
            w.style.transitionDelay = (wordIndex * 45) + 'ms';
            wordIndex++;
            fragment.appendChild(w);
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'BR') {
          fragment.appendChild(node.cloneNode());
        } else if (node.classList && (node.classList.contains('gradient') || node.classList.contains('accent') || node.classList.contains('muted'))) {
          var styledClone = node.cloneNode(true);
          styledClone.classList.add('word');
          styledClone.style.transitionDelay = (wordIndex * 45) + 'ms';
          wordIndex++;
          fragment.appendChild(styledClone);
        } else {
          var clone = node.cloneNode(false);
          var innerNodes = Array.prototype.slice.call(node.childNodes);
          innerNodes.forEach(function (inner) {
            if (inner.nodeType === Node.TEXT_NODE) {
              var iw = inner.textContent.split(/(\s+)/);
              iw.forEach(function (part) {
                if (/^\s+$/.test(part)) {
                  if (part.indexOf('\n') !== -1) return;
                  var sp = document.createElement('span');
                  sp.className = 'word-space';
                  sp.textContent = ' ';
                  clone.appendChild(sp);
                } else if (part.length > 0) {
                  var ws = document.createElement('span');
                  ws.className = 'word';
                  ws.textContent = part;
                  ws.style.transitionDelay = (wordIndex * 45) + 'ms';
                  wordIndex++;
                  clone.appendChild(ws);
                }
              });
            } else {
              clone.appendChild(inner.cloneNode(true));
            }
          });
          fragment.appendChild(clone);
        }
      }
    });

    parentEl.textContent = '';
    parentEl.appendChild(fragment);
  }


  /* -------------------------------------------------------
     CORE NAVIGATION
     ------------------------------------------------------- */
  function goToSlide(index) {
    if (isTransitioning) return;
    if (index < 0 || index >= totalSlides) return;
    if (index === currentIndex) return;

    var prevIndex = currentIndex;
    isTransitioning = true;
    currentIndex = index;

    resetSlideAnimations(prevIndex);

    track.style.transform = 'translateX(-' + (currentIndex * 100) + 'vw)';

    updateProgress();
    updateCounter();
    updateNavActive();
    updateArrows();

    setTimeout(function () {
      activateSlideAnimations(currentIndex);
      isTransitioning = false;
    }, 720);

    applyGlowParallax(prevIndex, currentIndex);
  }

  function goNext() { goToSlide(currentIndex + 1); }
  function goPrev() { goToSlide(currentIndex - 1); }


  /* -------------------------------------------------------
     PROGRESS BAR
     ------------------------------------------------------- */
  function updateProgress() {
    if (!progressFill) return;
    var pct = totalSlides > 1 ? (currentIndex / (totalSlides - 1)) * 100 : 0;
    progressFill.style.width = Math.min(pct, 100) + '%';
  }


  /* -------------------------------------------------------
     SLIDE COUNTER
     ------------------------------------------------------- */
  function updateCounter() {
    if (!counterCurrent) return;
    counterCurrent.textContent = String(currentIndex + 1).padStart(2, '0');
  }


  /* -------------------------------------------------------
     SIDE NAV
     ------------------------------------------------------- */
  function updateNavActive() {
    if (navItems.length === 0) return;
    var chapter = slides[currentIndex].getAttribute('data-chapter');

    navItems.forEach(function (item) {
      if (item.getAttribute('data-nav') === chapter) {
        item.classList.add('side-nav__item--active');
      } else {
        item.classList.remove('side-nav__item--active');
      }
    });
  }


  /* -------------------------------------------------------
     ARROW VISIBILITY
     ------------------------------------------------------- */
  function updateArrows() {
    if (!prevArrow || !nextArrow) return;

    if (currentIndex === 0) {
      prevArrow.classList.add('nav-arrow--hidden');
    } else {
      prevArrow.classList.remove('nav-arrow--hidden');
    }

    if (currentIndex === totalSlides - 1) {
      nextArrow.classList.add('nav-arrow--hidden');
    } else {
      nextArrow.classList.remove('nav-arrow--hidden');
    }
  }


  /* -------------------------------------------------------
     SLIDE ANIMATIONS
     ------------------------------------------------------- */
  function activateSlideAnimations(index) {
    var slide = slides[index];
    if (!slide) return;

    slide.classList.add('vfx-active');

    var targets = slide.querySelectorAll(
      '[data-animate], [data-stagger], [data-stagger-scale]'
    );

    targets.forEach(function (el) {
      if (el.getAttribute('data-animate') === 'words') {
        el.classList.add('split-visible');
      } else {
        el.classList.add('visible');
      }
    });

    var orbitContainer = slide.querySelector('.orbit-container');
    if (orbitContainer) {
      var tags = orbitContainer.querySelectorAll('.orbit-tag');
      tags.forEach(function (tag, idx) {
        setTimeout(function () {
          tag.classList.add('orbit-tag--active');
        }, 350 + idx * 200);
      });
    }

    /* Diamond paths (if any) */
    var diamondVisual = slide.querySelector('.diamond-visual');
    if (diamondVisual) {
      var paths = diamondVisual.querySelectorAll('.diamond-path');
      paths.forEach(function (path, idx) {
        path.style.transition = 'stroke-dashoffset ' +
          (1.4 + idx * 0.3) + 's cubic-bezier(0.16, 1, 0.3, 1) ' +
          (idx * 0.25) + 's';
        path.style.strokeDashoffset = '0';
      });
    }
  }


  function resetSlideAnimations(index) {
    var slide = slides[index];
    if (!slide) return;

    slide.classList.remove('vfx-active');

    var targets = slide.querySelectorAll(
      '[data-animate], [data-stagger], [data-stagger-scale]'
    );

    targets.forEach(function (el) {
      el.classList.remove('visible');
      el.classList.remove('split-visible');
    });

    var orbitTags = slide.querySelectorAll('.orbit-tag');
    orbitTags.forEach(function (tag) {
      tag.classList.remove('orbit-tag--active');
    });

    /* Reset diamond paths */
    var paths = slide.querySelectorAll('.diamond-path');
    paths.forEach(function (path) {
      var length = path.getTotalLength();
      path.style.transition = 'none';
      path.style.strokeDashoffset = String(length);
    });

    /* Reset neural network lines */
    var neuralLines = slide.querySelectorAll('.vfx-neural line');
    neuralLines.forEach(function (line) {
      var dash = line.style.getPropertyValue('--vfx-dash');
      if (dash) {
        line.style.transition = 'none';
        line.style.strokeDashoffset = dash;
        void line.offsetWidth;
        line.style.transition = '';
      }
    });

    /* Reset connected block lines */
    var blockLines = slide.querySelectorAll('.vfx-blocks line');
    blockLines.forEach(function (line) {
      var bl = line.style.getPropertyValue('--vfx-bl');
      if (bl) {
        line.style.transition = 'none';
        line.style.strokeDashoffset = bl;
        void line.offsetWidth;
        line.style.transition = '';
      }
    });
  }


  /* -------------------------------------------------------
     GLOW PARALLAX
     ------------------------------------------------------- */
  function applyGlowParallax(fromIdx, toIdx) {
    var direction = toIdx > fromIdx ? -1 : 1;

    var targetSlide = slides[toIdx];
    if (!targetSlide) return;

    var glows = targetSlide.querySelectorAll('.slide__glow');
    glows.forEach(function (glow) {
      var isCenter = glow.classList.contains('slide__glow--center');
      var offset = direction * 50;

      if (isCenter) {
        glow.style.transition = 'none';
        glow.style.transform = 'translate(calc(-50% + ' + offset + 'px), -50%)';
      } else {
        glow.style.transition = 'none';
        glow.style.transform = 'translateX(' + offset + 'px)';
      }

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          glow.style.transition = 'transform 1000ms cubic-bezier(0.16, 1, 0.3, 1)';
          if (isCenter) {
            glow.style.transform = 'translate(-50%, -50%)';
          } else {
            glow.style.transform = 'translateX(0)';
          }
        });
      });
    });
  }


  /* -------------------------------------------------------
     CARD TILT EFFECT
     ------------------------------------------------------- */
  function initCardTilt() {
    var cards = document.querySelectorAll('.process-step, .handoff-card, .quality-card, .tool-card, .duality-card, .role-card');

    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          'perspective(600px) rotateX(' + (y * -3) + 'deg) rotateY(' + (x * 3) + 'deg) translateY(-8px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.transition = 'transform 0.6s cubic-bezier(0.22, 1.36, 0.42, 0.99)';
        setTimeout(function () {
          card.style.transition = '';
        }, 600);
      });
    });
  }


  /* -------------------------------------------------------
     KEYBOARD NAVIGATION
     ------------------------------------------------------- */
  function initKeyboardNav() {
    var hintHidden = false;

    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToSlide(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToSlide(totalSlides - 1);
      }

      if (!hintHidden && keyHint) {
        hintHidden = true;
        setTimeout(function () {
          keyHint.style.opacity = '0';
          keyHint.style.transition = 'opacity 0.5s ease';
        }, 2000);
      }
    });
  }


  /* -------------------------------------------------------
     SIDE NAV CLICK
     ------------------------------------------------------- */
  function initSideNavClick() {
    navItems.forEach(function (item) {
      item.addEventListener('click', function () {
        var target = item.getAttribute('data-nav');
        for (var i = 0; i < slides.length; i++) {
          if (slides[i].getAttribute('data-chapter') === target) {
            goToSlide(i);
            return;
          }
        }
      });
    });
  }


  /* -------------------------------------------------------
     ARROW BUTTON CLICKS
     ------------------------------------------------------- */
  function initArrowNav() {
    if (prevArrow) prevArrow.addEventListener('click', goPrev);
    if (nextArrow) nextArrow.addEventListener('click', goNext);
  }


  /* -------------------------------------------------------
     TOUCH / SWIPE SUPPORT
     ------------------------------------------------------- */
  function initTouchNav() {
    var startX = 0;
    var startY = 0;
    var threshold = 50;

    document.addEventListener('touchstart', function (e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
        if (dx < 0) {
          goNext();
        } else {
          goPrev();
        }
      }
    }, { passive: true });
  }


  /* -------------------------------------------------------
     SHOW UI
     ------------------------------------------------------- */
  function showUI() {
    if (slideCounter) slideCounter.classList.add('slide-counter--visible');
    if (keyHint) keyHint.classList.add('key-hint--visible');
    if (prevArrow) prevArrow.classList.add('nav-arrow--visible');
    if (nextArrow) nextArrow.classList.add('nav-arrow--visible');
  }


  /* -------------------------------------------------------
     SIDE NAV TOGGLE
     ------------------------------------------------------- */
  function initSideNavToggle() {
    if (!sideNav) return;

    var hideTimer = null;
    var NAV_TIMEOUT = 3500;

    function showNav() {
      sideNav.classList.add('side-nav--visible');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(hideNav, NAV_TIMEOUT);
    }

    function hideNav() {
      sideNav.classList.remove('side-nav--visible');
      clearTimeout(hideTimer);
    }

    document.addEventListener('click', function (e) {
      if (sideNav.contains(e.target)) {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(hideNav, NAV_TIMEOUT);
        return;
      }

      if (prevArrow && prevArrow.contains(e.target)) return;
      if (nextArrow && nextArrow.contains(e.target)) return;

      if (sideNav.classList.contains('side-nav--visible')) {
        hideNav();
      } else {
        showNav();
      }
    });

    document.addEventListener('keydown', function () {
      if (sideNav.classList.contains('side-nav--visible')) {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(hideNav, NAV_TIMEOUT);
      }
    });
  }


  /* -------------------------------------------------------
     MOUSE WHEEL NAVIGATION
     ------------------------------------------------------- */
  function initWheelNav() {
    var lastWheelTime = 0;
    var wheelCooldown = 900;

    document.addEventListener('wheel', function (e) {
      var now = Date.now();
      if (now - lastWheelTime < wheelCooldown) return;

      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        if (Math.abs(e.deltaY) > 30) {
          lastWheelTime = now;
          if (e.deltaY > 0) {
            goNext();
          } else {
            goPrev();
          }
        }
      } else {
        if (Math.abs(e.deltaX) > 30) {
          lastWheelTime = now;
          if (e.deltaX > 0) {
            goNext();
          } else {
            goPrev();
          }
        }
      }
    }, { passive: true });
  }


  /* -------------------------------------------------------
     INIT
     ------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    track = document.querySelector('.slides-track');
    slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
    navItems = Array.prototype.slice.call(document.querySelectorAll('.side-nav__item'));
    progressFill = document.querySelector('.progress__fill');
    counterCurrent = document.querySelector('.slide-counter__current');
    prevArrow = document.querySelector('.nav-arrow--prev');
    nextArrow = document.querySelector('.nav-arrow--next');
    keyHint = document.querySelector('.key-hint');
    sideNav = document.querySelector('.side-nav');
    slideCounter = document.querySelector('.slide-counter');
    totalSlides = slides.length;

    var totalEl = document.querySelector('.slide-counter__total');
    if (totalEl) {
      totalEl.textContent = String(totalSlides).padStart(2, '0');
    }

    if (!prefersReducedMotion) {
      initStarCanvas();
    }

    if (prefersReducedMotion) {
      slides.forEach(function (slide) {
        slide.querySelectorAll('[data-animate], [data-stagger], [data-stagger-scale]').forEach(function (el) {
          el.classList.add('visible');
          if (el.getAttribute('data-animate') === 'words') {
            el.classList.add('split-visible');
          }
        });
        slide.querySelectorAll('.orbit-tag').forEach(function (t) {
          t.classList.add('orbit-tag--active');
        });
      });
      showUI();
      updateArrows();
      initKeyboardNav();
      initSideNavClick();
      initArrowNav();
      initTouchNav();
      initWheelNav();
      initSideNavToggle();
      return;
    }

    initSplitText();
    initCardTilt();
    initVisualLayers();

    setTimeout(function () {
      showUI();
      updateArrows();
    }, 400);

    setTimeout(function () {
      activateSlideAnimations(0);
    }, 250);

    updateProgress();
    updateCounter();
    updateNavActive();

    initKeyboardNav();
    initSideNavClick();
    initArrowNav();
    initTouchNav();
    initWheelNav();
    initSideNavToggle();
  });


  /* -------------------------------------------------------
     VISUAL LAYERS — Floating logo cluster on tool slides
     ------------------------------------------------------- */
  function initVisualLayers() {
    var svgNS = 'http://www.w3.org/2000/svg';

    function svgEl(tag, attrs) {
      var el = document.createElementNS(svgNS, tag);
      if (attrs) {
        for (var k in attrs) {
          if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]);
        }
      }
      return el;
    }

    function getSlide(num) {
      return document.querySelector('.slide[data-slide="' + num + '"]');
    }


    /* ==== 1. SLIDE 1 — (Cover: clean, no VFX overlay) ==== */


    /* ==== 2. SLIDE 3 — Rotating Orbit Circle (Energia was slide 6, now 4) ==== */
    (function () {
      var slide = getSlide(4);
      if (!slide) return;

      var wrapper = document.createElement('div');
      wrapper.className = 'vfx-orbit-circle';
      wrapper.setAttribute('aria-hidden', 'true');

      var glow = document.createElement('div');
      glow.className = 'vfx-orbit-circle__glow';
      wrapper.appendChild(glow);

      var svg = svgEl('svg', { viewBox: '0 0 200 200' });
      var base = svgEl('circle', { cx: 100, cy: 100, r: 90, class: 'vfx-ring-base' });
      var ring = svgEl('circle', { cx: 100, cy: 100, r: 90, class: 'vfx-ring-glow' });
      svg.appendChild(base);
      svg.appendChild(ring);
      wrapper.appendChild(svg);

      slide.insertBefore(wrapper, slide.firstChild);
    })();


    /* ==== 3. SLIDES 6 & 7 — Floating Logo Cluster ==== */
    (function () {
      var tools = [
        { name: 'ChatGPT', layer: 'front', top: 5, left: 3 },
        { name: 'Claude', layer: 'mid', top: 8, left: 78 },
        { name: 'Gemini', layer: 'back', top: 3, left: 42 },
        { name: 'Perplexity', layer: 'front', top: 88, left: 72 },
        { name: 'Figma AI', layer: 'mid', top: 82, left: 8 },
        { name: 'v0', layer: 'back', top: 15, left: 88 },
        { name: 'Cursor', layer: 'front', top: 90, left: 38 },
        { name: 'Lovable', layer: 'mid', top: 10, left: 18 },
        { name: 'Granola', layer: 'back', top: 92, left: 58 },
        { name: 'NotebookLM', layer: 'mid', top: 6, left: 60 },
        { name: 'Runway', layer: 'front', top: 85, left: 85 },
        { name: 'Firefly', layer: 'back', top: 16, left: 92 },
        { name: 'Tome', layer: 'mid', top: 88, left: 22 },
        { name: 'Gamma', layer: 'back', top: 4, left: 30 },
        { name: 'Notion AI', layer: 'front', top: 92, left: 48 }
      ];

      var floatAnims = ['vfx-float-1', 'vfx-float-2', 'vfx-float-3', 'vfx-float-4', 'vfx-float-5', 'vfx-float-6'];
      var durations = { back: '18s', mid: '12s', front: '8s' };

      function createCluster(slideNum, extraClass) {
        var slide = getSlide(slideNum);
        if (!slide) return;

        var wrapper = document.createElement('div');
        wrapper.className = 'vfx-logo-cluster' + (extraClass ? ' ' + extraClass : '');
        wrapper.setAttribute('aria-hidden', 'true');

        tools.forEach(function (tool, idx) {
          var el = document.createElement('span');
          el.className = 'vfx-logo-float vfx-logo-float--' + tool.layer;
          el.textContent = tool.name;
          el.style.top = tool.top + '%';
          el.style.left = tool.left + '%';
          el.style.animationName = floatAnims[idx % floatAnims.length];
          el.style.animationDuration = durations[tool.layer];
          el.style.animationDelay = (idx * 0.4) + 's';
          wrapper.appendChild(el);
        });

        slide.insertBefore(wrapper, slide.firstChild);
      }

      createCluster(7, 'vfx-logo-cluster--primary');
      createCluster(6, 'vfx-logo-cluster--subtle');
    })();


    /* ==== 4. SLIDE 13 — Connected Blocks (Testes slide) ==== */
    (function () {
      var slide = getSlide(13);
      if (!slide) return;

      var wrapper = document.createElement('div');
      wrapper.className = 'vfx-blocks';
      wrapper.setAttribute('aria-hidden', 'true');

      var svg = svgEl('svg', { viewBox: '0 0 240 300', preserveAspectRatio: 'xMidYMid meet' });

      var blockData = [
        { x: 10, y: 10, w: 70, h: 40, glow: 'vfx-block-glow-1' },
        { x: 100, y: 30, w: 60, h: 35, glow: '' },
        { x: 30, y: 90, w: 65, h: 38, glow: 'vfx-block-glow-2' },
        { x: 130, y: 100, w: 70, h: 40, glow: '' },
        { x: 60, y: 175, w: 55, h: 35, glow: 'vfx-block-glow-3' },
        { x: 140, y: 190, w: 65, h: 38, glow: '' }
      ];

      blockData.forEach(function (b) {
        var attrs = { x: b.x, y: b.y, width: b.w, height: b.h };
        if (b.glow) attrs['class'] = b.glow;
        svg.appendChild(svgEl('rect', attrs));
      });

      var lineData = [
        { x1: 45, y1: 50, x2: 130, y2: 30 },
        { x1: 80, y1: 50, x2: 62, y2: 90 },
        { x1: 160, y1: 65, x2: 165, y2: 100 },
        { x1: 95, y1: 128, x2: 130, y2: 110 },
        { x1: 62, y1: 128, x2: 87, y2: 175 },
        { x1: 165, y1: 140, x2: 172, y2: 190 }
      ];

      lineData.forEach(function (l, i) {
        var dx = l.x2 - l.x1, dy = l.y2 - l.y1;
        var len = Math.round(Math.sqrt(dx * dx + dy * dy));
        var line = svgEl('line', l);
        line.style.setProperty('--vfx-bl', String(len));
        line.style.transitionDelay = (i * 0.3 + 0.5) + 's';
        svg.appendChild(line);
      });

      wrapper.appendChild(svg);
      slide.insertBefore(wrapper, slide.firstChild);
    })();


    /* ==== 5. SLIDE 22 — Central Light ==== */
    (function () {
      var slide = getSlide(22);
      if (!slide) return;

      var light = document.createElement('div');
      light.className = 'vfx-center-light';
      light.setAttribute('aria-hidden', 'true');
      slide.insertBefore(light, slide.firstChild);
    })();


    /* ==== 6. SLIDES 25 & 26 — Diagonal Light Sweep ==== */
    [25, 26].forEach(function (num) {
      var slide = getSlide(num);
      if (!slide) return;

      var sweep = document.createElement('div');
      sweep.className = 'vfx-sweep';
      sweep.setAttribute('aria-hidden', 'true');
      slide.insertBefore(sweep, slide.firstChild);
    });
  }


  /* ================================================================
     i18n — PT-BR / ES-AR language toggle
     ================================================================ */
  (function initI18n() {
    var currentLang = 'pt';
    var ptCache = {};

    var rules = [
      // [slideNum, selectorWithinSlide, index, esHTML]
      // --- Side nav & UI (handled separately) ---

      // --- SLIDE 1 — Cover ---
      [1, '.badge', 0, '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> En la Práctica'],
      [1, '.title', 0, 'Cómo usar IA en el<br /><span class="gradient">proceso de Design</span>'],
      [1, '.body-text', 0, 'Ejemplos reales, herramientas para usar en el día a día<br />y cómo la IA se integra en cada etapa del proceso.'],

      // --- SLIDE 2 — Combinado ---
      [2, '.subtitle', 0, 'Antes de empezar,<br />un <span class="gradient">acuerdo.</span>'],
      [2, '.body-text', 0, 'Vamos a hacer pausas a lo largo de la presentación para poner manos a la obra.'],
      [2, '.combinado-card__title', 0, 'Pausa'],
      [2, '.combinado-card__desc', 0, 'Voy a pausar en puntos clave para que practiquen.'],
      [2, '.combinado-card__title', 1, 'Salas en grupo'],
      [2, '.combinado-card__desc', 1, 'El equipo se divide en salas para compartir aprendizajes entre sí.'],
      [2, '.combinado-card__title', 2, 'Compartir'],
      [2, '.combinado-card__desc', 2, 'Cada grupo trae al menos 1 ejemplo para compartir con todos.'],

      // --- SLIDE 3 — Design é Circular ---
      [3, '.badge', 0, '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Proceso'],
      [3, '.subtitle', 0, 'El diseño real nunca fue lineal.<br /><span class="gradient">Siempre fue circular.</span>'],
      [3, '.orbit-tag', 0, 'Descubrir'],
      [3, '.orbit-tag', 1, 'Testear'],
      [3, '.orbit-tag', 2, 'Ajustar'],
      [3, '.orbit-tag', 3, 'Aprender'],
      [3, '.orbit-tag', 4, 'Refinar'],

      // --- SLIDE 4 — Energia ---
      [4, '.subtitle', 0, 'Si el diseño es circular,<br />necesita <span class="gradient">energía constante.</span>'],
      [4, '.body-text', 0, 'Lo que siempre rompió el ciclo<br />fueron las tareas operacionales.'],

      // --- SLIDE 5 — Ponte ---
      [5, '.subtitle', 0, 'Entonces viene la IA y promete resolver<br /><span class="gradient">todo lo operacional.</span>'],
      [5, '.body-text', 0, '¡Vamos a buscar las herramientas!'],

      // --- SLIDE 6 — Ansiedade ---
      [6, '.title', 0, 'Estamos viviendo una<br /><span class="gradient">ansiedad de herramientas.</span>'],
      [6, '.body-text', 0, 'Cada semana nace una nueva.<br />Cada semana alguien publica <span class="accent">"esta va a reemplazar a los diseñadores"</span>.'],
      [6, '.anxiety-step', 0, 'Y probamos.'],
      [6, '.anxiety-step', 1, 'Y descargamos.'],
      [6, '.anxiety-step', 2, 'Y creamos cuenta.'],
      [6, '.anxiety-step', 3, 'Y abandonamos.'],

      // --- SLIDE 7 — Logo Cloud ---
      [7, '.subtitle', 0, 'Pero es imposible <span class="gradient">usar todo.</span>'],
      [7, '.body-text', 0, 'Tenemos que entender qué tiene sentido<br /><span class="accent">en cada proceso.</span>'],

      // --- SLIDE 8 — Transição ---
      [8, '.subtitle', 0, 'Necesitamos entender qué herramientas de IA<br /><span class="gradient">tienen sentido en nuestro proceso.</span>'],
      [8, '.body-text', 0, 'Son muchas. Probar, elegir, experimentar.<br />Y es acá donde la <span class="accent">IA cambia el juego.</span>'],
      [8, '.cycle-step', 1, '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> Pruebas &amp; Iteración'],

      // --- SLIDE 9 — Discovery compare ---
      [9, '.subtitle', 0, 'Donde la IA <span class="gradient">cambia el juego</span>'],
      [9, '.compare-label', 0, 'Antes'],
      [9, '.pain-item span', 0, 'Entrevistas largas'],
      [9, '.pain-item span', 1, 'Transcripción manual'],
      [9, '.pain-item span', 2, 'Murales infinitos'],
      [9, '.pain-item span', 3, 'Síntesis demorada'],
      [9, '.compare-label', 1, 'Ahora con IA'],
      [9, '.tool-card__desc', 0, 'Transcripción inteligente de entrevistas'],
      [9, '.tool-card__desc', 1, 'Síntesis e hipótesis de investigación'],
      [9, '.tool-card__desc', 2, 'Organización automática de insights'],
      [9, '.tool-card__badge', 1, 'Ideación'],
      [9, '.tool-card__badge', 2, 'Estructuración'],

      // --- SLIDE 10 — Exemplo Prático Discovery ---
      [10, '.title', 0, 'Ejemplo <span class="gradient">Práctico</span>'],
      [10, '.body-text', 0, 'Cómo apliqué IA en este escenario — contenido en vivo'],
      [10, '.demo-card__title', 0, 'Panel de Chat'],
      [10, '.demo-card__desc', 0, 'Entrevistas con merchants e insights de investigación'],
      [10, '.demo-card__title', 1, 'Análisis Cualitativo'],
      [10, '.demo-card__desc', 1, '3.902 conversaciones reales analizadas con IA'],
      [10, '.demo-card__desc', 2, 'Roadmap visual Q1–Q2 2026 basado en datos'],

      // --- SLIDE 11 — Trigger Discovery ---
      [11, '.trigger-card__title', 0, '¿Y ustedes?<br /><span class="gradient">¿Dónde la IA entra en su discovery?</span>'],
      [11, '.trigger-card__sub', 0, 'Herramientas, procesos, experimentos… ¡Compartan!'],

      // --- SLIDE 12 — Discovery Frase + Pilar 1 ---
      [12, '.subtitle', 0, 'El discovery deja de ser un cuello de botella<br /><span class="gradient">y se convierte en flujo continuo de aprendizaje.</span>'],
      [12, '.body-text', 0, 'Y potencia nuestro pilar:'],
      [12, '.pilar-card__title', 0, '<span class="gradient">Entender problemas</span>'],
      [12, '.pilar-card__desc', 0, 'Cada vez que decidimos atacar un problema, tenemos que entenderlo perfectamente. Nuestra solución será tan buena como el entendimiento que tengamos del problema.'],

      // --- SLIDE 13 — Testes compare ---
      [13, '.badge', 0, '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Pruebas &amp; Iteración'],
      [13, '.subtitle', 0, 'Testear deja de ser un evento.<br /><span class="gradient">Y se convierte en un hábito.</span>'],
      [13, '.pain-item span', 0, 'Pruebas escasas'],
      [13, '.pain-item span', 1, 'Simulaciones limitadas'],
      [13, '.pain-item span', 2, 'Iteraciones lentas'],
      [13, '.compare-label', 1, 'Ahora'],
      [13, '.feature-item span', 0, 'Creación rápida de escenarios'],
      [13, '.feature-item span', 1, 'Ajustes frecuentes'],
      [13, '.feature-item span', 2, 'Exploración de alternativas'],
      [13, '.feature-item span', 3, 'Pruebas conceptuales antes del dev pesado'],

      // --- SLIDE 14 — Exemplo Prático Testes ---
      [14, '.badge', 0, 'Pruebas &amp; Iteración'],
      [14, '.title', 0, 'Ejemplo <span class="gradient">Práctico</span>'],
      [14, '.body-text', 0, 'Cómo apliqué IA en este escenario — contenido en vivo'],
      [14, '.demo-card__desc', 0, 'POC Statistics — conversaciones reales con merchants'],
      [14, '.demo-card__desc', 1, 'Métricas y datos visuales de Lumi'],

      // --- SLIDE 15 — Pausa Testes ---
      [15, '.trigger-card__title', 0, '¿Y ustedes?<br /><span class="gradient">¿Cómo testean e iteran con IA?</span>'],
      [15, '.trigger-card__sub', 0, 'Prototipos, validaciones, experimentos… ¡Compartan!'],

      // --- SLIDE 16 — Frase + Pilar 2 ---
      [16, '.subtitle', 0, 'La IA ayuda a salir de lo abstracto<br /><span class="gradient">más temprano.</span>'],
      [16, '.body-text', 0, 'Y potencia nuestro pilar:'],
      [16, '.pilar-card__title', 0, '<span class="gradient">Encantar con soluciones</span>'],
      [16, '.pilar-card__desc', 0, 'Una vez que tenemos el problema muy claro, tenemos que entender y testear todas las posibles soluciones para el mismo problema y profundizar en una que encante a las personas.'],

      // --- SLIDE 17 — Delivery compare ---
      [17, '.subtitle', 0, 'El delivery no cierra el diseño.<br /><span class="gradient">Alimenta el próximo ciclo.</span>'],
      [17, '.pain-item span', 0, 'Handoff como fin del proceso'],
      [17, '.pain-item span', 1, 'Retrabajo'],
      [17, '.pain-item span', 2, 'Ajustes tardíos'],
      [17, '.compare-label', 1, 'Ahora con IA'],
      [17, '.feature-item span', 0, 'Explorar interacciones antes de la entrega'],
      [17, '.feature-item span', 1, 'Refinar microinteracciones'],
      [17, '.feature-item span', 2, 'QA visual más inteligente'],
      [17, '.feature-item span', 3, 'Ajustes rápidos antes de producción'],

      // --- SLIDE 18 — Handoff cards ---
      [18, '.subtitle', 0, 'Documento de <span class="gradient">handoff</span>'],
      [18, '.handoff-card h3', 0, 'Specs detalladas'],
      [18, '.handoff-card p', 0, 'IA genera specs de componentes, estados, edge cases'],
      [18, '.handoff-card h3', 1, 'Prototipo navegable'],
      [18, '.handoff-card p', 1, 'Deploy real para que el equipo sienta el producto antes del dev'],
      [18, '.handoff-card h3', 2, 'Contexto de decisión'],
      [18, '.handoff-card p', 2, 'Documenta los porqués, no solo los qués'],

      // --- SLIDE 19 — Exemplo Prático Delivery ---
      [19, '.title', 0, 'Ejemplo <span class="gradient">Práctico</span>'],
      [19, '.body-text', 0, 'Cómo apliqué IA en este escenario — contenido en vivo'],
      [19, '.demo-card__desc', 0, 'Especificación visual de la card de pedidos'],
      [19, '.demo-card__desc', 1, 'Artefacto de decisión para el Design System'],
      [19, '.demo-card__desc', 2, 'Estandarización de acciones masivas'],

      // --- SLIDE 20 — Trigger Delivery ---
      [20, '.trigger-card__title', 0, '¿Cómo es el <span class="gradient">delivery en su equipo?</span>'],
      [20, '.trigger-card__sub', 0, '¿Qué funciona? ¿Qué genera retrabajo? Intercambiemos.'],

      // --- SLIDE 21 — Pilar 3 ---
      [21, '.subtitle', 0, 'El delivery no cierra el diseño.<br /><span class="gradient">Alimenta el próximo ciclo.</span>'],
      [21, '.body-text', 0, 'Y potencia nuestro pilar:'],
      [21, '.pilar-card__title', 0, '<span class="gradient">Agregar valor rápidamente</span>'],
      [21, '.pilar-card__desc', 0, 'Una vez que diseñamos una solución que encanta, tenemos que lanzar esa solución lo más rápido posible.'],

      // --- SLIDE 22 — Não é sobre ferramentas ---
      [22, '.badge', 0, '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> El Core'],
      [22, '.subtitle', 0, 'Pero no se trata de<br /><span class="gradient">las herramientas.</span>'],
      [22, '.core-denial-card span', 0, 'El prompt perfecto'],
      [22, '.core-denial-card span', 1, 'La herramienta de moda'],
      [22, '.core-denial-card span', 2, 'Automatizar todo'],
      [22, '.body-text', 0, 'Si fuera así, <span class="accent">bastaría copiar y pegar.</span>'],

      // --- SLIDE 23 — O que importa ---
      [23, '.subtitle', 0, 'Lo que realmente<br /><span class="gradient">importa.</span>'],
      [23, '.core-action-card span', 0, 'Entender problemas'],
      [23, '.core-action-card span', 1, 'Encantar con soluciones'],
      [23, '.core-action-card span', 2, 'Agregar valor rápidamente'],
      [23, '.body-text', 0, 'La IA no crea método.<br /><span class="accent" style="font-weight: 600;">Lo amplifica.</span>'],

      // --- SLIDE 24 — Cada designer ---
      [24, '.subtitle', 0, 'Cada diseñador<br /><span class="gradient">construye el suyo.</span>'],
      [24, '.duality-card__label', 0, 'No existe'],
      [24, '.duality-card__item', 0, 'Flujo universal'],
      [24, '.duality-card__item', 1, 'Stack perfecto'],
      [24, '.duality-card__item', 2, 'Prompt ideal'],
      [24, '.duality-card__label', 1, 'Existe'],
      [24, '.duality-card__item', 3, 'Contexto'],
      [24, '.duality-card__item', 4, 'Repertorio'],
      [24, '.duality-card__item', 5, 'Madurez'],

      // --- SLIDE 25 — Menos executor ---
      [25, '.badge', 0, '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Nuevo Rol'],
      [25, '.subtitle', 0, 'Menos ejecutor.<br /><span class="gradient">Más estratega.</span>'],
      [25, '.role-card__title', 0, 'Lectura de contexto'],
      [25, '.role-card__desc', 0, 'Ver más allá del briefing'],
      [25, '.role-card__title', 1, 'Decisión consciente'],
      [25, '.role-card__desc', 1, 'Elegir con criterio, no con apuro'],
      [25, '.role-card__title', 2, '<span class="gradient">Impacto real</span>'],
      [25, '.role-card__desc', 2, 'Diseño que cambia resultados'],

      // --- SLIDE 26 — Fechamento ---
      [26, '.badge', 0, '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Cierre'],
      [26, '.title', 0, 'La IA cuida lo operacional.<br /><span class="gradient">El diseñador cuida el impacto.</span>'],
      [26, '.body-text', 0, 'Cuanto menos tiempo ejecutando tareas repetitivas,<br />más espacio para hacer <span class="gradient">diseño de verdad.</span>'],
      [26, '.footer-text', 0, 'Cómo Usar IA en el Proceso de Design — Karem Carvalho']
    ];

    var dataI18nRules = {
      'nav-abertura': 'Apertura',
      'nav-processo': 'Proceso',
      'nav-testes': 'Pruebas &amp; Iteración',
      'nav-novo-papel': 'Nuevo Rol',
      'nav-fechamento': 'Cierre',
      'nav-hint': 'navegar',
      's9-pain3': 'Murales infinitos'
    };

    var dataI18nPtCache = {};

    function cacheAndApply(lang) {
      rules.forEach(function(r) {
        var slideNum = r[0], sel = r[1], idx = r[2], esHTML = r[3];
        var slide = document.querySelector('[data-slide="' + slideNum + '"]');
        if (!slide) return;
        var els = slide.querySelectorAll(sel);
        var el = els[idx];
        if (!el) return;

        var cacheKey = slideNum + '|' + sel + '|' + idx;
        if (!ptCache[cacheKey]) {
          ptCache[cacheKey] = el.innerHTML;
        }

        if (lang === 'es') {
          el.innerHTML = esHTML;
        } else {
          el.innerHTML = ptCache[cacheKey];
        }
      });

      document.querySelectorAll('[data-i18n]').forEach(function(el) {
        var key = el.getAttribute('data-i18n');
        if (!dataI18nPtCache[key]) {
          dataI18nPtCache[key] = el.innerHTML;
        }
        if (lang === 'es' && dataI18nRules[key]) {
          el.innerHTML = dataI18nRules[key];
        } else if (lang === 'pt' && dataI18nPtCache[key]) {
          el.innerHTML = dataI18nPtCache[key];
        }
      });

      document.documentElement.lang = lang === 'es' ? 'es-AR' : 'pt-BR';
      document.title = lang === 'es'
        ? 'Cómo Usar IA en el Proceso de Design — En la Práctica'
        : 'Como Usar IA no Processo de Design — Na Prática';
    }

    var btns = document.querySelectorAll('.lang-toggle__btn');
    btns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var lang = btn.getAttribute('data-lang');
        if (lang === currentLang) return;
        currentLang = lang;
        btns.forEach(function(b) { b.classList.remove('lang-toggle__btn--active'); });
        btn.classList.add('lang-toggle__btn--active');
        cacheAndApply(lang);
      });
    });
  })();

})();
