/**
 * Mermaid Diagram Zoom Script
 * Add to Sphinx _static/ folder and include in conf.py
 *
 * Usage: This script automatically initializes zoom functionality
 * for all Mermaid diagrams on the page after they're rendered.
 */

(function() {
    'use strict';

    let overlayElement = null;
    let isInitialized = false;

    /**
     * Create the zoom overlay element (only once)
     */
    function createOverlay() {
        if (overlayElement) return overlayElement;

        const overlay = document.createElement('div');
        overlay.className = 'mermaid-zoom-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-label', 'Zoomed diagram view');

        const closeBtn = document.createElement('button');
        closeBtn.className = 'mermaid-zoom-close';
        closeBtn.innerHTML = '×';
        closeBtn.setAttribute('aria-label', 'Close zoomed diagram');
        closeBtn.setAttribute('type', 'button');
        overlay.appendChild(closeBtn);

        document.body.appendChild(overlay);
        overlayElement = overlay;

        // Event listeners
        overlay.addEventListener('click', function(e) {
            // Close when clicking the overlay background (not SVG, not close button)
            if (e.target === overlay || e.target.classList.contains('mermaid-zoom-overlay')) {
                closeMermaidZoom();
            }
        });

        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeMermaidZoom();
        });

        return overlay;
    }

    /**
     * Initialize zoom functionality for all Mermaid diagrams
     */
    function initMermaidZoom() {
        if (isInitialized) return;

        createOverlay();

        // Find all rendered Mermaid diagrams
        document.querySelectorAll('pre.mermaid, div.mermaid').forEach(function(element) {
            // Skip if already wrapped
            if (element.parentElement.classList.contains('mermaid-container')) return;

            const svg = element.querySelector('svg');
            if (!svg) return; // Not rendered yet

            // Wrap the element
            const wrapper = document.createElement('div');
            wrapper.className = 'mermaid-container';
            wrapper.setAttribute('role', 'button');
            wrapper.setAttribute('tabindex', '0');
            wrapper.setAttribute('aria-label', 'Click to zoom diagram');

            element.parentNode.insertBefore(wrapper, element);
            wrapper.appendChild(element);

            // Click handler for zoom
            wrapper.addEventListener('click', function(e) {
                e.stopPropagation();
                zoomMermaid(svg);
            });

            // Keyboard handler for accessibility
            wrapper.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    zoomMermaid(svg);
                }
            });
        });

        // Global keyboard handler for Escape
        if (!isInitialized) {
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeMermaidZoom();
                }
            });
        }

        isInitialized = true;
        console.debug('Mermaid zoom initialized for', document.querySelectorAll('.mermaid-container').length, 'diagrams');
    }

    /**
     * Open zoom view for a diagram
     */
    function zoomMermaid(svg) {
        const overlay = overlayElement || createOverlay();

        // Clone the SVG
        const svgClone = svg.cloneNode(true);

        // Remove any existing SVG in overlay
        const existingSvg = overlay.querySelector('svg');
        if (existingSvg) {
            existingSvg.remove();
        }

        // Add cloned SVG to overlay
        overlay.appendChild(svgClone);

        // Show overlay
        overlay.classList.remove('closing');
        overlay.classList.add('active');

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Focus the close button for accessibility
        setTimeout(function() {
            const closeBtn = overlay.querySelector('.mermaid-zoom-close');
            if (closeBtn) closeBtn.focus();
        }, 100);
    }

    /**
     * Close zoom view
     */
    function closeMermaidZoom() {
        const overlay = overlayElement;
        if (!overlay || !overlay.classList.contains('active')) return;

        // Trigger closing animation
        overlay.classList.add('closing');

        setTimeout(function() {
            overlay.classList.remove('active', 'closing');
            document.body.style.overflow = '';

            // Return focus to the body or previously focused element
            document.body.focus();
        }, 200);
    }

    /**
     * Watch for Mermaid rendering using MutationObserver
     */
    function observeMermaidRendering() {
        const observer = new MutationObserver(function(mutations) {
            let foundSvg = false;

            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeName === 'svg' ||
                        (node.querySelector && node.querySelector('svg'))) {
                        foundSvg = true;
                    }
                });
            });

            if (foundSvg) {
                // Wait a bit for all SVGs to render, then initialize
                setTimeout(function() {
                    initMermaidZoom();
                    observer.disconnect(); // Stop observing once initialized
                }, 150);
            }
        });

        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Fallback: try initializing after a delay if observer doesn't fire
        setTimeout(function() {
            if (!isInitialized) {
                initMermaidZoom();
                observer.disconnect();
            }
        }, 2000);
    }

    /**
     * Initialize when DOM is ready
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observeMermaidRendering);
    } else {
        observeMermaidRendering();
    }

    // Expose functions globally if needed for manual initialization
    window.MermaidZoom = {
        init: initMermaidZoom,
        zoom: zoomMermaid,
        close: closeMermaidZoom
    };

})();