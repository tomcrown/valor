import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  MessageCircle,
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { VALOR_KNOWLEDGE } from "@/lib/valorKnowledge";

interface Question {
  id: string;
  question: string;
  answer: string | (() => string);
}

const ESSENTIAL_QUESTIONS: Question[] = [
  {
    id: "getting-started",
    question: "How do I get started on Valor?",
    answer: VALOR_KNOWLEDGE.gettingStarted,
  },
  {
    id: "what-is-valor",
    question: "What is Valor all about?",
    answer: VALOR_KNOWLEDGE.whatIsValor,
  },
  {
    id: "buy-first-share",
    question: "How do I buy my first player share?",
    answer: VALOR_KNOWLEDGE.buyFirstShare,
  },
  {
    id: "weekly-update",
    question: "How does the weekly update system work?",
    answer: VALOR_KNOWLEDGE.weeklyUpdate,
  },

  {
    id: "valor-pulse",
    question: "What is Valor Pulse?",
    answer: VALOR_KNOWLEDGE.valorPulse,
  },
  {
    id: "seasonal-data",
    question: "What are the seasonal periods and why do they matter?",
    answer: VALOR_KNOWLEDGE.seasonalData,
  },
];

const MORE_QUESTIONS: Question[] = [
  {
    id: "deposit-swap",
    question: "How do I deposit SUI or swap tokens to trade?",
    answer: VALOR_KNOWLEDGE.depositSwap,
  },
  {
    id: "google-login",
    question: "Can I use Valor without a crypto wallet?",
    answer: VALOR_KNOWLEDGE.googleLogin,
  },
  {
    id: "portfolio-view",
    question: "How do I view my portfolio and holdings?",
    answer: VALOR_KNOWLEDGE.portfolioView,
  },
  {
    id: "sell-share",
    question: "How do I sell a player share?",
    answer: VALOR_KNOWLEDGE.sellShare,
  },
  {
    id: "nft-shares",
    question: "What happens when I buy shares?",
    answer: VALOR_KNOWLEDGE.nftShares,
  },
  {
    id: "pulse-voting",
    question: "How does Pulse voting work?",
    answer: VALOR_KNOWLEDGE.pulseVoting,
  },
  {
    id: "player-shares",
    question: 'What are "player shares" and how do they work?',
    answer: VALOR_KNOWLEDGE.playerShares,
  },
  {
    id: "data-source",
    question: "Where does the player data come from?",
    answer: VALOR_KNOWLEDGE.dataSource,
  },
  {
    id: "ai-scoring",
    question: "What is the AI scoring system?",
    answer: VALOR_KNOWLEDGE.aiScoring,
  },

  {
    id: "price-calculation",
    question: "How is a player's price calculated?",
    answer: VALOR_KNOWLEDGE.priceCalculation,
  },
  {
    id: "injury-handling",
    question: "What happens if a player gets injured?",
    answer: VALOR_KNOWLEDGE.injuryHandling,
  },
  {
    id: "ai-model",
    question: "How does the AI model work?",
    answer: VALOR_KNOWLEDGE.aiModelDetails,
  },
  {
    id: "weekly-analysis",
    question: "What does the weekly AI analysis include?",
    answer: VALOR_KNOWLEDGE.weeklyAnalysis,
  },
  {
    id: "data-storage",
    question: "Where is performance data stored?",
    answer: VALOR_KNOWLEDGE.dataStorage,
  },
  {
    id: "walrus-usage",
    question: "What is Walrus and why does Valor use it?",
    answer: VALOR_KNOWLEDGE.walrusUsage,
  },
  {
    id: "data-verification",
    question: "How does data verification work?",
    answer: VALOR_KNOWLEDGE.dataVerification,
  },
];

export function ValorAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [showMoreQuestions, setShowMoreQuestions] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<string | null>(null);
  const [displayedAnswer, setDisplayedAnswer] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);

  const typingInterval = useRef<number | null>(null);

  const handleQuestionClick = (question: Question) => {
    const answer =
      typeof question.answer === "function"
        ? question.answer()
        : question.answer;

    setCurrentAnswer(answer);
    setDisplayedAnswer("");
    setIsTyping(true);

    if (typingInterval.current) {
      clearInterval(typingInterval.current);
    }

    let index = 0;
    typingInterval.current = window.setInterval(() => {
      setDisplayedAnswer((prev) => prev + answer.charAt(index));
      index++;
      if (index >= answer.length) {
        if (typingInterval.current) clearInterval(typingInterval.current);
        typingInterval.current = null;
        setIsTyping(false);
      }
    }, 20);
  };

  useEffect(() => {
    return () => {
      if (typingInterval.current) clearInterval(typingInterval.current);
    };
  }, []);

  const handleBack = () => {
    setCurrentAnswer(null);
  };

  return (
    <div className="fixed bottom-10 right-10 z-50 ">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              "w-14 h-14 rounded-full shadow-lg hover:scale-110 transition-transform",
              isOpen && "scale-110"
            )}
          >
            {isOpen ? (
              <X className="w-7 h-7 text-primary-foreground" />
            ) : (
              <div className="relative flex items-center justify-center w-16 h-16">
                <motion.span
                  className="absolute rounded-full border-2 border-primary/40 w-20 h-20"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative"
                >
                  <MessageCircle className="w-7 h-7 text-primary-foreground" />
                </motion.div>
              </div>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[380px] h-[560px] p-0 mr-4 mb-2"
          align="end"
          side="top"
        >
          <div className="p-4 border-b border-border bg-primary/100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">
                  Valor AI Assistant
                </h3>
                <p className="text-xs text-muted-foregroun text-white">
                  {currentAnswer
                    ? "Scroll to read answer"
                    : "Click any question below"}
                </p>
              </div>
            </div>
          </div>

          <ScrollArea className="h-[500px] bg-background">
            {currentAnswer ? (
              <div className="p-6">
                <Button onClick={handleBack} className="mb-4">
                  ← Back to Questions
                </Button>
                <div className="glass-card p-6 whitespace-pre-line text-sm leading-relaxed">
                  <ReactMarkdown>{displayedAnswer}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="mb-6 p-4 glass-card">
                  <p className="text-sm text-muted-foreground">
                    👋 Hi! I'm the Valor AI Assistant. Click any question below
                    and I'll provide detailed answers about how Valor works!
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-semibold text-primary mb-3 uppercase tracking-wide">
                    Essential Questions
                  </p>
                  <div className="space-y-2">
                    {ESSENTIAL_QUESTIONS.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => handleQuestionClick(q)}
                        className="w-full text-left text-sm p-3 rounded-2xl bg-card hover:bg-primary/20 hover:border-primary/80 transition-all border border-border/50 group"
                      >
                        <span className="transition-colors">{q.question}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {showMoreQuestions && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                      More Questions
                    </p>
                    <div className="space-y-2">
                      {MORE_QUESTIONS.map((q) => (
                        <button
                          key={q.id}
                          onClick={() => handleQuestionClick(q)}
                          className="w-full text-left text-sm p-3 rounded-2xl bg-card hover:bg-primary/20 hover:border-primary/80 transition-all border border-border/50 group"
                        >
                          <span className="transition-colors">
                            {q.question}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowMoreQuestions(!showMoreQuestions)}
                  className="w-full text-sm p-3 rounded-2xl bg-primary/10 hover:bg-primary/20 transition-all font-semibold text-primary flex items-center justify-center gap-2 border border-primary/80"
                >
                  {showMoreQuestions ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Show {MORE_QUESTIONS.length} More Questions
                    </>
                  )}
                </button>
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
