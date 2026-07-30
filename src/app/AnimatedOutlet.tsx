import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// react-router replaces the outlet element on navigation before it can
// exit-animate; useOutlet() captures the current element so AnimatePresence
// can still render (and fade out) the page that's leaving.
export function AnimatedOutlet() {
  const location = useLocation();
  const element = useOutlet();

  return (
    // popLayout pulls the exiting page out of flow immediately, so the new
    // page can enter right away (crossfade) instead of waiting for the old
    // one to finish leaving — mode="wait" left a blank gap between pages.
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -4, filter: 'blur(3px)' }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        {element}
      </motion.div>
    </AnimatePresence>
  );
}
