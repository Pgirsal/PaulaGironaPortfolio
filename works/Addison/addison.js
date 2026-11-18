/* addison.js — Inverse dual-column scroll
   =========================================

   MATH
   ────
   columnH    = viewport height − header height  (the visible clip area)
   leftTravel = max(0, leftInner.scrollHeight  − columnH)
   rightTravel= max(0, rightInner.scrollHeight − columnH)
   scrollMax  = max(leftTravel, rightTravel)      → runway height

   progress   = clamp(scrollY / scrollMax, 0, 1)

   LEFT  (text, moves UP):
     translateY(−progress × leftTravel)
     0 → −leftTravel   (top of text first, bottom last)

   RIGHT (images, starts at BOTTOM, moves DOWN to reveal earlier images):
     translateY(rightTravel × (progress − 1))
     −rightTravel → 0  (bottom images first, top images last)

   Because leftTravel < rightTravel, text scrolls proportionally
   slower. Both complete their journey at progress = 1.
   ========================================================= */

(function () {
  'use strict';

  /* Smooth blur-fade transition when navigating back to index */
  const backLink = document.querySelector('.logo');
  if (backLink) {
    backLink.addEventListener('click', function (e) {
      e.preventDefault();
      document.body.classList.add('page-exit');
      setTimeout(function () { window.location.href = backLink.href; }, 480);
    });
  }
  window.addEventListener('pageshow', function () {
    document.body.classList.remove('page-exit');
  });

  /* ── Video Lightbox Overlay & Cursor Badge ─────────────── */
  const finalVideo = document.getElementById('final-video');
  const cursorBadge = document.getElementById('cursor-badge');
  const videoOverlay = document.getElementById('video-overlay');
  const videoBackdrop = document.getElementById('video-overlay-backdrop');
  const videoCloseBtn = document.getElementById('video-overlay-close');
  const videoPlayer = document.getElementById('video-overlay-player');

  if (finalVideo && cursorBadge && videoOverlay && videoPlayer) {
    window.addEventListener('mousemove', function (e) {
      cursorBadge.style.left = e.clientX + 'px';
      cursorBadge.style.top = e.clientY + 'px';
      if (videoOverlay.classList.contains('visible')) {
        cursorBadge.classList.remove('visible');
        return;
      }
      const r = finalVideo.getBoundingClientRect();
      const hit = e.clientX >= r.left && e.clientX <= r.right &&
                  e.clientY >= r.top && e.clientY <= r.bottom;
      cursorBadge.classList.toggle('visible', hit);
    }, { passive: true });

    function openVideoModal() {
      cursorBadge.classList.remove('visible');
      videoOverlay.setAttribute('aria-hidden', 'false');
      videoOverlay.classList.add('visible');
      videoBackdrop.classList.add('visible');
      videoPlayer.currentTime = 0;
      videoPlayer.muted = false;
      videoPlayer.play();
    }

    function closeVideoModal() {
      videoPlayer.pause();
      videoOverlay.setAttribute('aria-hidden', 'true');
      videoOverlay.classList.remove('visible');
      videoBackdrop.classList.remove('visible');
    }

    finalVideo.addEventListener('click', openVideoModal);
    videoCloseBtn.addEventListener('click', closeVideoModal);
    videoOverlay.addEventListener('click', function (e) {
      if (e.target === videoOverlay) closeVideoModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && videoOverlay.classList.contains('visible')) closeVideoModal();
    });
  }

  /* ── Cute Star & Flower Cursor Trail ───────────────────── */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const glyphs = ['✦', '✿', '✧', '❀', '⋆'];
    let lastSparkX = 0, lastSparkY = 0;
    window.addEventListener('mousemove', function (e) {
      if (cursorBadge && cursorBadge.classList.contains('visible')) return;
      const dx = e.clientX - lastSparkX, dy = e.clientY - lastSparkY;
      if (dx * dx + dy * dy < 1100) return;
      lastSparkX = e.clientX;
      lastSparkY = e.clientY;
      const el = document.createElement('span');
      el.className = 'cursor-spark';
      el.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      el.style.left = (e.clientX + (Math.random() * 18 - 9)) + 'px';
      el.style.top = (e.clientY + (Math.random() * 18 - 9)) + 'px';
      document.body.appendChild(el);
      el.addEventListener('animationend', function () { el.remove(); });
    }, { passive: true });
  }

  /* Skip on mobile — CSS disables the fixed layout */
  if (window.innerWidth <= 600) return;

  /* Skip for reduced-motion */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ── Elements ─────────────────────────────────────────── */
  const runway = document.getElementById('scroll-runway');
  const leftInner = document.getElementById('left-inner');
  const rightInner = document.getElementById('right-inner');
  const navLinks = Array.from(document.querySelectorAll('.sidebar-nav .nav-link'));
  const sections = Array.from(document.querySelectorAll('.content-section'));

  if (!runway || !leftInner || !rightInner) return;

  /* ── Smooth scroll helper & sidebar navigation ────────── */
  let scrollAnimId = null;
  window.addEventListener('wheel', function () {
    if (scrollAnimId) { cancelAnimationFrame(scrollAnimId); scrollAnimId = null; }
  }, { passive: true });

  function smoothScrollTo(targetY) {
    if (scrollAnimId) cancelAnimationFrame(scrollAnimId);
    const startY = window.scrollY;
    const diff = targetY - startY;
    if (Math.abs(diff) < 1) return;
    const duration = 750;
    const startTime = performance.now();

    function step(now) {
      const t = Math.min((now - startTime) / duration, 1);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      window.scrollTo(0, startY + diff * ease);
      if (t < 1) {
        scrollAnimId = requestAnimationFrame(step);
      } else {
        scrollAnimId = null;
      }
    }
    scrollAnimId = requestAnimationFrame(step);
  }

  navLinks.forEach(function (link, i) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const section = sections[i];
      if (!section) return;

      navLinks.forEach(function (l) { l.classList.remove('active'); });
      link.classList.add('active');

      if (window.innerWidth <= 600 || leftTravel <= 0) {
        section.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      const targetLeftY = Math.min(section.offsetTop - leftInner.offsetTop, leftTravel);
      const targetScrollY = (targetLeftY / leftTravel) * scrollMax;
      smoothScrollTo(targetScrollY);
    });
  });

  /* ── State ────────────────────────────────────────────── */
  let leftTravel = 0;
  let rightTravel = 0;
  let scrollMax = 1;

  /* ── measure()
     Calculates content overflows, sets runway height,
     then applies the initial position (images at bottom). */
  function measure() {
    const leftCol = document.getElementById('col-left');
    const rightCol = document.getElementById('col-right');

    /* Reset before measuring natural heights */
    leftInner.style.transform = 'translateY(0px)';
    rightInner.style.transform = 'translateY(0px)';

    const leftStyle = window.getComputedStyle(leftCol);
    const rightStyle = window.getComputedStyle(rightCol);

    const leftVisibleH = leftCol.clientHeight - parseFloat(leftStyle.paddingTop) - parseFloat(leftStyle.paddingBottom);
    const rightVisibleH = rightCol.clientHeight - parseFloat(rightStyle.paddingTop) - parseFloat(rightStyle.paddingBottom);

    leftTravel = Math.max(0, leftInner.scrollHeight - leftVisibleH);
    rightTravel = Math.max(0, rightInner.scrollHeight - rightVisibleH);

    /* Runway = taller travel distance + one viewport so user has room to scroll */
    scrollMax = Math.max(leftTravel, rightTravel, 1);
    runway.style.height = (scrollMax + window.innerHeight) + 'px';

    /* Apply current scroll state (also sets the initial bottom position
       when scrollY = 0: right → translateY(rightTravel × (0−1)) = −rightTravel) */
    update();
  }

  /* ── update()
     Runs on every scroll tick via requestAnimationFrame. */
  function update() {
    const progress = Math.min(window.scrollY / scrollMax, 1);

    /* LEFT: 0 → −leftTravel   (moves UP as you scroll) */
    leftInner.style.transform = `translateY(${-progress * leftTravel}px)`;

    /* RIGHT: −rightTravel → 0  (starts at bottom, moves DOWN toward top) */
    rightInner.style.transform = `translateY(${rightTravel * (progress - 1)}px)`;
  }

  /* ── Scroll listener (rAF-throttled for 60 fps) ───────── */
  let ticking = false;

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () {
        update();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  /* ── Resize: re-measure and re-apply ─────────────────── */
  window.addEventListener('resize', function () {
    if (window.innerWidth <= 600) {
      leftInner.style.transform = '';
      rightInner.style.transform = '';
      runway.style.height = '';
      return;
    }
    measure();
  });

  /* ── Wait for images and videos before first measure ──────
     Media elements affect scrollHeight; we must wait for their
     dimensions to be known so rightTravel is calculated accurately. */
  const imgs = Array.from(document.querySelectorAll('.img-card img'));
  const vids = Array.from(document.querySelectorAll('.img-card video'));
  let pending = imgs.filter(img => !img.complete).length +
                vids.filter(vid => vid.readyState < 1).length;

  measure();

  if (pending > 0) {
    function onReady() {
      pending--;
      measure();
    }
    imgs.forEach(function (img) {
      if (!img.complete) {
        img.addEventListener('load', onReady, { once: true });
        img.addEventListener('error', onReady, { once: true });
      }
    });
    vids.forEach(function (vid) {
      if (vid.readyState < 1) {
        vid.addEventListener('loadedmetadata', onReady, { once: true });
        vid.addEventListener('error', onReady, { once: true });
      }
    });
  }

})();
