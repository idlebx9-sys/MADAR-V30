import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MadarLogo } from '../ui/MadarLogo.tsx';

export const MadarLoadingScreen: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const hasBooted = sessionStorage.getItem('madar_booted');
      return !hasBooted;
    }
    return false;
  });

  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (!loading) return;

    // Fast, realistic initialization ticker
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setLoading(false);
            sessionStorage.setItem('madar_booted', 'true');
          }, 300);
          return 100;
        }

        const step = prev < 25 ? 5 : prev < 75 ? 8 : prev < 95 ? 4 : 2;
        return Math.min(100, prev + step);
      });
    }, 35);

    return () => clearInterval(interval);
  }, [loading]);

  const formattedPercent = String(progress).padStart(2, '0') + '%';

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            key="madar-luxury-boot-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
            className="fixed inset-0 z-[99999] bg-[#070F1B] flex flex-col items-center justify-center text-white select-none overflow-hidden"
          >
            {/* Ambient luxury light spot */}
            <div className="absolute w-[500px] h-[500px] rounded-full bg-[#E4D2B8]/[0.035] blur-[120px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6 text-center space-y-8">
              {/* Official MADAR Logo centered */}
              <motion.div
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={progress === 100 ? 'filter drop-shadow-[0_0_25px_rgba(228,210,184,0.4)] transition-all duration-500' : ''}
              >
                <MadarLogo
                  variant="full"
                  size="xl"
                  layout="stacked"
                  showTagline={true}
                  arabicSubtitle={false}
                />
              </motion.div>

              {/* Progress counter & ultra-thin champagne line */}
              <div className="w-full max-w-[220px] space-y-2 pt-2">
                {/* 01% ... 100% formatted counter */}
                <div className="text-xs font-mono font-bold text-[#E4D2B8] tracking-widest text-center">
                  {formattedPercent}
                </div>

                {/* Ultra-thin champagne progress line */}
                <div className="relative w-full h-[1.5px] bg-white/[0.08] rounded-full overflow-hidden">
                  <motion.div
                    className="absolute top-0 bottom-0 right-0 bg-[#E4D2B8] shadow-[0_0_10px_rgba(228,210,184,0.8)]"
                    style={{ width: `${progress}%` }}
                    transition={{ ease: 'linear' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </>
  );
};
