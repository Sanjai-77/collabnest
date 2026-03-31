/**
 * Shared Framer Motion animation variants used across page components.
 * Centralised here to avoid duplication — previously copy-pasted in 10+ files.
 */

// Staggered fade-in for container elements (wraps child items)
export const staggerContainer = (staggerDelay = 0.1) => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: staggerDelay },
  },
});

// Slide-up fade-in for individual child items
export const fadeInUp = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

// Slide-in from left (used in notifications)
export const fadeInLeft = {
  hidden: { x: -20, opacity: 0 },
  show: { x: 0, opacity: 1 },
};
