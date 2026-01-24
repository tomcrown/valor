"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FeatureCard from "./FeatureCard";
import {
    BarChart3,
    Calendar,
    ImageIcon,
    TrendingUp,
    Vote,
    Zap,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function KeyFeaturesSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const paragraphRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        if (
            !sectionRef.current ||
            !contentRef.current ||
            !headingRef.current ||
            !paragraphRef.current
        )
            return;

        const mm = gsap.matchMedia();

        const headingWords =
            headingRef.current.querySelectorAll<HTMLElement>(".word");
        const paragraphWords =
            paragraphRef.current.querySelectorAll<HTMLElement>(".word");
        const cards = gsap.utils.toArray<HTMLElement>(".feature-card");

        // ---------- Desktop ----------
        mm.add("(min-width: 768px)", () => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: contentRef.current,
                    start: "top top",
                    pin: true,
                    scrub: 2,
                    anticipatePin: 1,
                },
            });

            tl.fromTo(
                headingWords,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0.15,
                    duration: 1,
                    ease: "power1.out",
                }
            )
                .fromTo(
                    paragraphWords,
                    { opacity: 0, y: 12 },
                    {
                        opacity: 1,
                        y: 0,
                        stagger: 0.06,
                        duration: 0.8,
                        ease: "power1.out",
                    },
                    "-=0.6"
                )
                .to({}, { duration: 0.5 })
                .fromTo(
                    cards,
                    { opacity: 0, scale: 0.9, y: 40 },
                    {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        stagger: 0.15,
                        duration: 0.8,
                        ease: "power2.out",
                    }
                );
        });

        // ---------- Mobile ----------
        mm.add("(max-width: 768px)", () => {
            gsap
                .timeline({
                    scrollTrigger: {
                        trigger: contentRef.current,
                        start: "top 70%",
                        end: "bottom 90%",
                        scrub: 1.5,
                    },
                })
                .fromTo(
                    headingWords,
                    { opacity: 0, y: 16 },
                    {
                        opacity: 1,
                        y: 0,
                        stagger: 0.08,
                        duration: 0.6,
                        ease: "power1.out",
                    }
                )
                .fromTo(
                    paragraphWords,
                    { opacity: 0, y: 10 },
                    {
                        opacity: 1,
                        y: 0,
                        stagger: 0.05,
                        duration: 0.5,
                        ease: "power1.out",
                    },
                    "-=0.4"
                )
                .fromTo(
                    cards,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        stagger: 0.50,
                        duration: 0.7,
                        ease: "power2.out",
                    },
                    "+=0.2"
                );
        });

        return () => {
            mm.revert();
            ScrollTrigger.getAll().forEach((t) => t.kill());
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative w-full md:h-[180vh] bg-card/30 mb-36"
        >
            <div
                ref={contentRef}
                className="container mx-auto px-4 min-h-screen flex flex-col justify-center "
            >
                {/* Heading */}
                <div className="text-center mb-16 mt-4 md:mt-20">
                    <h2
                        ref={headingRef}
                        className="text-3xl md:text-4xl font-bold mb-4 overflow-hidden"
                    >
                        {"Key Features".split(" ").map((word, i) => (
                            <span key={i} className="word inline-block opacity-0 transition-opacity duration-300 ease-out mr-2">
                                {word}
                            </span>
                        ))}
                    </h2>

                    <p
                        ref={paragraphRef}
                        className="text-muted-foreground max-w-xl mx-auto overflow-hidden"
                    >
                        {"Everything you need to trade football players on-chain"
                            .split(" ")
                            .map((word, i) => (
                                <span
                                    key={i}
                                    className="word inline-block opacity-0 transition-opacity duration-300 ease-out mr-1"
                                >
                                    {word}
                                </span>
                            ))}
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="feature-card">
                        <FeatureCard
                            icon={<Zap className="w-7 h-7" />}
                            title="AI-Powered Analysis"
                            description="AI analyzes real match data to generate accurate, unbiased player performance scores (0-100)."
                            delay={100}
                        />
                    </div>

                    <div className="feature-card">
                        <FeatureCard
                            icon={<Calendar className="w-7 h-7" />}
                            title="Seasonal Performance Tracking"
                            description="Track player evolution across Early, Mid, and Current seasons. Understand price history and form trends."
                            delay={150}
                        />
                    </div>

                    <div className="feature-card">
                        <FeatureCard
                            icon={<Vote className="w-7 h-7" />}
                            title="Valor Pulse - Community Voting"
                            description="Vote YES/NO on weekly player predictions. See real-time community sentiment and BULLISH/BEARISH indicators."
                            delay={200}
                        />
                    </div>

                    <div className="feature-card">
                        <FeatureCard
                            icon={<ImageIcon className="w-7 h-7" />}
                            title="NFT Share Certificates"
                            description="Every purchase mints a unique NFT showing your shares, purchase price, and timestamp. View in your portfolio."
                            delay={250}
                        />
                    </div>

                    <div className="feature-card">
                        <FeatureCard
                            icon={<TrendingUp className="w-7 h-7" />}
                            title="Real-Time Valuations"
                            description="Player values update in real-time based on performance metrics, market demand, and bonding curve pricing."
                            delay={300}
                        />
                    </div>

                    <div className="feature-card">
                        <FeatureCard
                            icon={<BarChart3 className="w-7 h-7" />}
                            title="Portfolio Analytics"
                            description="Track your NFT holdings, positions, P&L, and performance with comprehensive portfolio management tools."
                            delay={450}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
