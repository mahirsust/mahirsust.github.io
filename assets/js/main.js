// Highlight active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + entry.target.id) {
          link.classList.add('active');
        }
      });
    }
  });
}, { rootMargin: '-50% 0px -50% 0px' });

sections.forEach(section => observer.observe(section));

// Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Nav background opacity on scroll
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    nav.style.boxShadow = '0 1px 8px rgba(0,0,0,0.08)';
  } else {
    nav.style.boxShadow = 'none';
  }
});

// Copy email to clipboard
document.querySelectorAll('a[href^="mailto"]').forEach(function(link) {
  const email = 'mahirhasancse@gmail.com';
  link.addEventListener('click', function(e) {
    e.preventDefault();
    navigator.clipboard.writeText(email).then(() => {
      const textEl = this.querySelector('.cl-text');
      if (textEl) {
        const orig = textEl.textContent;
        textEl.textContent = 'Copied!';
        setTimeout(() => textEl.textContent = orig, 2000);
      } else if (!this.querySelector('svg')) {
        const orig = this.textContent;
        this.textContent = 'Copied!';
        setTimeout(() => this.textContent = orig, 2000);
      }
    });
  });
});
