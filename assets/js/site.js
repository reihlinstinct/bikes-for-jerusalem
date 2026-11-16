// Progressive enhancement: mobile menu toggle and articles tabs.
(function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }
  var tabs = document.querySelectorAll('[role=tab]');
  function select(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
  }
  tabs.forEach(function (t) { t.tabIndex = t.getAttribute('aria-selected') === 'true' ? 0 : -1; });
  tabs.forEach(function (tab, i) {
    tab.addEventListener('keydown', function (e) {
      var dir = document.dir === 'rtl' || document.documentElement.dir === 'rtl' ? -1 : 1;
      var next = null;
      if (e.key === 'ArrowRight') next = i + dir;
      else if (e.key === 'ArrowLeft') next = i - dir;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      if (next === null) return;
      e.preventDefault();
      var target = tabs[(next + tabs.length) % tabs.length];
      select(target);
      target.focus();
    });
  });
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () { select(tab); });
  });
})();
