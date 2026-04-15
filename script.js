gsap.registerPlugin();

/* ── Video looping ── */
const video  = document.getElementById('bgVideo');

/* ────────────────────────────────────────────
   Refs
──────────────────────────────────────────── */
const slide1        = document.getElementById('slide1');
const slide2        = document.getElementById('slide2');
const circleSlide   = document.getElementById('circleSlide');
const circleContent = document.getElementById('circleContent');
const mainNav       = document.getElementById('mainNav');
const priceBar      = document.getElementById('priceBar');
const priceBarName  = document.getElementById('priceBarName');
const priceBarPrice = document.getElementById('priceBarPrice');
const priceBarClose = document.getElementById('priceBarClose');

/* ── Initial GSAP states ── */
gsap.set(slide1,        { z: 0,    scale: 1,    opacity: 1 });
gsap.set(slide2,        { z: -260, scale: 0.82, opacity: 0 });
gsap.set(circleSlide,   { scale: 0 });
gsap.set(circleContent, { opacity: 0 });

/* ────────────────────────────────────────────
   Timelines
──────────────────────────────────────────── */

// tl1: karta slide1 → slide2  (current 0→1)
const tl1 = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
tl1.to(slide1, { z: -440, scale: 0.62, opacity: 0, duration: 1 }, 0);
tl1.to(slide2, { z: 0,    scale: 1,    opacity: 1, duration: 1 }, 0);

// tl2: koło rośnie  (current 1→2)
const tl2 = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
tl2.to(circleSlide,   { scale: 1,   duration: 1 }, 0);
tl2.to(circleContent, { opacity: 1, duration: 0.3 }, 0.48);

/* ────────────────────────────────────────────
   Scroll – 4 fazy (0 → 3)
   + scroll wewnątrz koła i panelu
──────────────────────────────────────────── */
let current        = 0;
let target         = 0;
let contentTarget  = 0;   // scroll wewnątrz koła
let contentCurrent = 0;

const CIRCLE_OPEN     = 1.90; // koło w pełni otwarte

window.addEventListener('wheel', (e) => {
  e.preventDefault();

  const isCircleOpen = current >= CIRCLE_OPEN;

  if (isCircleOpen) {
    /* ── scroll wewnątrz koła ── */
    const realScroll = circleContent.scrollHeight - circleContent.clientHeight;
    const maxScroll = Math.max(600, realScroll);
    
    if (e.deltaY > 0) {
      if (contentTarget < maxScroll) {
        contentTarget = Math.min(maxScroll, contentTarget + e.deltaY * 0.9);
      }
    } else {
      if (contentTarget > 2) {
        contentTarget = Math.max(0, contentTarget + e.deltaY * 0.9);
      } else {
        // na górze treści → zamknij koło
        target = Math.max(0, Math.min(2, target + e.deltaY * 0.0018));
      }
    }

  } else {
    /* ── sterowanie fazami 0-1-2 ── */
    target = Math.max(0, Math.min(2, target + e.deltaY * 0.0018));
  }
}, { passive: false });

/* ── Touch support (mobile swipe = same as wheel) ── */
let touchStartY = 0;
let touchStartContent = 0;
window.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
  touchStartContent = contentTarget;
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const deltaY = touchStartY - e.touches[0].clientY;
  const speed = 2.2;
  const isCircleOpen = current >= CIRCLE_OPEN;

  if (isCircleOpen) {
    const realScroll = circleContent.scrollHeight - circleContent.clientHeight;
    const maxScroll = Math.max(600, realScroll);
    const newContent = touchStartContent + deltaY * speed;
    if (deltaY > 0) {
      contentTarget = Math.min(maxScroll, newContent);
    } else {
      if (touchStartContent > 2) {
        contentTarget = Math.max(0, newContent);
      } else {
        target = Math.max(0, Math.min(2, target + deltaY * 0.004));
      }
    }
  } else {
    target = Math.max(0, Math.min(2, target + deltaY * 0.004));
  }
}, { passive: false });

