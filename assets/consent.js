(function () {
  var KEY = 'zenith-consent';

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function save(choice) {
    try { localStorage.setItem(KEY, choice); } catch (e) {}
  }

  function addStyles() {
    if (document.getElementById('consent-styles')) return;
    var style = document.createElement('style');
    style.id = 'consent-styles';
    style.textContent =
      '.consent-banner { position: fixed; left: 16px; right: 16px; bottom: 16px; z-index: 100; max-width: 420px; padding: 22px; border-radius: 10px; background: #14172b; color: #fff; font: 14px/1.5 Inter, Arial, sans-serif; box-shadow: 0 24px 60px rgba(20,23,43,.28); }' +
      '.consent-banner p { margin: 0 0 16px; color: #d0d2dc; }' +
      '.consent-banner a { color: #5fe0e0; text-decoration: underline; }' +
      '.consent-actions { display: flex; gap: 10px; }' +
      '.consent-actions button { flex: 1; min-height: 44px; border: 1px solid #fff; border-radius: 6px; font: 600 13px Inter, Arial, sans-serif; cursor: pointer; }' +
      '.consent-accept { background: #fff; color: #14172b; }' +
      '.consent-decline { background: transparent; color: #fff; }' +
      '.consent-actions button:focus-visible { outline: 3px solid #5fe0e0; outline-offset: 3px; }';
    document.head.appendChild(style);
  }

  function close(banner) {
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
  }

  function choose(choice, banner) {
    save(choice);
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { analytics_storage: choice === 'granted' ? 'granted' : 'denied' });
    }
    close(banner);
  }

  function open() {
    if (document.querySelector('.consent-banner')) return;
    addStyles();
    var banner = document.createElement('div');
    banner.className = 'consent-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
      '<p>We use Google Analytics cookies to understand how visitors use this site. They are only set if you accept. <a href="/privacy/#analytics">Learn more</a></p>' +
      '<div class="consent-actions"><button type="button" class="consent-decline">Decline</button><button type="button" class="consent-accept">Accept</button></div>';
    banner.querySelector('.consent-accept').addEventListener('click', function () { choose('granted', banner); });
    banner.querySelector('.consent-decline').addEventListener('click', function () { choose('denied', banner); });
    document.body.appendChild(banner);
  }

  window.zenithConsent = { open: open };

  document.addEventListener('click', function (event) {
    var trigger = event.target.closest && event.target.closest('[data-cookie-settings]');
    if (!trigger) return;
    event.preventDefault();
    open();
  });

  if (!read()) open();
})();
