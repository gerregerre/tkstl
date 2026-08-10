import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import heroImage from '@/assets/hero-tennis-court.jpg';
import { PLAYER_ROSTER, getPlayerAvatar } from '@/lib/playerAvatars';


interface HeroSectionProps {
  onScrollDown?: () => void;
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const ease: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const fadeSlideUp = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease },
  },
};

const fadeScale = {
  initial: { opacity: 0, scale: 0.92 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease },
  },
};

export function HeroSection({ onScrollDown }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Parallax: image moves slower than scroll
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  // Slight scale-up on scroll for depth
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.15]);
  // Content fades out as you scroll past
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.6], [0, -40]);

  return (
    <section ref={sectionRef} className="relative w-full min-h-[80vh] sm:h-screen overflow-hidden">
      {/* Parallax Background Image */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`,
          y: bgY,
          scale: bgScale,
        }}
      />

      {/* ATP-Style Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background" />

      {/* Diagonal Speed Line Accent */}
      <div className="absolute inset-0 diagonal-accent opacity-60" />

      {/* Subtle Radial Glow - Cyan */}
      <div className="absolute inset-0 bg-gradient-radial-glow opacity-40" />

      {/* Content with staggered entrance + scroll fade */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 h-full flex flex-col items-center justify-center text-center sm:px-6 px-px py-[160px]"
      >
        <motion.div
          variants={staggerChildren}
          initial="initial"
          animate="animate"
          className="flex flex-col items-center"
        >
          {/* ATP-Style Badge */}
          <motion.div
            variants={fadeScale}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded px-3 sm:px-4 py-1.5 mb-6 sm:mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary font-bold tracking-widest text-[10px] sm:text-xs uppercase">
              Est. 2017
            </span>
          </motion.div>

          {/* Club Name */}
          <motion.p
            variants={fadeSlideUp}
            className="font-display text-lg sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4 tracking-wide uppercase not-italic drop-shadow-lg text-muted-foreground lg:text-5xl animate-shimmer bg-clip-text"
          >
            TENNISKLUBBEN STORA TENNISLIGAN
          </motion.p>

          {/* Main Heading */}
          <motion.h1
            variants={fadeSlideUp}
            className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-foreground mb-1 sm:mb-2 tracking-tight uppercase drop-shadow-lg"
          >
            WHERE TRADITIONS
          </motion.h1>

          <motion.h2
            variants={fadeSlideUp}
            className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-gradient-cyan mb-6 sm:mb-8 tracking-tight uppercase drop-shadow-lg"
          >
            MEETS EXCELLENCE
          </motion.h2>

          {/* Subheading */}
          <motion.p
            variants={fadeSlideUp}
            className="text-muted-foreground max-w-xs sm:max-w-lg md:max-w-2xl mx-auto text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed mb-8 sm:mb-10 font-medium px-4 drop-shadow-sm"
          >
            Experience championship-level doubles tennis with precision, energy, and the spirit of competition.
          </motion.p>

          {/* Player Lineup — tour presentation */}
          <motion.div variants={fadeSlideUp} className="w-full flex flex-col items-center">
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <span className="h-px w-8 sm:w-14 bg-gradient-to-r from-transparent to-primary/60" />
              <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.35em] text-primary/90">
                The Field
              </span>
              <span className="h-px w-8 sm:w-14 bg-gradient-to-l from-transparent to-primary/60" />
            </div>

            <motion.ul
              initial="initial"
              animate="animate"
              variants={{ animate: { transition: { staggerChildren: 0.09, delayChildren: 0.5 } } }}
              className="flex flex-wrap items-start justify-center gap-x-3 gap-y-5 sm:gap-x-6 md:gap-x-8 px-2"
            >
              {PLAYER_ROSTER.map((name, i) => {
                const avatar = getPlayerAvatar(name);
                return (
                  <motion.li
                    key={name}
                    variants={{
                      initial: { opacity: 0, y: 26, scale: 0.86, filter: 'blur(6px)' },
                      animate: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        filter: 'blur(0px)',
                        transition: { duration: 0.7, ease },
                      },
                    }}
                    className="group flex flex-col items-center"
                  >
                    <motion.div
                      whileHover={{ y: -6, scale: 1.06 }}
                      transition={{ duration: 0.3, ease }}
                      className="relative"
                    >
                      {/* clay glow ring */}
                      <div className="absolute -inset-1 rounded-full bg-primary/25 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full player-avatar ring-1 ring-primary/30 group-hover:ring-primary transition-all duration-300 shadow-card overflow-hidden">
                        {avatar ? (
                          <img src={avatar} alt={`${name} — TKSTL player`} className="w-full h-full player-avatar-img" loading="lazy" />
                        ) : (
                          <span className="flex items-center justify-center w-full h-full font-display font-black text-foreground">
                            {name.charAt(0)}
                          </span>
                        )}
                      </div>
                      {/* seed number */}
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary text-primary-foreground text-[9px] sm:text-[10px] font-black flex items-center justify-center tabular-nums shadow-card">
                        {i + 1}
                      </span>
                    </motion.div>
                    <span className="mt-2 sm:mt-3 font-display text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-widest text-foreground/80 group-hover:text-primary transition-colors">
                      {name}
                    </span>
                  </motion.li>
                );
              })}
            </motion.ul>
          </motion.div>
        </motion.div>
      </motion.div>


      {/* Scroll Indicator */}
      {onScrollDown && (
        <motion.button
          onClick={onScrollDown}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
        >
          <div className="w-6 h-10 rounded-full border-2 border-current flex items-start justify-center p-1.5 group-hover:border-primary transition-colors">
            <div className="w-1.5 h-3 bg-current rounded-full animate-bounce group-hover:bg-primary transition-colors" />
          </div>
        </motion.button>
      )}

      {/* Bottom Edge */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
    </section>
  );
}
