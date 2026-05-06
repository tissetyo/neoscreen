'use client';

import { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  videoUrl: string | null;
  onDismiss: () => void;
  visible: boolean;
}

export default function StartupVideo({ videoUrl, onDismiss, visible }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const dismissed = useRef(false);

  const handleDismiss = useCallback(() => {
    if (dismissed.current) return;
    dismissed.current = true;
    onDismiss();
  }, [onDismiss]);

  useEffect(() => {
    if (!visible) return;
    dismissed.current = false;
    const handler = () => handleDismiss();
    window.addEventListener('keydown', handler);
    window.addEventListener('click', handler);
    window.addEventListener('touchstart', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('click', handler);
      window.removeEventListener('touchstart', handler);
    };
  }, [visible, handleDismiss]);

  useEffect(() => {
    if (visible && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [visible]);

  const src = videoUrl || '/videos/startup-default.mp4';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[10000] bg-black flex items-center justify-center"
        >
          <video
            ref={videoRef}
            src={src}
            loop
            muted
            playsInline
            autoPlay
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 h-[20vh] bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-[5vh] left-0 right-0 text-center pointer-events-none"
          >
            <p className="text-white/60 text-[1.2vw] font-medium tracking-wide animate-pulse">
              Press any key to continue
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
