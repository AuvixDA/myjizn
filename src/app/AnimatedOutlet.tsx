import { Suspense } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { PageSkeleton } from '../shared/ui/Skeleton';

// react-router replaces the outlet element on navigation before it can
// exit-animate; useOutlet() captures the current element so AnimatePresence
// can still render (and fade out) the page that's leaving.
export function AnimatedOutlet() {
  const location = useLocation();
  const element = useOutlet();
  const reduceMotion = useReducedMotion();

  // The blur+slide page transition is the single most disorienting
  // animation in the app for vestibular-sensitive users — a plain
  // opacity crossfade (or none) respects prefers-reduced-motion here even
  // though the CSS-only fallback in tailwind.css can't reach Framer
  // Motion's JS-driven animations.
  const variants = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 8, filter: 'blur(3px)' },
        animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
        exit: { opacity: 0, y: -4, filter: 'blur(3px)' },
      };

  return (
    // popLayout pulls the exiting page out of flow immediately, so the new
    // page can enter right away (crossfade) instead of waiting for the old
    // one to finish leaving — mode="wait" left a blank gap between pages.
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={location.pathname}
        initial={variants.initial}
        animate={variants.animate}
        exit={variants.exit}
        transition={{ duration: reduceMotion ? 0.01 : 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        <Suspense fallback={<PageSkeleton />}>{element}</Suspense>
      </motion.div>
    </AnimatePresence>
  );
}
