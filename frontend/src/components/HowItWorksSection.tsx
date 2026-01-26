import { motion } from "framer-motion";
import {
    staggerContainer,
    staggerItem,
    lineDrawVariants,
    easeOutExpo,
    fadeUpVariants
} from "@/components/ui/motion";
import { Wallet, Search, ShoppingCart, Vote } from "lucide-react";

const steps = [
    {
        icon: <Wallet className="w-6 h-6" />,
        title: "Connect Wallet",
        description: "Link your Sui wallet to start trading player shares securely.",
        step: "01"
    },
    {
        icon: <Search className="w-6 h-6" />,
        title: "Explore Data",
        description: "Browse AI-powered player analytics and real-time valuations.",
        step: "02"
    },
    {
        icon: <ShoppingCart className="w-6 h-6" />,
        title: "Buy Shares / NFTs",
        description: "Purchase fractional ownership of players as blockchain NFTs.",
        step: "03"
    },
    {
        icon: <Vote className="w-6 h-6" />,
        title: "Vote on Pulse",
        description: "Participate in Valor Pulse to influence player rankings.",
        step: "04"
    }
];

export const HowItWorksSection = () => {
    return (
        <section id="how-it-works" className="relative py-24 px-6 overflow-hidden mt-10">
            {/* Background accent */}
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] rounded-full opacity-30"
                style={{
                    background: "radial-gradient(ellipse, hsl(var(--glow-secondary) / 0.1) 0%, transparent 70%)",
                }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative z-10 max-w-6xl mx-auto">
                {/* Section header */}
                <motion.div
                    variants={fadeUpVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >

                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        How It Works
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Start trading football player shares in just four simple steps.
                    </p>
                </motion.div>

                {/* Steps grid */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="relative grid grid-cols-1 md:grid-cols-4 gap-6"
                >


                    {steps.map((step, i) => (
                        <motion.div
                            key={step.title}
                            variants={staggerItem}
                            className="relative"
                        >
                            <motion.div
                                className="glass-card p-6  h-full group cursor-default relative overflow-hidden"
                                whileHover={{
                                    y: -8,
                                    scale: 1.02,
                                    transition: { duration: 0.3, ease: easeOutExpo }
                                }}
                            >
                                {/* Step number */}
                                <motion.span
                                    className="
                                    absolute top-0 right-0
                                    w-10 h-10 rounded-full
                                    bg-primary
                                    font-bold text-sm text-white
                                    flex items-center justify-center
                                "
                                    initial={{
                                        scale: 0,
                                        x: -6,
                                        y: 6,
                                        opacity: 0,
                                    }}
                                    whileInView={{
                                        scale: 1,
                                        x: 6,
                                        y: -8,
                                        opacity: 1,
                                    }}
                                    viewport={{ once: true }}
                                    transition={{
                                        delay: 0.25 + i * 0.1,
                                        duration: 0.45,
                                        ease: easeOutExpo,
                                    }}
                                >
                                    {step.step}
                                </motion.span>



                                {/* Icon */}
                                <motion.div
                                    className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary/20 transition-colors"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {step.icon}
                                </motion.div>

                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {step.description}
                                </p>

                                {/* Hover glow */}
                                <motion.div
                                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"
                                    style={{
                                        background: "radial-gradient(circle at center, hsl(var(--primary) / 0.08) 0%, transparent 70%)",
                                    }}
                                />
                            </motion.div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
