/**
 * MyTekX Inc. — Master JavaScript  |  mytekx.js
 * Shared across all pages.
 *
 * SECTIONS:
 *  0. CONFIG & API KEYS
 *  1. PRELOADER (home page only)
 *  2. SCROLL PROGRESS BAR
 *  3. SCROLL-TO-TOP BUTTON
 *  4. NAVIGATION — dropdown (click-based, not hover-only)
 *  5. MOBILE HAMBURGER MENU
 *  6. SCROLL REVEAL (IntersectionObserver)
 *  7. NAV SHADOW ON SCROLL
 *  8. COUNTER ANIMATION (stats band)
 *  9. TECH-STACK TAB SWITCHER
 * 10. FAQ ACCORDION
 * 11. CONTACT FORM VALIDATION
 * 12. TOAST NOTIFICATION
 * 13. SMOOTH ANCHOR SCROLL
 * 14. ACTIVE NAV LINK DETECTION
 */

'use strict';

/* ═══════════════════════════════════════════════════
   0. CONFIG & UNIQUE API KEYS
   Replace values with your live keys before deploying.
   Never commit real keys to public repositories.
═══════════════════════════════════════════════════ */
const MYTEKX_CONFIG = Object.freeze({
  /* Site identity */
  siteName   : 'MyTekX Inc.',
  siteUrl    : 'https://mytekx.com',
  version    : '2.0.0',

  /* Unique security token — used to sign client-side requests */
  clientToken: 'MYT-a9f3c82e-4b17-41da-b6f0-c5d8e2190afc',

  /* Google Maps Embed API key — replace with your key from Google Cloud Console */
  mapsKey    : 'AIzaSyD-REPLACE_WITH_YOUR_GOOGLE_MAPS_API_KEY',

  /* EmailJS — contact form email delivery (sign up at emailjs.com) */
  emailjsServiceId : 'service_mytekx_001',
  emailjsTemplateId: 'template_contact_myt',
  emailjsPublicKey : 'MYT_PUB_KEY_a7f2b3c1d9e4',

  /* reCAPTCHA v3 site key — replace with your key from Google reCAPTCHA console */
  recaptchaSiteKey : '6LdXXXXXXXXXXX_REPLACE_WITH_RECAPTCHA_SITE_KEY',

  /* Content Security — unique nonce for inline scripts (regenerate per deploy) */
  csrfNonce  : 'nonce-myt-f8a2c34b9e170d56',

  /* Analytics tracking ID — replace with your GA4 or Plausible ID */
  analyticsId: 'G-MYTEKX_REPLACE',

  /* Feature flags */
  features: {
    counterAnimation : true,
    typedHero        : true,
    scrollProgress   : true,
    backToTop        : true,
    toastNotifications: true,
  }
});

/* ═══════════════════════════════════════════════════
   1. PRELOADER
   Only runs on index.html — other pages have
   <style>#pre{display:none!important}</style> in <head>
═══════════════════════════════════════════════════ */
(function initPreloader() {
  const pre = document.getElementById('pre');
  if (!pre) return; // not home page → skip

  document.body.style.overflow = 'hidden';

  /* Bar animation is 2.6s — we must never hide before it finishes */
  const BAR_MS   = 2700;  // slightly over 2.6s to be safe
  const startedAt = Date.now();

  function doHide() {
    /* Wait however long is left of the bar animation */
    const elapsed   = Date.now() - startedAt;
    const remaining = Math.max(0, BAR_MS - elapsed);
    setTimeout(() => {
      /* Fade out */
      pre.style.transition = 'opacity 0.7s ease, visibility 0.7s ease';
      pre.style.opacity    = '0';
      pre.style.visibility = 'hidden';
      pre.style.pointerEvents = 'none';
      document.body.style.overflow = '';
      initReveal();
      /* Remove from layout after fade completes */
      setTimeout(() => { pre.style.display = 'none'; }, 750);
    }, remaining);
  }

  /* KEY FIX: if the page already finished loading before this script ran,
     document.readyState will be 'complete' — the 'load' event already fired
     and addEventListener would never trigger. Handle both cases. */
  if (document.readyState === 'complete') {
    doHide();
  } else {
    window.addEventListener('load', doHide, { once: true });
    /* Safety net: force hide after 6s no matter what */
    setTimeout(doHide, 6000);
  }
})();

/* ═══════════════════════════════════════════════════
   2. SCROLL PROGRESS BAR
═══════════════════════════════════════════════════ */
(function initScrollProgress() {
  if (!MYTEKX_CONFIG.features.scrollProgress) return;

  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
  }, { passive: true });
})();

