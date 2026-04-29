// js/motion.js — global animation utilities (consumed by Phase 2 dashboard work)

(function () {
  // Reduced-motion guard — single source of truth for all animation decisions
  var mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  var reducedMotion = mq ? mq.matches : false;

  // Allow the guard to react to live OS setting changes
  if (mq && mq.addEventListener) {
    mq.addEventListener('change', function (e) { reducedMotion = e.matches; });
  }

  // Expose for use by other scripts
  window.TFMotion = {
    get reducedMotion() { return reducedMotion; }
  };

  // Scroll-reveal via IntersectionObserver.
  // Opt elements in with class="reveal" — CSS should set them opacity:0 / translateY
  // initially; this utility adds "revealed" and (if Motion One is available) drives
  // the entrance animation.
  function initScrollReveal() {
    if (reducedMotion) return;
    if (!('IntersectionObserver' in window)) return;

    var targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var el = entry.target;
        var motionAnimate = window.Motion && window.Motion.animate;

        if (motionAnimate) {
          motionAnimate(
            el,
            { opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0)'] },
            { duration: 0.45, easing: 'ease-out' }
          );
        }

        el.classList.add('revealed');
        observer.unobserve(el);
      });
    }, { threshold: 0.12 });

    targets.forEach(function (el) { observer.observe(el); });
  }

  document.addEventListener('DOMContentLoaded', initScrollReveal);
})();
