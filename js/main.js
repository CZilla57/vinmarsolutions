// Mobile nav toggle
document.addEventListener('click', function (e) {
  var toggle = e.target.closest('.nav-toggle');
  if (toggle) {
    var links = document.querySelector('.nav-links');
    if (links) links.classList.toggle('open');
  } else if (!e.target.closest('.nav-links')) {
    var open = document.querySelector('.nav-links.open');
    if (open) open.classList.remove('open');
  }
});

// Reveal on scroll
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function (el, i) {
    el.style.transitionDelay = Math.min(i % 4, 3) * 80 + 'ms';
    io.observe(el);
  });
})();
