import Lenis from '@studio-freight/lenis';

let lenisInstance: Lenis | null = null;
let rafId: number | null = null;

export function initSmoothScroll() {
    if (typeof window === 'undefined') return;

    if (lenisInstance) return lenisInstance;

    lenisInstance = new Lenis({
        duration: 1.4,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
        infinite: false,
    });

    function raf(time: number) {
        lenisInstance?.raf(time);
        rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return lenisInstance;
}

export function destroySmoothScroll() {
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }
    if (lenisInstance) {
        lenisInstance.destroy();
        lenisInstance = null;
    }
}

export function getLenis() {
    return lenisInstance;
}

