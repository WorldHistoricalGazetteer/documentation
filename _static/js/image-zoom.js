/**
 * Figure Image Zoom (lightbox)
 * Add to Sphinx _static/ folder and include in conf.py.
 *
 * Scoped to images inside {figure} directives, so screenshots become
 * click-to-enlarge while inline logos/badges are left alone. Mirrors the
 * approach of mermaid-zoom.js.
 */
(function () {
    'use strict';

    let overlay = null;

    function createOverlay() {
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.className = 'image-zoom-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-label', 'Zoomed image view');

        const img = document.createElement('img');
        img.className = 'image-zoom-img';
        img.alt = '';
        overlay.appendChild(img);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'image-zoom-close';
        closeBtn.type = 'button';
        closeBtn.innerHTML = '×';
        closeBtn.setAttribute('aria-label', 'Close zoomed image');
        overlay.appendChild(closeBtn);

        document.body.appendChild(overlay);

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay || e.target === img) closeZoom();
        });
        closeBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            closeZoom();
        });

        return overlay;
    }

    function openZoom(src, alt) {
        const o = createOverlay();
        const img = o.querySelector('.image-zoom-img');
        img.src = src;
        img.alt = alt || '';
        o.classList.add('active');
        document.body.style.overflow = 'hidden';
        const cb = o.querySelector('.image-zoom-close');
        if (cb) setTimeout(function () { cb.focus(); }, 50);
    }

    function closeZoom() {
        if (!overlay || !overlay.classList.contains('active')) return;
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    function init() {
        document.querySelectorAll('figure img').forEach(function (img) {
            const fig = img.closest('figure');
            if (!fig || fig.classList.contains('image-zoomable')) return;
            fig.classList.add('image-zoomable');
            img.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                openZoom(img.currentSrc || img.src, img.alt);
            });
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeZoom();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.ImageZoom = { open: openZoom, close: closeZoom };
})();
