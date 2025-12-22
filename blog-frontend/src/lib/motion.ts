import Lenis from '@studio-freight/lenis';

let lenisInstance: Lenis | null = null;

export function initSmoothScroll() {
    if (typeof window === 'undefined') return;

    if (lenisInstance) return lenisInstance;

    lenisInstance = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
    });

    function raf(time: number) {
        lenisInstance?.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return lenisInstance;
}

export function destroySmoothScroll() {
    if (lenisInstance) {
        lenisInstance.destroy();
        lenisInstance = null;
    }
}
