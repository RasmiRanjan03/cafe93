import { AnimatePresence, motion } from 'framer-motion';
import Wordmark from './Wordmark';

/** Brand loader shown until the hero scene renders its first frame. */
export default function Loader({ done }: { done: boolean }) {
  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-8 bg-charcoal text-cream"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          initial={{ clipPath: 'inset(0 0 0% 0)' }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          role="status"
          aria-live="polite"
        >
          <Wordmark size="lg" />
          <div className="h-[3px] w-48 overflow-hidden rounded-full bg-cream/10">
            <motion.div
              className="h-full bg-chili"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <p className="eyebrow text-cream/60">Steaming your momos…</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
