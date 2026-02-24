

'use strict';

// ═══════════════════════════════════════════════════════════
// DOM References
// ═══════════════════════════════════════════════════════════
const html = document.documentElement;
const body = document.body;
const navbar = document.getElementById('navbar');
const themeToggle = document.getElementById('theme-toggle');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const menuOverlay = document.getElementById('menu-overlay');
const scrollBar = document.getElementById('scroll-progress');
const backToTop = document.getElementById('back-to-top');
const yearEl = document.getElementById('year');
const navLinks = document.querySelectorAll('.nav-link');
const mobileLinks = document.querySelectorAll('.mobile-nav-link');
const allNavLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
const sections = document.querySelectorAll('section[id]');

// ═══════════════════════════════════════════════════════════
// 1. THEME TOGGLE
// ═══════════════════════════════════════════════════════════
function getStoredTheme() {
  return localStorage.getItem('portfolio-theme') || 'dark';
}

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('portfolio-theme', theme);
}

function toggleTheme() {
  const current = html.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// Load saved theme immediately to avoid flash
applyTheme(getStoredTheme());

if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

// ═══════════════════════════════════════════════════════════
// 2. DYNAMIC YEAR
// ═══════════════════════════════════════════════════════════
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// ═══════════════════════════════════════════════════════════
// 3. SCROLL EVENTS (progress bar, navbar, back-to-top, spy)
// ═══════════════════════════════════════════════════════════
function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const percentage = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  scrollBar.style.width = `${Math.min(percentage, 100)}%`;
}

function updateNavbar() {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

function updateBackToTop() {
  if (window.scrollY > 300) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
}

function updateActiveNavLink() {
  let currentSection = '';

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      currentSection = section.getAttribute('id');
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove('active');
    const href = link.getAttribute('href').replace('#', '');
    if (href === currentSection) {
      link.classList.add('active');
    }
  });
}

// Throttle scroll handler for performance
let ticking = false;
function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateScrollProgress();
      updateNavbar();
      updateBackToTop();
      updateActiveNavLink();
      ticking = false;
    });
    ticking = true;
  }
}

window.addEventListener('scroll', onScroll, { passive: true });

// Run once on load to set initial state
onScroll();

// ═══════════════════════════════════════════════════════════
// 4. SMOOTH SCROLL
// ═══════════════════════════════════════════════════════════
function smoothScrollTo(targetId) {
  const target = document.querySelector(targetId);
  if (!target) return;

  const navHeight = navbar.offsetHeight + 8;
  const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

  window.scrollTo({ top: targetTop, behavior: 'smooth' });
}

allNavLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      smoothScrollTo(href);
      closeMobileMenu();
    }
  });
});

// Hero CTA buttons (same-page anchors)
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  if (anchor.classList.contains('nav-link') || anchor.classList.contains('mobile-nav-link')) return;
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href && href.length > 1) {
      e.preventDefault();
      smoothScrollTo(href);
    }
  });
});

// ═══════════════════════════════════════════════════════════
// 5. BACK TO TOP
// ═══════════════════════════════════════════════════════════
if (backToTop) backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ═══════════════════════════════════════════════════════════
// 6. MOBILE MENU
// ═══════════════════════════════════════════════════════════
function openMobileMenu() {
  mobileMenu.classList.add('open');
  menuOverlay.classList.add('active');
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  menuOverlay.classList.remove('active');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.contains('open');
  isOpen ? closeMobileMenu() : openMobileMenu();
});

// Close on overlay click
menuOverlay.addEventListener('click', closeMobileMenu);

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
    closeMobileMenu();
  }
});

// Close menu when resizing to desktop
window.addEventListener('resize', () => {
  if (window.innerWidth > 768 && mobileMenu.classList.contains('open')) {
    closeMobileMenu();
  }
});

// ═══════════════════════════════════════════════════════════
// 7. INTERSECTION OBSERVER — Fade-in on scroll
// ═══════════════════════════════════════════════════════════
const fadeEls = document.querySelectorAll('.project-card, .contact-card, .skill-badge, .about-text, .skills-panel');

fadeEls.forEach((el) => el.classList.add('fade-in'));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        // Stagger children slightly
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, idx * 60);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

fadeEls.forEach((el) => observer.observe(el));