/* ── Ticker ── */
gsap.ticker.add(() => {
  /* animacje faz */
  const diff = target - current;
  if (Math.abs(diff) > 0.00004) {
    current += diff * 0.10;
    tl1.progress(Math.min(1, Math.max(0, current)));
    tl2.progress(Math.min(1, Math.max(0, (current - 1.35) / 0.65)));
  }

  /* płynny scroll koła */
  const cd = contentTarget - contentCurrent;
  if (Math.abs(cd) > 0.1) {
    contentCurrent += cd * 0.12;
    circleContent.scrollTop = contentCurrent;
  }

  /* ── Kolor nav ── */
  let shouldBeWhiteNav = false;
  if (current >= 1.5) {
    const pSec = document.getElementById('portfolioSection');
    // Jeśli jesteśmy w Ofercie (przed Realizacjami), używamy białego menu
    if (pSec && contentCurrent < pSec.offsetTop - 50) {
      shouldBeWhiteNav = true;
    }
  }

  if (shouldBeWhiteNav) {
    mainNav.classList.add('nav-on-dark');
  } else {
    mainNav.classList.remove('nav-on-dark');
  }

  /* ── Aktywacja kliknięć tylko dla widocznej sekcji ── */
  slide1.style.pointerEvents = (current < 0.5) ? 'auto' : 'none';
  slide2.style.pointerEvents = (current >= 0.5 && current < 1.5) ? 'auto' : 'none';
  circleSlide.style.pointerEvents = (current >= 1.5) ? 'auto' : 'none';

  /* ── ScrollSpy: Auto-update Active Nav ── */
  let activeId = '#slide1';
  if (current < 0.5) {
    activeId = '#slide1';
  } else if (current >= 0.5 && current < 1.5) {
    activeId = '#slide2';
  } else {
    const pSec = document.getElementById('portfolioSection');
    const fSec = document.getElementById('footerSection');
    if (fSec && contentCurrent >= fSec.offsetTop - 200) {
      activeId = '#footerSection';
    } else if (pSec && contentCurrent >= pSec.offsetTop - 200) {
      activeId = '#portfolioSection';
    } else {
      activeId = '#circleSlide';
    }
  }
  
  navLinks.forEach(link => {
    if (link.getAttribute('href') === activeId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});

/* ────────────────────────────────────────────
   Kalkulator – klik na pakiet
──────────────────────────────────────────── */
document.querySelectorAll('.selectable').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelectorAll('.selectable').forEach(s => s.classList.remove('selected'));
    el.classList.add('selected');
    priceBarName.textContent  = el.dataset.name;
    priceBarPrice.textContent = el.dataset.price;
    priceBar.classList.add('visible');
  });
});

priceBarClose.addEventListener('click', () => {
  priceBar.classList.remove('visible');
  document.querySelectorAll('.selectable').forEach(s => s.classList.remove('selected'));
});

/* ────────────────────────────────────────────
   Hamburger Menu Toggle
──────────────────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const navOverlay = document.getElementById('navOverlay');

function toggleNav(open) {
  mainNav.classList.toggle('nav-open', open);
  navOverlay.classList.toggle('visible', open);
  hamburger.setAttribute('aria-expanded', String(open));
}

if (hamburger) {
  hamburger.addEventListener('click', () => {
    toggleNav(!mainNav.classList.contains('nav-open'));
  });
}
if (navOverlay) {
  navOverlay.addEventListener('click', () => toggleNav(false));
}

/* ────────────────────────────────────────────
   Autoscroll dla menu nawigacyjnego
──────────────────────────────────────────── */
const navLinks = document.querySelectorAll('#mainNav .nav-links a');

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      toggleNav(false); // close mobile menu
      
      if (href === '#slide1') {
        target = 0;
        contentTarget = 0;
      } else if (href === '#slide2') {
        target = 1;
        contentTarget = 0;
      } else if (href === '#circleSlide') {
        target = 2;
        contentTarget = 0;
      } else if (href === '#portfolioSection') {
        target = 2;
        const pSec = document.getElementById('portfolioSection');
        if (pSec) contentTarget = pSec.offsetTop;
      } else if (href === '#footerSection') {
        target = 2;
        const fSec = document.getElementById('footerSection');
        if (fSec) contentTarget = fSec.offsetTop;
      }
    }
  });
});

/* ── Hero: przyciski poza nav (np. "Oferta" w hero) ── */
document.querySelectorAll('a[href="#circleSlide"]:not(.nav-links a)').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    target = 2;
    contentTarget = 0;
  });
});
