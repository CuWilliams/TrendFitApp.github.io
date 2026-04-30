// js/dashboard.js — tile hover/expand interaction (Issue #23)

(function () {
  'use strict';

  var APP_STORE_URL = 'https://apps.apple.com/ca/app/trendfit/id6751863796';

  var TILE_DATA = {
    'tile-trendfit': {
      benefit: 'Track heart rate, distance, pace, cadence, and active energy across every workout. Spot the trends that matter — and see exactly where you\'re headed.',
      img: 'images/tf-trendfit.png',
      imgAlt: 'TrendFit trend chart showing an improving distance trend'
    },
    'tile-stack': {
      benefit: 'See every metric side by side across weeks, months, or your entire history. Find patterns you\'d never catch workout by workout.',
      img: 'images/tf-stack-scatter.png',
      imgAlt: 'TrendFitStack showing stacked workout metrics across multiple months'
    },
    'tile-zoom': {
      benefit: 'Pinch to zoom into any timeframe, then swipe to explore your full history. No detail too small, no season too long.',
      img: 'images/tf-trendfit.png',
      imgAlt: 'Zoomed-in chart detail showing a focused workout segment'
    },
    'tile-privacy': {
      benefit: 'Your health data never leaves your device. TrendFit reads directly from Apple HealthKit — no account required, no data shared, ever.',
      img: 'images/tf-welcome.jpg',
      imgAlt: 'TrendFit welcome screen showing privacy-first on-device analysis'
    },
    'tile-personal': {
      benefit: 'Choose metric or imperial, set your training window, and dial in haptics. TrendFit adapts to how you like to train and review progress.',
      img: 'images/tf-trendfit.png',
      imgAlt: 'TrendFit settings showing unit and window personalization options'
    }
  };

  var hoverMQ = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)');

  function buildExpandPanel(tile, data) {
    var panel = document.createElement('div');
    panel.className = 'tile-expand';
    panel.setAttribute('aria-hidden', 'true');

    var p = document.createElement('p');
    p.className = 'expand-benefit';
    p.textContent = data.benefit;

    var img = document.createElement('img');
    img.className = 'expand-img';
    img.src = data.img;
    img.alt = data.imgAlt;
    img.loading = 'lazy';

    var a = document.createElement('a');
    a.className = 'btn-appstore';
    a.href = APP_STORE_URL;
    a.target = '_blank';
    a.rel = 'noopener';
    a.innerHTML = '<i class="fa-brands fa-apple" aria-hidden="true"></i> Download on the App Store';

    panel.appendChild(p);
    panel.appendChild(img);
    panel.appendChild(a);
    tile.appendChild(panel);

    return panel;
  }

  function openTile(tile) {
    var panel = tile.querySelector('.tile-expand');
    if (!panel || tile.getAttribute('aria-expanded') === 'true') return;

    tile.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
    panel.classList.add('is-visible');

    var reducedMotion = window.TFMotion && window.TFMotion.reducedMotion;
    var motionAnimate = window.Motion && window.Motion.animate;

    if (motionAnimate && !reducedMotion) {
      motionAnimate(
        panel,
        { opacity: [0, 1], transform: ['translateY(6px)', 'translateY(0px)'] },
        { duration: 0.22, easing: 'ease-out' }
      );
    }
  }

  function closeTile(tile) {
    var panel = tile.querySelector('.tile-expand');
    if (!panel || tile.getAttribute('aria-expanded') === 'false') return;

    tile.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');

    var reducedMotion = window.TFMotion && window.TFMotion.reducedMotion;
    var motionAnimate = window.Motion && window.Motion.animate;

    if (motionAnimate && !reducedMotion) {
      var controls = motionAnimate(
        panel,
        { opacity: [1, 0], transform: ['translateY(0px)', 'translateY(6px)'] },
        { duration: 0.18, easing: 'ease-in' }
      );
      controls.finished.then(function () {
        panel.classList.remove('is-visible');
      });
    } else {
      panel.classList.remove('is-visible');
    }
  }

  function toggleTile(tile) {
    if (tile.getAttribute('aria-expanded') === 'true') {
      closeTile(tile);
    } else {
      closeAll();
      openTile(tile);
    }
  }

  function closeAll() {
    document.querySelectorAll('.tile-feature[aria-expanded="true"]').forEach(function (tile) {
      closeTile(tile);
    });
  }

  function init() {
    var tiles = document.querySelectorAll('.tile-feature[tabindex="0"]');
    if (!tiles.length) return;

    tiles.forEach(function (tile) {
      var data = TILE_DATA[tile.id];
      if (!data) return;

      buildExpandPanel(tile, data);

      // Hover open/close — desktop (pointer: fine, hover: hover)
      tile.addEventListener('mouseenter', function () {
        if (hoverMQ && hoverMQ.matches) openTile(tile);
      });
      tile.addEventListener('mouseleave', function () {
        if (hoverMQ && hoverMQ.matches) closeTile(tile);
      });

      // Tap toggle — touch/non-hover devices
      tile.addEventListener('click', function (e) {
        if (hoverMQ && hoverMQ.matches) return;
        if (e.target.closest('.btn-appstore')) return; // let CTA link navigate
        toggleTile(tile);
      });

      // Keyboard toggle
      tile.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTile(tile);
        }
      });
    });

    // Escape closes all
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll();
    });

    // Click outside any tile closes all (touch)
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.tile-feature')) closeAll();
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
