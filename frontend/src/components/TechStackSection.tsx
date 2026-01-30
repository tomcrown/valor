import { motion, useAnimationControls } from "framer-motion";
import {
  staggerContainer,
  staggerItem,
  easeOutExpo,
  fadeUpVariants,
} from "@/components/ui/motion";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const techStack = [
  {
    image: "/sui logo.png",
    name: "Sui Network",
    description: "Built on Sui for instant finality and low transaction costs.",
    gradient: "from-blue-500/20 to-cyan-500/10",
  },
  {
    image: "/walrus.png",
    name: "Walrus",
    description: "Decentralized storage for secure and permanent data.",
    gradient:
      "from-emerald-500/50 to-emerald-500/10 dark:from-emerald-400 dark:to-emerald-400/30",
  },
  {
    image: "/ai.png",
    name: "AI Engine",
    description:
      "Proprietary ML models for accurate player valuations and analysis.",
    gradient: "from-primary/20 to-orange-500/10",
  },
  {
    image: "/zklogin.avif",
    name: "Enoki",
    description:
      "Sign in with Google, no wallet setup needed. Zero-knowledge authentication for seamless onboarding.",
    gradient: "from-[#6648fa] to-[#6648FA9C]",
  },
  {
    image: "/nautilus.png",
    name: "Nautilus",
    description:
      "Hardware-verified AI computation inside AWS Nitro Enclaves. Cryptographically proves pricing integrity.",
    gradient: "from-[#80423b] to-[#874342]",
  },
  {
    image: "/suins.avif",
    name: "SuiNS",
    description: "Human-readable names for easy wallet address management.",
    gradient:
      "from-[#2D2545FF] to-[#2D25459C] dark:from-#2D2545FF-400 dark:to-#2D2545FF-400/30",
  },
  {
    image: "/seal.png",
    name: "Seal",
    description:
      "Cryptographic access control for premium AI insights. Encrypted content unlocked only by NFT ownership or Pulse Points.",
    gradient:
      "from-purple-500/50 to-purple-500/10 dark:from-purple-400 dark:to-purple-400/30",
  },
];

