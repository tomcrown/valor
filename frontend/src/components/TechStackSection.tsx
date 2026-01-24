import { motion } from "framer-motion";
import {
    staggerContainer,
    staggerItem,
    easeOutExpo,
    fadeUpVariants,
} from "@/components/ui/motion";

const techStack = [
    {
        image: "/sui logo.png",
        name: "Sui Network",
        description:
            "Built on Sui for instant finality and low transaction costs.",
        gradient: "from-blue-500/20 to-cyan-500/10",
    },
    {
        image: "/walrus.png",
        name: "Walrus",
        description:
            "Decentralized storage for secure and permanent data.",
        gradient: "from-emerald-500/20 to-teal-500/10",
    },
    {
        image: "/ai.png",
        name: "AI Engine",
        description:
            "Proprietary ML models for accurate player valuations.",
        gradient: "from-primary/20 to-orange-500/10",
    },
];

export const TechStackSection = () => {
    return (
        <section
            id="tech-stack"
            className="relative pt-16 overflow-hidden"
        >
            {/* Section dividers */}
            {/* <div className="absolute top-0 left-0 w-full h-px bg-border/40" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-border/40" /> */}

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
                                Powered by the{" "}
                                <span className="gradient-text">Best</span>
                            </h2>

                            <p className="text-muted-foreground max-w-xl mx-auto">
                                Built with cutting-edge Web3 technology for maximum
                                performance and reliability.
                            </p>
                        </motion.div>

                        {/* Tech cards */}
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-8"
                        >
                            {techStack.map((tech, i) => (
                                <motion.div
                                    key={tech.name}
                                    variants={staggerItem}
                                    className="relative group"
                                >
                                    <motion.div
                                        className=" p-8 text-center h-full relative overflow-hidden"
                                        whileHover={{
                                            y: -8,
                                            scale: 1.02,
                                            transition: {
                                                duration: 0.4,
                                                ease: easeOutExpo,
                                            },
                                        }}
                                    >
                                        {/* Hover gradient */}
                                        <div
                                            className={`absolute inset-0 bg-gradient-to-br ${tech.gradient} opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500`}
                                        />

                                        {/* Image Icon */}
                                        <motion.div
                                            className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-muted to-secondary flex items-center justify-center mx-auto mb-6"
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <img
                                                src={tech.image}
                                                alt={tech.name}
                                                className="w-12 h-12 object-contain"
                                            />

                                            {/* Glow */}
                                            <div
                                                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                style={{
                                                    boxShadow:
                                                        "0 0 30px hsl(var(--primary) / 0.35)",
                                                }}
                                            />
                                        </motion.div>

                                        <h3 className="relative text-xl font-bold mb-3">
                                            {tech.name}
                                        </h3>

                                        <p className="relative text-muted-foreground text-sm">
                                            {tech.description}
                                        </p>

                                        {/* Animated border */}
                                        <motion.div
                                            className="absolute inset-0 rounded-xl border-2 border-transparent pointer-events-none"
                                            style={{
                                                background:
                                                    "linear-gradient(var(--card), var(--card)) padding-box, linear-gradient(135deg, transparent 0%, hsl(var(--primary) / 0.35) 50%, transparent 100%) border-box",
                                            }}
                                            animate={{ opacity: [0, 1, 0] }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                delay: i * 0.5,
                                            }}
                                        />
                                    </motion.div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
