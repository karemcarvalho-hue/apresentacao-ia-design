/**
 * IA & Design — Presentation Deck
 * Horizontal slide navigation with premium transitions
 * Includes star particle system for cosmic atmosphere
 */
(function () {
  'use strict';

  /* -------------------------------------------------------
     STATE
     ------------------------------------------------------- */
  var currentIndex = 0;
  var isTransitioning = false;
  var totalSlides = 0;

  /* DOM references (set in init) */
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
     STAR PARTICLE SYSTEM
     Subtle floating dots simulating a deep star field.
     Very slow vertical drift, low opacity.
     ------------------------------------------------------- */
  function initStarCanvas() {
    var canvas = document.getElementById('starsCanvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var particles = [];
    var particleCount = 120;
    var animFrameId = null;

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

        /* Very slow upward drift */
        p.y -= p.speed;
        p.x += p.drift;

        /* Subtle twinkle */
        var twinkle = Math.sin(timestamp * p.twinkleSpeed + p.twinklePhase);
        var currentOpacity = p.opacity + twinkle * 0.08;
        if (currentOpacity < 0.05) currentOpacity = 0.05;

        /* Wrap around */
        if (p.y < -5) {
          p.y = canvas.height + 5;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -5) p.x = canvas.width + 5;
        if (p.x > canvas.width + 5) p.x = -5;

        /* Draw the star */
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200, 190, 255, ' + currentOpacity + ')';
        ctx.fill();
      }

      animFrameId = requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    animFrameId = requestAnimationFrame(draw);

    window.addEventListener('resize', function () {
      resize();
      createParticles();
    });
  }


  /* -------------------------------------------------------
     1. SPLIT TEXT ENGINE
     Wraps each word in <span class="word"> for per-word
     reveal animation. Preserves <br> and inner spans.
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
     2. CORE NAVIGATION — goToSlide
     Premium horizontal transition with content fade
     ------------------------------------------------------- */
  function goToSlide(index) {
    if (isTransitioning) return;
    if (index < 0 || index >= totalSlides) return;
    if (index === currentIndex) return;

    var prevIndex = currentIndex;
    var direction = index > prevIndex ? 1 : -1;
    isTransitioning = true;
    currentIndex = index;

    /* Reset animations on the previous slide */
    resetSlideAnimations(prevIndex);

    /* Move the track */
    track.style.transform = 'translateX(-' + (currentIndex * 100) + 'vw)';

    /* Update UI immediately */
    updateProgress();
    updateCounter();
    updateNavActive();
    updateArrows();

    /* Trigger animations on the new slide after the track transition */
    setTimeout(function () {
      activateSlideAnimations(currentIndex);
      isTransitioning = false;
    }, 720);

    /* Parallax glow on previous slide direction */
    applyGlowParallax(prevIndex, currentIndex);
  }

  function goNext() {
    goToSlide(currentIndex + 1);
  }

  function goPrev() {
    goToSlide(currentIndex - 1);
  }


  /* -------------------------------------------------------
     3. PROGRESS BAR
     ------------------------------------------------------- */
  function updateProgress() {
    if (!progressFill) return;
    var pct = totalSlides > 1 ? (currentIndex / (totalSlides - 1)) * 100 : 0;
    progressFill.style.width = Math.min(pct, 100) + '%';
  }


  /* -------------------------------------------------------
     4. SLIDE COUNTER
     ------------------------------------------------------- */
  function updateCounter() {
    if (!counterCurrent) return;
    counterCurrent.textContent = String(currentIndex + 1).padStart(2, '0');
  }


  /* -------------------------------------------------------
     5. SIDE NAV — active state
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
     6. ARROW VISIBILITY
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
     7. SLIDE ANIMATIONS
     Activates data-animate, data-stagger, etc. for a slide.
     ------------------------------------------------------- */
  function activateSlideAnimations(index) {
    var slide = slides[index];
    if (!slide) return;

    /* Activate VFX layer */
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

    /* Diamond draw */
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

    /* Orbit sequence */
    var orbitContainer = slide.querySelector('.orbit-container');
    if (orbitContainer) {
      var tags = orbitContainer.querySelectorAll('.orbit-tag');
      tags.forEach(function (tag, idx) {
        setTimeout(function () {
          tag.classList.add('orbit-tag--active');
        }, 350 + idx * 200);
      });
    }
  }


  /* -------------------------------------------------------
     7b. RESET SLIDE ANIMATIONS
     Removes visible classes so re-entry animates again.
     ------------------------------------------------------- */
  function resetSlideAnimations(index) {
    var slide = slides[index];
    if (!slide) return;

    /* Deactivate VFX layer */
    slide.classList.remove('vfx-active');

    var targets = slide.querySelectorAll(
      '[data-animate], [data-stagger], [data-stagger-scale]'
    );

    targets.forEach(function (el) {
      el.classList.remove('visible');
      el.classList.remove('split-visible');
    });

    /* Reset orbit tags */
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

    /* Reset neural network lines (re-hide for next visit) */
    var neuralLines = slide.querySelectorAll('.vfx-neural line');
    neuralLines.forEach(function (line) {
      var dash = line.style.getPropertyValue('--vfx-dash');
      if (dash) {
        line.style.transition = 'none';
        line.style.strokeDashoffset = dash;
        /* Force reflow for next activation */
        void line.offsetWidth;
        line.style.transition = '';
      }
    });

    /* Reset block connection lines */
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
     8. GLOW PARALLAX
     Subtle horizontal parallax of glow blobs based on
     slide transition direction.
     ------------------------------------------------------- */
  function applyGlowParallax(fromIdx, toIdx) {
    var direction = toIdx > fromIdx ? -1 : 1;

    /* Apply parallax offset to the target slide's glows */
    var targetSlide = slides[toIdx];
    if (!targetSlide) return;

    var glows = targetSlide.querySelectorAll('.slide__glow');
    glows.forEach(function (glow) {
      var isCenter = glow.classList.contains('slide__glow--center');
      var offset = direction * 50;

      /* Start offset */
      if (isCenter) {
        glow.style.transition = 'none';
        glow.style.transform = 'translate(calc(-50% + ' + offset + 'px), -50%)';
      } else {
        glow.style.transition = 'none';
        glow.style.transform = 'translateX(' + offset + 'px)';
      }

      /* Animate back to origin */
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
     9. DIAMOND SVG — init dasharray
     ------------------------------------------------------- */
  function initDiamondDraw() {
    var visual = document.querySelector('.diamond-visual');
    if (!visual) return;

    var paths = visual.querySelectorAll('.diamond-path');
    paths.forEach(function (path) {
      var length = path.getTotalLength();
      path.style.strokeDasharray = String(length);
      path.style.strokeDashoffset = String(length);
    });
  }


  /* -------------------------------------------------------
     10. CARD TILT EFFECT
     ------------------------------------------------------- */
  function initCardTilt() {
    var cards = document.querySelectorAll('.tool-card, .pillar-card');

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
     11. KEYBOARD NAVIGATION
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

      /* Hide hint after first key press */
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
     12. SIDE NAV CLICK
     ------------------------------------------------------- */
  function initSideNavClick() {
    navItems.forEach(function (item) {
      item.addEventListener('click', function () {
        var target = item.getAttribute('data-nav');
        /* Find first slide with this chapter */
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
     13. ARROW BUTTON CLICKS
     ------------------------------------------------------- */
  function initArrowNav() {
    if (prevArrow) {
      prevArrow.addEventListener('click', goPrev);
    }
    if (nextArrow) {
      nextArrow.addEventListener('click', goNext);
    }
  }


  /* -------------------------------------------------------
     14. TOUCH / SWIPE SUPPORT
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

      /* Only horizontal swipes (ignore vertical) */
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
     15. SHOW UI ELEMENTS
     Side nav is excluded — it only appears on screen tap/click.
     ------------------------------------------------------- */
  function showUI() {
    if (slideCounter) slideCounter.classList.add('slide-counter--visible');
    if (keyHint) keyHint.classList.add('key-hint--visible');
    if (prevArrow) prevArrow.classList.add('nav-arrow--visible');
    if (nextArrow) nextArrow.classList.add('nav-arrow--visible');
  }


  /* -------------------------------------------------------
     15b. SIDE NAV TOGGLE ON CLICK
     Shows on click/tap anywhere on the screen body,
     auto-hides after 3.5 seconds of inactivity.
     Clicking the nav itself keeps it open (resets timer).
     ------------------------------------------------------- */
  function initSideNavToggle() {
    if (!sideNav) return;

    var hideTimer = null;
    var NAV_TIMEOUT = 3500; /* ms */

    function showNav() {
      sideNav.classList.add('side-nav--visible');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(hideNav, NAV_TIMEOUT);
    }

    function hideNav() {
      sideNav.classList.remove('side-nav--visible');
      clearTimeout(hideTimer);
    }

    /* Click/tap on screen toggles the nav */
    document.addEventListener('click', function (e) {
      /* If clicking inside the nav, keep it open (reset timer) */
      if (sideNav.contains(e.target)) {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(hideNav, NAV_TIMEOUT);
        return;
      }

      /* If clicking nav arrows, ignore (don't toggle) */
      if (prevArrow && prevArrow.contains(e.target)) return;
      if (nextArrow && nextArrow.contains(e.target)) return;

      /* Toggle */
      if (sideNav.classList.contains('side-nav--visible')) {
        hideNav();
      } else {
        showNav();
      }
    });

    /* Also hide nav when navigating via keyboard */
    document.addEventListener('keydown', function () {
      if (sideNav.classList.contains('side-nav--visible')) {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(hideNav, NAV_TIMEOUT);
      }
    });
  }


  /* -------------------------------------------------------
     16. MOUSE WHEEL NAVIGATION (throttled)
     ------------------------------------------------------- */
  function initWheelNav() {
    var wheelTimeout = null;
    var lastWheelTime = 0;
    var wheelCooldown = 900; /* ms between allowed wheel navigations */

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
     17. VISUAL LAYERS — Atmospheric decorative elements
     Creates and injects SVG/div layers into specific slides.
     Activated via .vfx-active class on parent slide.
     ------------------------------------------------------- */
  function initVisualLayers() {
    var svgNS = 'http://www.w3.org/2000/svg';

    /* Helper: create an SVG element */
    function svgEl(tag, attrs) {
      var el = document.createElementNS(svgNS, tag);
      if (attrs) {
        for (var k in attrs) {
          if (attrs.hasOwnProperty(k)) {
            el.setAttribute(k, attrs[k]);
          }
        }
      }
      return el;
    }

    /* Helper: find slide by data-slide number */
    function getSlide(num) {
      return document.querySelector('.slide[data-slide="' + num + '"]');
    }


    /* ==== 1. SLIDE 1 — Neural Network ==== */
    (function () {
      var slide = getSlide(1);
      if (!slide) return;

      var wrapper = document.createElement('div');
      wrapper.className = 'vfx-neural';
      wrapper.setAttribute('aria-hidden', 'true');

      var svg = svgEl('svg', { viewBox: '0 0 800 400', preserveAspectRatio: 'xMidYMid meet' });

      /* Define node positions */
      var nodes = [
        /* Layer 1 (left) */
        { x: 80, y: 80 }, { x: 80, y: 200 }, { x: 80, y: 320 },
        /* Layer 2 */
        { x: 240, y: 60 }, { x: 240, y: 160 }, { x: 240, y: 260 }, { x: 240, y: 360 },
        /* Layer 3 */
        { x: 420, y: 100 }, { x: 420, y: 200 }, { x: 420, y: 300 },
        /* Layer 4 */
        { x: 580, y: 80 }, { x: 580, y: 200 }, { x: 580, y: 320 },
        /* Layer 5 (right) */
        { x: 720, y: 140 }, { x: 720, y: 260 }
      ];

      /* Define connections (index pairs) */
      var connections = [
        [0,3],[0,4],[1,3],[1,4],[1,5],[2,4],[2,5],[2,6],
        [3,7],[3,8],[4,7],[4,8],[4,9],[5,8],[5,9],[6,9],
        [7,10],[7,11],[8,10],[8,11],[8,12],[9,11],[9,12],
        [10,13],[10,14],[11,13],[11,14],[12,13],[12,14]
      ];

      /* Draw lines */
      connections.forEach(function (c) {
        var n1 = nodes[c[0]];
        var n2 = nodes[c[1]];
        var dx = n2.x - n1.x;
        var dy = n2.y - n1.y;
        var len = Math.sqrt(dx * dx + dy * dy);
        var line = svgEl('line', {
          x1: n1.x, y1: n1.y,
          x2: n2.x, y2: n2.y
        });
        line.style.setProperty('--vfx-dash', String(Math.round(len)));
        /* Stagger the drawing animation */
        line.style.transitionDelay = (c[0] * 0.08) + 's';
        svg.appendChild(line);
      });

      /* Draw nodes */
      nodes.forEach(function (n, idx) {
        var circle = svgEl('circle', {
          cx: n.x, cy: n.y, r: 3
        });
        circle.style.setProperty('--vfx-node-delay', (1.5 + idx * 0.1) + 's');
        svg.appendChild(circle);
      });

      wrapper.appendChild(svg);
      slide.insertBefore(wrapper, slide.firstChild);
    })();


    /* ==== 2. SLIDE 5 — Rotating Incomplete Circle (REMOVED) ==== */


    /* ==== 3. SLIDES 8 & 9 — Floating Logo Cluster ==== */
    /* Primarily on slide 9 (logo cloud) for maximum visual impact,
       lighter version on slide 8 (ansiedade text) as backdrop. */
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

      /* Slide 9 — primary, stronger presence */
      createCluster(9, 'vfx-logo-cluster--primary');
      /* Slide 8 — lighter backdrop */
      createCluster(8, 'vfx-logo-cluster--subtle');
    })();


    /* ==== 4. MICRO-ILLUSTRATIONS (REMOVED) ==== */


    /* ==== 5. SLIDE 18 — Connected Blocks ==== */
    (function () {
      var slide = getSlide(18);
      if (!slide) return;

      var wrapper = document.createElement('div');
      wrapper.className = 'vfx-blocks';
      wrapper.setAttribute('aria-hidden', 'true');

      var svg = svgEl('svg', { viewBox: '0 0 240 300', preserveAspectRatio: 'xMidYMid meet' });

      /* Blocks */
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
        var rect = svgEl('rect', attrs);
        svg.appendChild(rect);
      });

      /* Connection lines between blocks */
      var lineData = [
        { x1: 45, y1: 50, x2: 130, y2: 30 },
        { x1: 80, y1: 50, x2: 62, y2: 90 },
        { x1: 160, y1: 65, x2: 165, y2: 100 },
        { x1: 95, y1: 128, x2: 130, y2: 110 },
        { x1: 62, y1: 128, x2: 87, y2: 175 },
        { x1: 165, y1: 140, x2: 172, y2: 190 }
      ];

      lineData.forEach(function (l) {
        var dx = l.x2 - l.x1;
        var dy = l.y2 - l.y1;
        var len = Math.round(Math.sqrt(dx * dx + dy * dy));
        var line = svgEl('line', l);
        line.style.setProperty('--vfx-bl', String(len));
        line.style.transitionDelay = (lineData.indexOf(l) * 0.3 + 0.5) + 's';
        svg.appendChild(line);
      });

      wrapper.appendChild(svg);
      slide.insertBefore(wrapper, slide.firstChild);
    })();


    /* ==== 6. SLIDE 20 — Growing Central Light ==== */
    (function () {
      var slide = getSlide(20);
      if (!slide) return;

      var light = document.createElement('div');
      light.className = 'vfx-center-light';
      light.setAttribute('aria-hidden', 'true');
      slide.insertBefore(light, slide.firstChild);
    })();


    /* ==== 7. SLIDES 21 & 22 — Diagonal Light Sweep ==== */
    [21, 22].forEach(function (num) {
      var slide = getSlide(num);
      if (!slide) return;

      var sweep = document.createElement('div');
      sweep.className = 'vfx-sweep';
      sweep.setAttribute('aria-hidden', 'true');
      slide.insertBefore(sweep, slide.firstChild);
    });
  }


  /* -------------------------------------------------------
     INIT
     ------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Cache DOM */
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

    /* Update total counter */
    var totalEl = document.querySelector('.slide-counter__total');
    if (totalEl) {
      totalEl.textContent = String(totalSlides).padStart(2, '0');
    }

    /* Init star field (even with reduced motion, skip canvas) */
    if (!prefersReducedMotion) {
      initStarCanvas();
    }

    if (prefersReducedMotion) {
      /* Show everything immediately */
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
        slide.querySelectorAll('.diamond-path').forEach(function (p) {
          p.style.strokeDashoffset = '0';
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

    /* Normal init */
    initSplitText();
    initDiamondDraw();
    initCardTilt();
    initVisualLayers();

    /* Show UI after brief delay */
    setTimeout(function () {
      showUI();
      updateArrows();
    }, 400);

    /* Activate first slide animations */
    setTimeout(function () {
      activateSlideAnimations(0);
    }, 250);

    /* Update initial state */
    updateProgress();
    updateCounter();
    updateNavActive();

    /* Init interactions */
    initKeyboardNav();
    initSideNavClick();
    initArrowNav();
    initTouchNav();
    initWheelNav();
    initSideNavToggle();
  });
})();