/* ═══════════════════════════════════════════════════
   3. SCROLL-TO-TOP BUTTON
═══════════════════════════════════════════════════ */
(function initBackToTop() {
  if (!MYTEKX_CONFIG.features.backToTop) return;

  const btn = document.getElementById('back-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ═══════════════════════════════════════════════════
   4. NAVIGATION DROPDOWN
   Click-based (works on touch + desktop).
   Hover still works on desktop via CSS :hover fallback.
   KEY FIX: pointer-events properly managed so dropdown
   links are always clickable.
═══════════════════════════════════════════════════ */
(function initDropdown() {
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  if (!dropdowns.length) return;

  dropdowns.forEach(dd => {
    const trigger = dd.querySelector('.nav-dd-trigger');
    const menu    = dd.querySelector('.nav-dd-menu');
    if (!trigger || !menu) return;

    /* Toggle open/close on click */
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = dd.classList.contains('open');

      /* Close all other dropdowns first */
      closeAllDropdowns();

      if (!isOpen) {
        dd.classList.add('open');
        menu.style.pointerEvents = 'all';
      }
    });

    /* Keep open while mouse is inside dropdown */
    dd.addEventListener('mouseenter', () => {
      closeAllDropdowns();
      dd.classList.add('open');
      menu.style.pointerEvents = 'all';
    });

    dd.addEventListener('mouseleave', () => {
      dd.classList.remove('open');
      menu.style.pointerEvents = 'none';
    });

    /* Allow clicking links inside menu */
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        closeAllDropdowns();
      });
    });
  });

  /* Close all dropdowns */
  function closeAllDropdowns() {
    dropdowns.forEach(dd => {
      dd.classList.remove('open');
      const m = dd.querySelector('.nav-dd-menu');
      if (m) m.style.pointerEvents = 'none';
    });
  }

  /* Close when clicking outside */
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) closeAllDropdowns();
  });

  /* Close on Escape key */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllDropdowns();
  });
})();

/* ═══════════════════════════════════════════════════
   5. MOBILE HAMBURGER MENU
═══════════════════════════════════════════════════ */
function toggleMenu() {
  const hb = document.getElementById('hb');
  const mm = document.getElementById('mm');
  if (hb) hb.classList.toggle('op');
  if (mm) mm.classList.toggle('op');
  /* Prevent body scroll when menu open */
  document.body.style.overflow = mm && mm.classList.contains('op') ? 'hidden' : '';
}

function closeMenu() {
  const hb = document.getElementById('hb');
  const mm = document.getElementById('mm');
  if (hb) hb.classList.remove('op');
  if (mm) mm.classList.remove('op');
  document.body.style.overflow = '';
}

/* Close mobile menu when clicking outside */
document.addEventListener('click', (e) => {
  const hb = document.getElementById('hb');
  const mm = document.getElementById('mm');
  if (!hb || !mm) return;
  if (!hb.contains(e.target) && !mm.contains(e.target)) closeMenu();
});

/* ═══════════════════════════════════════════════════
   6. SCROLL REVEAL
   Elements with .rv animate in when entering viewport.
═══════════════════════════════════════════════════ */
function initReveal() {
  const els = document.querySelectorAll('.rv');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -36px 0px' });

  els.forEach(el => observer.observe(el));
}

/* Run reveal on non-home pages immediately */
/* Run reveal on non-home pages immediately */
if (!document.getElementById('pre')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }
}

/* ═══════════════════════════════════════════════════
   7. NAV SHADOW ON SCROLL
═══════════════════════════════════════════════════ */
(function initNavShadow() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 32);
  }, { passive: true });
})();

/* ═══════════════════════════════════════════════════
   8. COUNTER ANIMATION
   Animates numbers in .sc-n elements when they appear.
═══════════════════════════════════════════════════ */
(function initCounters() {
  if (!MYTEKX_CONFIG.features.counterAnimation) return;

  const counterEls = document.querySelectorAll('.sc-n');
  if (!counterEls.length) return;

  function animateCounter(el) {
    const raw     = el.textContent.trim();
    const suffix  = raw.replace(/[\d.]/g, '');          /* e.g. "+" "%" "K" */
    const target  = parseFloat(raw.replace(/[^\d.]/g, ''));
    if (isNaN(target)) return;

    const duration = 4000;
    const start    = performance.now();

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      /* Ease-out quad */
      const eased    = 1 - (1 - progress) * (1 - progress);
      const current  = Math.round(eased * target * 10) / 10;
      el.textContent = (current % 1 === 0 ? Math.round(current) : current) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counterEls.forEach(el => obs.observe(el));
})();

/* ═══════════════════════════════════════════════════
   9. TECH-STACK TAB SWITCHER
═══════════════════════════════════════════════════ */
function switchTab(btn, panelId) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('act'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('act'));
  btn.classList.add('act');
  const panel = document.getElementById('tab-' + panelId);
  if (panel) panel.classList.add('act');
}

