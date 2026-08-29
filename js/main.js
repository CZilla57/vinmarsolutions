(function () {
  var config = window.VinmarSite;
  var currentPage = document.body.dataset.page;
  var nav = document.querySelector('.nav-links');
  var toggle = document.querySelector('.nav-toggle');

  if (config && nav) {
    nav.innerHTML = config.navigation.map(function (item) {
      var current = item.key === currentPage;
      return '<li><a' + (current ? ' class="active" aria-current="page"' : '') +
        ' href="' + item.href + '">' + item.label + '</a></li>';
    }).join('');

    var footerNav = document.querySelector('.site-footer [data-footer-nav]');
    if (footerNav) {
      footerNav.innerHTML = config.navigation.map(function (item) {
        return '<li><a href="' + item.href + '">' + item.label + '</a></li>';
      }).join('');
    }

    document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
      link.href = config.phoneHref;
      if (link.dataset.sitePhone !== undefined) link.textContent = config.phoneDisplay;
      var strong = link.querySelector('strong');
      if (strong) strong.textContent = config.phoneDisplay;
    });
    document.querySelectorAll('a[href^="mailto:"]').forEach(function (link) {
      link.href = 'mailto:' + config.email;
      link.textContent = config.email;
    });
    document.querySelectorAll('[data-site-availability]').forEach(function (el) {
      el.textContent = config.availability;
    });
    document.querySelectorAll('[data-site-year]').forEach(function (el) {
      el.textContent = config.copyrightYear;
    });
    document.querySelectorAll('[data-site-location]').forEach(function (el) {
      el.textContent = config.location;
    });
    document.querySelectorAll('[data-site-service-area]').forEach(function (el) {
      el.textContent = config.serviceArea;
    });
  }

  function setMenu(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('.nav-toggle')) {
      setMenu(!nav.classList.contains('open'));
    } else if (!e.target.closest('.nav-links')) {
      setMenu(false);
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav && nav.classList.contains('open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 780) setMenu(false);
  });

  document.querySelectorAll('svg:not([role="img"]):not([aria-label])').forEach(function (svg) {
    svg.setAttribute('aria-hidden', 'true');
  });
  document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
    if (!link.getAttribute('aria-label')) {
      link.setAttribute('aria-label', link.textContent.trim() + ' (opens in a new tab)');
    }
  });
})();

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
