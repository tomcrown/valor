import { motion, Variants, useInView, useAnimation } from "framer-motion";
import { useEffect, useRef, ReactNode } from "react";

// Premium easing curves
export const easeOutExpo = [0.16, 1, 0.3, 1] as const;
export const easeOutQuart = [0.25, 1, 0.5, 1] as const;
export const easeInOutQuart = [0.76, 0, 0.24, 1] as const;

// Fade up animation
export const fadeUpVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: easeOutExpo
        }
    }
};

// Fade in animation
export const fadeInVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.6,
            ease: "easeOut"
        }
    }
};

// Scale in animation
export const scaleInVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: easeOutExpo
        }
    }
};

// Stagger container
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        }
    }
};

// Stagger item
export const staggerItem: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: easeOutExpo
        }
    }
};

// Card hover animation
export const cardHoverVariants: Variants = {
    rest: {
        scale: 1,
        y: 0,
        transition: { duration: 0.3, ease: easeOutExpo }
    },
    hover: {
        scale: 1.02,
        y: -4,
        transition: { duration: 0.3, ease: easeOutExpo }
    }
};

// Button hover animation
export const buttonHoverVariants: Variants = {
    rest: { scale: 1, y: 0 },
    hover: {
        scale: 1.02,
        y: -2,
        transition: { duration: 0.2, ease: easeOutExpo }
    },
    tap: { scale: 0.98 }
};

// Line draw animation
export const lineDrawVariants: Variants = {
    hidden: { scaleX: 0, originX: 0 },
    visible: {
        scaleX: 1,
        transition: {
            duration: 0.8,
            ease: easeOutExpo
        }
    }
};

// Text reveal (word by word)
export const textRevealContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.03,
            delayChildren: 0.1,
        }
    }
};

export const textRevealWord: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: easeOutExpo
        }
    }
};

// Scroll-triggered animation wrapper
interface AnimateOnScrollProps {
    children: ReactNode;
    variants?: Variants;
    className?: string;
    delay?: number;
    once?: boolean;
}

export const AnimateOnScroll = ({
    children,
    variants = fadeUpVariants,
    className = "",
    delay = 0,
    once = true
}: AnimateOnScrollProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, margin: "-100px" });
    const controls = useAnimation();

    useEffect(() => {
        if (isInView) {
            controls.start("visible");
        }
    }, [isInView, controls]);

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={variants}
            className={className}
            style={{ transitionDelay: `${delay}s` }}
        >
            {children}
        </motion.div>
    );
};

// Stagger children wrapper
interface StaggerWrapperProps {
    children: ReactNode;
    className?: string;
    staggerDelay?: number;
}

export const StaggerWrapper = ({
    children,
    className = "",
    staggerDelay = 0.1
}: StaggerWrapperProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: staggerDelay,
                        delayChildren: 0.1,
                    }
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

// Export motion components for easy use
export const MotionDiv = motion.div;
export const MotionSpan = motion.span;
export const MotionH1 = motion.h1;
export const MotionH2 = motion.h2;
export const MotionP = motion.p;
export const MotionSection = motion.section;