/* ═══════════════════════════════════════════════════
   10. FAQ ACCORDION
   One item open at a time; clicking open item closes it.
═══════════════════════════════════════════════════ */
function toggleFaq(btn) {
  const item   = btn.closest('.faq-item');
  if (!item) return;
  const isOpen = item.classList.contains('op');
  document.querySelectorAll('.faq-item.op').forEach(i => i.classList.remove('op'));
  if (!isOpen) item.classList.add('op');
}

/* ═══════════════════════════════════════════════════
   11. CONTACT FORM VALIDATION & SUBMISSION
═══════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════
   11. CONTACT FORM VALIDATION & SUBMISSION
   Updated for Local Node.js Testing
═══════════════════════════════════════════════════ */
async function submitForm() {
  const fnEl  = document.getElementById('fn');
  const lnEl  = document.getElementById('ln');
  const emEl  = document.getElementById('em');
  const coEl  = document.getElementById('co');
  const phEl  = document.getElementById('ph');
  const svEl  = document.getElementById('sv');
  const buEl  = document.getElementById('bu');
  const msgEl = document.getElementById('msg');
  
  if (!fnEl || !emEl || !msgEl) return;

  let valid = true;

  // Validate required fields
  [fnEl, emEl, msgEl].forEach(field => {
    const group = field.closest('.fg');
    if (!group) return;
    group.classList.remove('err');
    if (!field.value.trim()) {
      group.classList.add('err');
      valid = false;
      setTimeout(() => group.classList.remove('err'), 2800);
    }
  });

  // Email format check
  if (emEl.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emEl.value.trim())) {
    emEl.closest('.fg').classList.add('err');
    valid = false;
    showToast('Please enter a valid email address.');
    return;
  }

  if (!valid) {
    showToast('Please fill in all required fields.');
    return;
  }

  // --- START OF SERVER COMMUNICATION ---
  const btn = document.querySelector('.fbtn');
  if (btn) {
    btn.textContent = 'Sending…';
    btn.disabled = true;
    btn.style.opacity = '.7';
  }

  const formData = {
    firstName: fnEl.value,
    lastName: lnEl ? lnEl.value : '',
    email: emEl.value,
    company: coEl ? coEl.value : '',
    phone: phEl ? phEl.value : '',
    service: svEl ? svEl.value : '',
    budget: buEl ? buEl.value : '',
    message: msgEl.value
  };

  try {
    const response = await fetch('http://localhost:3000/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (result.success) {
      document.getElementById('cForm').style.display = 'none';
      document.getElementById('fSuc').style.display = 'block';
      showToast('Message sent! We\'ll be in touch within 4 hours.');
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Connection Error:", error);
    showToast('Could not reach the server. Is it running?');
    if (btn) {
      btn.textContent = 'Send Message →';
      btn.disabled = false;
      btn.style.opacity = '1';
    }
  }
}

/* ═══════════════════════════════════════════════════
   12. TOAST NOTIFICATIONS
═══════════════════════════════════════════════════ */
function showToast(message, duration = 3500) {
  if (!MYTEKX_CONFIG.features.toastNotifications) return;

  let toast = document.getElementById('toast');
  if (!toast) {
    toast          = document.createElement('div');
    toast.id       = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

/* ═══════════════════════════════════════════════════
   13. SMOOTH ANCHOR SCROLL
   Handles href="#section-id" links smoothly.
═══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
});

/* ═══════════════════════════════════════════════════
   14. ACTIVE NAV LINK DETECTION
   Highlights the correct nav link based on current page.
═══════════════════════════════════════════════════ */
(function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-center a, .nav-dd-trigger').forEach(a => {
    const href = (a.getAttribute('href') || '').split('#')[0].split('/').pop();
    if (href === page) {
      a.classList.add('on');
      /* Also mark parent dropdown trigger */
      const parent = a.closest('.nav-dropdown');
      if (parent) {
        const t = parent.querySelector('.nav-dd-trigger');
        if (t) t.classList.add('on');
      }
    }
  });
})();
