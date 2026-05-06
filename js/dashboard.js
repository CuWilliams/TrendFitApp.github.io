// js/dashboard.js — tile hover/expand interaction (Issue #23)

(function () {
  'use strict';

  var TILE_DATA = {
    'tile-trendfit': {
      benefit: 'Linear regression over your actual workouts — see if you\'re getting faster, stronger, or just consistent.',
      video: 'media/tile-trendfit.mp4',
      videoAlt: 'Screen recording of TrendFit chart with trend line'
    },
    'tile-stack': {
      benefit: 'Stack week-over-week or month-over-month totals to spot effort patterns at a glance.',
      video: 'media/tile-stack.mp4',
      videoAlt: 'Screen recording of TrendFitStack stacked bar chart'
    },
    'tile-zoom': {
      benefit: 'Pinch to zoom into any date range. Pan through the season. Spot the outlier.',
      video: 'media/tile-zoom.mp4',
      videoAlt: 'Screen recording of pinch-to-zoom and pan on a TrendFit chart'
    },
    'tile-privacy': {
      benefit: 'Your health data stays on your device. TrendFit uses Apple HealthKit with read-only access — nothing is uploaded, shared, or sold. No account required. No cloud.'
    },
    'tile-personal': {
      benefit: 'Switch between metric and imperial, set your preferred time windows, and enable haptic feedback for milestones. TrendFit adapts to how you train.'
    },
    'tile-challenges': {
      benefit: 'Set a distance, energy, or pace goal. Track progress as you train. See the moment you beat it.',
      video: 'media/tile-challenges.mp4',
      videoAlt: 'Screen recording of Challenges goal progress view'
    },
    'tile-challenge-notifications': {
      benefit: 'Get progress updates on your schedule. All notifications are generated on-device — no data leaves your phone.',
      video: 'media/tile-notif.mp4',
      videoAlt: 'Screen recording of a Challenge notification appearing'
    }
  };

  var hoverMQ = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function buildExpandPanel(tile, data) {
    var panel = document.createElement('div');
    panel.className = 'tile-expand';
    panel.setAttribute('aria-hidden', 'true');

    var p = document.createElement('p');
    p.className = 'expand-benefit';
    p.textContent = data.benefit;
    panel.appendChild(p);

    if (data.video) {
      var vid = document.createElement('video');
      vid.className = 'expand-video';
      vid.muted = true;
      vid.loop = true;
      vid.setAttribute('playsinline', '');
      vid.setAttribute('preload', 'none');
      vid.setAttribute('aria-label', data.videoAlt || '');
      var src = document.createElement('source');
      src.src = data.video;
      src.type = 'video/mp4';
      vid.appendChild(src);
      panel.appendChild(vid);
    } else if (data.img) {
      var img = document.createElement('img');
      img.className = 'expand-img';
      img.src = data.img;
      img.alt = data.imgAlt || '';
      img.loading = 'lazy';
      panel.appendChild(img);
    }

    tile.appendChild(panel);
    return panel;
  }

  function openTile(tile) {
    var panel = tile.querySelector('.tile-expand');
    if (!panel || tile.getAttribute('aria-expanded') === 'true') return;

    tile.setAttribute('aria-expanded', 'true');
    panel.setAttribute('aria-hidden', 'false');
    panel.classList.add('is-visible');

    var motionAnimate = window.Motion && window.Motion.animate;
    if (motionAnimate && !reducedMotion) {
      motionAnimate(
        panel,
        { opacity: [0, 1], transform: ['translateY(6px)', 'translateY(0px)'] },
        { duration: 0.22, easing: 'ease-out' }
      );
    }

    if (!reducedMotion) {
      var vid = tile.querySelector('video.expand-video');
      if (vid) { vid.currentTime = 0; vid.play(); }
    }
  }

  function closeTile(tile) {
    var panel = tile.querySelector('.tile-expand');
    if (!panel || tile.getAttribute('aria-expanded') === 'false') return;

    tile.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');

    var vid = tile.querySelector('video.expand-video');
    if (vid) { vid.pause(); vid.currentTime = 0; }

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
