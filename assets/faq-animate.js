(function () {
  var EASE = 'cubic-bezier(.16, 1, .3, 1)';
  var DURATION = 220;

  function setUp(details) {
    var summary = details.querySelector('summary');
    var answer = details.querySelector('.answer');
    if (!summary || !answer) return;

    var animation = null;
    var isClosing = false;
    var isExpanding = false;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    summary.addEventListener('click', function (event) {
      event.preventDefault();
      if (reduceMotion) {
        details.open = !details.open;
        return;
      }
      details.style.overflow = 'hidden';
      if (isClosing || !details.open) {
        expand();
      } else if (isExpanding || details.open) {
        shrink();
      }
    });

    function shrink() {
      isClosing = true;
      var startHeight = details.offsetHeight + 'px';
      var endHeight = summary.offsetHeight + 'px';
      if (animation) animation.cancel();
      animation = details.animate({ height: [startHeight, endHeight] }, { duration: DURATION, easing: EASE });
      animation.onfinish = function () { onFinish(false); };
      animation.oncancel = function () { isClosing = false; };
    }

    function expand() {
      details.style.height = details.offsetHeight + 'px';
      details.open = true;
      window.requestAnimationFrame(function () {
        isExpanding = true;
        var startHeight = details.offsetHeight + 'px';
        var endHeight = (summary.offsetHeight + answer.offsetHeight) + 'px';
        if (animation) animation.cancel();
        animation = details.animate({ height: [startHeight, endHeight] }, { duration: DURATION, easing: EASE });
        animation.onfinish = function () { onFinish(true); };
        animation.oncancel = function () { isExpanding = false; };
      });
    }

    function onFinish(open) {
      details.open = open;
      animation = null;
      isClosing = false;
      isExpanding = false;
      details.style.height = '';
      details.style.overflow = '';
    }
  }

  document.querySelectorAll('.faq details, .faq-list details').forEach(setUp);
})();