export const TechStackSection = () => {
  const controls = useAnimationControls();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const extendedStack = [...techStack, ...techStack, ...techStack];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const itemWidth = isMobile ? 280 : 336;
  const gap = 16;
  const totalItemWidth = itemWidth + gap;
  const totalDistance = techStack.length * totalItemWidth;
  const animationDuration = techStack.length * 5;

  useEffect(() => {
    if (isHovered || isMobile) return;

    const animate = async () => {
      await controls.start({
        x: -totalDistance,
        transition: {
          duration: animationDuration,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        },
      });
    };

    animate();
  }, [controls, animationDuration, totalDistance, isHovered, isMobile]);

  const handleMouseEnter = () => {
    if (isMobile) return;
    setIsHovered(true);
    controls.stop();
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setIsHovered(false);

    if (!trackRef.current) return;

    const currentTransform = window.getComputedStyle(
      trackRef.current,
    ).transform;
    const matrix = new DOMMatrix(currentTransform);
    let currentX = matrix.m41;

    while (currentX <= -totalDistance) {
      currentX += totalDistance;
    }
    while (currentX > 0) {
      currentX -= totalDistance;
    }

    const progress = Math.abs(currentX) / totalDistance;
    const timeLeft = animationDuration * (1 - progress);

    controls.set({ x: currentX });
    controls.start({
      x: -totalDistance,
      transition: {
        duration: timeLeft,
        repeat: Infinity,
        ease: "linear",
        repeatType: "loop",
      },
    });
  };

  const handlePrevious = () => {
    const newIndex =
      currentIndex === 0 ? techStack.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);

    controls.start({
      x: -newIndex * totalItemWidth,
      transition: {
        duration: 0.5,
        ease: easeOutExpo,
      },
    });
  };

  const handleNext = () => {
    const newIndex =
      currentIndex === techStack.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);

    controls.start({
      x: -newIndex * totalItemWidth,
      transition: {
        duration: 0.5,
        ease: easeOutExpo,
      },
    });
  };

  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <section id="tech-stack" className="relative md:pt-24 overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/10 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="glass-card p-8 md:p-12 relative overflow-hidden bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 animate-gradient">
          {/* Floating motion orbs */}
          <motion.div
            className="absolute top-16 left-12 w-32 h-32 rounded-full blur-3xl"
            style={{ background: "hsl(var(--primary) / 0.08)" }}
            animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-16 right-12 w-40 h-40 rounded-full blur-3xl"
            style={{ background: "hsl(var(--secondary) / 0.08)" }}
            animate={{ y: [20, -20, 20], x: [10, -10, 10] }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          />

          <div className="relative z-10">
            {/* Header */}
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <motion.span
                className="inline-block text-primary text-sm font-medium tracking-widest uppercase mb-4"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Technology
              </motion.span>

              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Powered by the <span className="gradient-text">Best</span>
              </h2>

              <p className="text-muted-foreground max-w-xl mx-auto">
                Built with cutting-edge Web3 technology for maximum performance
                and reliability.
              </p>
            </motion.div>

            {/* Tech cards carousel */}
            <div className="relative">
              {/* Gradient fade edges - hide on mobile */}
              <div className="hidden md:block absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background/80 to-transparent z-10 pointer-events-none" />
              <div className="hidden md:block absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background/80 to-transparent z-10 pointer-events-none" />

              {/* Navigation arrows */}
              <button
                onClick={handlePrevious}
                className="absolute left-2 md:-left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/80 backdrop-blur border border-border/50 hover:bg-background hover:border-primary/50 transition-all duration-300 flex items-center justify-center group shadow-lg"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-2 md:-right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-background/80 backdrop-blur border border-border/50 hover:bg-background hover:border-primary/50 transition-all duration-300 flex items-center justify-center group shadow-lg"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </button>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="overflow-hidden px-2 md:px-0"
              >
                <motion.div
                  ref={trackRef}
                  className="flex gap-4"
                  animate={controls}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{ width: "max-content" }}
                >
                  {(isMobile ? techStack : extendedStack).map((tech, i) => (
                    <motion.div
                      key={`${tech.name}-${i}`}
                      variants={staggerItem}
                      className="relative group"
                    >
                      <motion.div
                        className="w-[280px] md:w-80 p-6 md:p-8 text-center h-[280px] md:h-80 relative overflow-hidden rounded-2xl bg-card border border-border/50"
                        whileHover={{
                          y: -8,
                          scale: 1.02,
                          transition: {
                            duration: 0.3,
                            ease: easeOutExpo,
                          },
                        }}
                      >
                        {/* Hover gradient overlay */}
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-br ${tech.gradient} opacity-0 rounded-2xl`}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.4 }}
                        />

                        {/* Image container */}
                        <motion.div
                          className="relative mx-auto mb-4 md:mb-6 w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden"
                          whileHover={{
                            scale: 1.15,
                            rotate: [0, -5, 5, 0],
                            transition: { duration: 0.5 },
                          }}
                        >
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${tech.gradient}`}
                          />
                          <div className="relative z-10 w-full h-full flex items-center justify-center bg-background/60 backdrop-blur rounded-2xl">
                            <img
                              src={tech.image}
                              alt={tech.name}
                              className="w-10 h-10 md:w-12 md:h-12 object-contain"
                            />
                          </div>
                        </motion.div>

                        <h3 className="relative text-lg md:text-xl font-bold mb-2 md:mb-3">
                          {tech.name}
                        </h3>

                        <p className="relative text-muted-foreground text-xs md:text-sm leading-relaxed mx-auto">
                          {tech.description}
                        </p>

                        {/* Animated border shimmer */}
                        <motion.div
                          className="absolute inset-0 rounded-2xl border-2 border-transparent pointer-events-none"
                          style={{
                            background:
                              "linear-gradient(var(--card), var(--card)) padding-box, linear-gradient(135deg, transparent 0%, hsl(var(--primary) / 0.4) 50%, transparent 100%) border-box",
                          }}
                          animate={{
                            opacity: [0, 0.8, 0],
                            scale: [1, 1.02, 1],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: (i % techStack.length) * 0.3,
                            ease: "easeInOut",
                          }}
                        />
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Dot indicators for mobile */}
              <div className="flex md:hidden justify-center gap-2 mt-6">
                {techStack.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index);
                      controls.start({
                        x: -index * totalItemWidth,
                        transition: {
                          duration: 0.5,
                          ease: easeOutExpo,
                        },
                      });
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-primary w-6"
                        : "bg-muted-foreground/30"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
