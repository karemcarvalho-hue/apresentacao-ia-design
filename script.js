/**
 * IA & Design — Presentation Deck
 * Scroll-snap driven animations & navigation
 */
(function () {
  'use strict';

  /* Total slide count (used for reference) */

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
            w.style.transitionDelay = (wordIndex * 40) + 'ms';
            wordIndex++;
            fragment.appendChild(w);
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'BR') {
          fragment.appendChild(node.cloneNode());
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
                  ws.style.transitionDelay = (wordIndex * 40) + 'ms';
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
     2. SCROLL PROGRESS BAR
     ------------------------------------------------------- */
  function initScrollProgress() {
    var fill = document.querySelector('.progress__fill');
    if (!fill) return;

    var ticking = false;

    function update() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      fill.style.width = Math.min(pct, 100) + '%';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }


  /* -------------------------------------------------------
     3. INTERSECTION OBSERVER FOR ANIMATIONS
     Triggers .visible / .split-visible on elements
     with data-animate, data-stagger, data-stagger-scale.
     ------------------------------------------------------- */
  function initScrollAnimations() {
    var targets = document.querySelectorAll(
      '[data-animate], [data-stagger], [data-stagger-scale]'
    );

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          if (el.getAttribute('data-animate') === 'words') {
            el.classList.add('split-visible');
          } else {
            el.classList.add('visible');
          }
          observer.unobserve(el);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.12
    });

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }


  /* -------------------------------------------------------
     4. SIDE NAVIGATION
     - Shows/hides based on scroll position
     - Tracks active chapter based on visible slides
     - Click to scroll to chapter's first slide
     ------------------------------------------------------- */
  function initSideNav() {
    var nav = document.querySelector('.side-nav');
    var items = document.querySelectorAll('.side-nav__item');
    var slides = document.querySelectorAll('.slide');
    var counter = document.querySelector('.slide-counter');
    var currentEl = document.querySelector('.slide-counter__current');
    var keyHint = document.querySelector('.key-hint');

    if (!nav || items.length === 0) return;

    var shown = false;

    function checkVisibility() {
      var scrollY = window.pageYOffset;
      if (scrollY > window.innerHeight * 0.25) {
        if (!shown) {
          nav.classList.add('side-nav--visible');
          if (counter) counter.classList.add('slide-counter--visible');
          if (keyHint) keyHint.classList.add('key-hint--visible');
          shown = true;
        }
      } else {
        if (shown) {
          nav.classList.remove('side-nav--visible');
          if (counter) counter.classList.remove('slide-counter--visible');
          if (keyHint) keyHint.classList.remove('key-hint--visible');
          shown = false;
        }
      }
    }

    window.addEventListener('scroll', checkVisibility, { passive: true });
    checkVisibility();

    // Click navigation
    items.forEach(function (item) {
      item.addEventListener('click', function () {
        var target = item.getAttribute('data-nav');
        var firstSlide = document.querySelector('[data-chapter="' + target + '"]');
        if (firstSlide) {
          firstSlide.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Track active chapter on scroll
    var slideObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var chapter = entry.target.getAttribute('data-chapter');
          var slideNum = entry.target.getAttribute('data-slide');

          // Update nav active state
          items.forEach(function (item) {
            if (item.getAttribute('data-nav') === chapter) {
              item.classList.add('side-nav__item--active');
            } else {
              item.classList.remove('side-nav__item--active');
            }
          });

          // Update counter
          if (currentEl && slideNum) {
            currentEl.textContent = slideNum.padStart(2, '0');
          }
        }
      });
    }, {
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0
    });

    slides.forEach(function (slide) {
      slideObserver.observe(slide);
    });
  }


  /* -------------------------------------------------------
     5. KEYBOARD NAVIGATION
     Arrow Up/Down navigate between slides.
     ------------------------------------------------------- */
  function initKeyboardNav() {
    var slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;

    function getCurrentSlideIndex() {
      var scrollY = window.pageYOffset + window.innerHeight / 2;
      for (var i = slides.length - 1; i >= 0; i--) {
        if (slides[i].offsetTop <= scrollY) return i;
      }
      return 0;
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        var next = Math.min(getCurrentSlideIndex() + 1, slides.length - 1);
        slides[next].scrollIntoView({ behavior: 'smooth' });
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        var prev = Math.max(getCurrentSlideIndex() - 1, 0);
        slides[prev].scrollIntoView({ behavior: 'smooth' });
      }
    });
  }


  /* -------------------------------------------------------
     6. DOUBLE DIAMOND SVG DRAW
     ------------------------------------------------------- */
  function initDiamondDraw() {
    var visual = document.querySelector('.diamond-visual');
    if (!visual) return;

    var paths = visual.querySelectorAll('.diamond-path');

    paths.forEach(function (path) {
      var length = path.getTotalLength();
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          paths.forEach(function (path, idx) {
            var length = path.getTotalLength();
            path.style.transition = 'stroke-dashoffset ' +
              (1.4 + idx * 0.3) + 's cubic-bezier(0.16, 1, 0.3, 1) ' +
              (idx * 0.25) + 's';
            path.style.strokeDashoffset = '0';
          });
          observer.unobserve(visual);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(visual);
  }


  /* -------------------------------------------------------
     7. ORBIT SEQUENTIAL ACTIVATION
     ------------------------------------------------------- */
  function initOrbitSequence() {
    var container = document.querySelector('.orbit-container');
    if (!container) return;

    var tags = container.querySelectorAll('.orbit-tag');

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          tags.forEach(function (tag, idx) {
            setTimeout(function () {
              tag.classList.add('orbit-tag--active');
            }, 300 + idx * 180);
          });
          observer.unobserve(container);
        }
      });
    }, { threshold: 0.3 });

    observer.observe(container);
  }


  /* -------------------------------------------------------
     8. GLOW PARALLAX
     Subtle movement of glow blobs based on scroll.
     ------------------------------------------------------- */
  function initGlowParallax() {
    var glows = document.querySelectorAll('.slide__glow');
    if (glows.length === 0) return;

    var ticking = false;

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          var scrollY = window.pageYOffset;

          glows.forEach(function (glow) {
            var slide = glow.closest('.slide');
            if (!slide) return;

            var slideTop = slide.offsetTop;
            var slideHeight = slide.offsetHeight;
            var relative = scrollY - slideTop;

            if (relative > -window.innerHeight && relative < slideHeight) {
              var progress = relative / slideHeight;
              var isCenter = glow.classList.contains('slide__glow--center');
              var offset = isCenter ? progress * 30 : progress * 50;
              var baseTransform = isCenter ? 'translate(-50%, -50%)' : '';

              if (isCenter) {
                glow.style.transform = 'translate(-50%, calc(-50% + ' + offset + 'px))';
              } else {
                glow.style.transform = 'translateY(' + offset + 'px)';
              }
            }
          });

          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }


  /* -------------------------------------------------------
     9. CARD TILT EFFECT
     ------------------------------------------------------- */
  function initCardTilt() {
    var cards = document.querySelectorAll('.tool-card, .pillar-card');

    cards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          'perspective(600px) rotateX(' + (y * -3) + 'deg) rotateY(' + (x * 3) + 'deg) translateY(-2px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s cubic-bezier(0.22, 1.36, 0.42, 0.99)';
        setTimeout(function () {
          card.style.transition = '';
        }, 500);
      });
    });
  }


  /* -------------------------------------------------------
     10. HIDE KEYBOARD HINT AFTER FIRST INTERACTION
     ------------------------------------------------------- */
  function initKeyHintAutoHide() {
    var hint = document.querySelector('.key-hint');
    if (!hint) return;

    var hidden = false;

    function hide() {
      if (!hidden) {
        hidden = true;
        setTimeout(function () {
          hint.style.opacity = '0';
          hint.style.transition = 'opacity 0.5s ease';
        }, 3000);
      }
    }

    document.addEventListener('keydown', hide, { once: true });

    var scrollCount = 0;
    window.addEventListener('scroll', function () {
      scrollCount++;
      if (scrollCount > 3) hide();
    }, { passive: true });
  }


  /* -------------------------------------------------------
     INIT
     ------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Show everything immediately
      document.querySelectorAll('[data-animate], [data-stagger], [data-stagger-scale]').forEach(function (el) {
        el.classList.add('visible');
        if (el.getAttribute('data-animate') === 'words') {
          el.classList.add('split-visible');
        }
      });
      document.querySelectorAll('.orbit-tag').forEach(function (t) {
        t.classList.add('orbit-tag--active');
      });
      document.querySelectorAll('.diamond-path').forEach(function (p) {
        p.style.strokeDashoffset = '0';
      });
      // Navigation still works
      initScrollProgress();
      initSideNav();
      initKeyboardNav();
      return;
    }

    initSplitText();
    initScrollProgress();
    initScrollAnimations();
    initSideNav();
    initKeyboardNav();
    initDiamondDraw();
    initOrbitSequence();
    initGlowParallax();
    initCardTilt();
    initKeyHintAutoHide();
  });
})();
