// import { TrendingUp, TrendingDown, Minus, Target, Zap } from "lucide-react";
// import { cn } from "@/lib/utils";
// import type { AIAnalysis } from "@/lib/openai";

// interface AIAnalysisPanelProps {
//   analysis: AIAnalysis;
//   playerName: string;
// }

// export function AIAnalysisPanel({
//   analysis,
//   playerName,
// }: AIAnalysisPanelProps) {
//   const getTrendIcon = () => {
//     switch (analysis.performance_trend) {
//       case "improving":
//         return <TrendingUp className="w-5 h-5 text-success" />;
//       case "declining":
//         return <TrendingDown className="w-5 h-5 text-destructive" />;
//       default:
//         return <Minus className="w-5 h-5 text-muted-foreground" />;
//     }
//   };

//   const getTrendColor = () => {
//     switch (analysis.performance_trend) {
//       case "improving":
//         return "text-success bg-success/10";
//       case "declining":
//         return "text-destructive bg-destructive/10";
//       default:
//         return "text-muted-foreground bg-muted";
//     }
//   };

//   const getScoreColor = () => {
//     if (analysis.performance_score >= 85) return "text-success";
//     if (analysis.performance_score >= 70) return "text-primary";
//     if (analysis.performance_score >= 50) return "text-warning";
//     return "text-destructive";
//   };

//   return (
//     <div className="space-y-6">
//       {/* Performance Score - Hero Section */}
//       <div className="text-center space-y-4">
//         <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 border border-accent/30">
//           <Target className="w-6 h-6 text-accent" />
//           <div className="text-left">
//             <p className="text-sm text-muted-foreground font-medium">
//               Performance Score
//             </p>
//             <p className={cn("text-4xl font-bold", getScoreColor())}>
//               {analysis.performance_score}
//               <span className="text-lg text-muted-foreground">/100</span>
//             </p>
//           </div>
//         </div>

//         {/* Trend Badge */}
//         <div
//           className={cn(
//             "inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm capitalize",
//             getTrendColor()
//           )}
//         >
//           {getTrendIcon()}
//           {analysis.performance_trend || "stable"} Form
//         </div>
//       </div>

//       {/* Detailed Reasoning */}
//       <div className="space-y-3">
//         <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
//           Analysis
//         </h3>
//         <p className="text-sm leading-relaxed text-foreground">
//           {analysis.reasoning}
//         </p>
//       </div>
//       {/* Summary */}
//       <div className="bg-accent/5 border-l-4 border-accent rounded-2xl p-4">
//         <p className="text-sm leading-relaxed font-medium">
//           {analysis.short_summary}
//         </p>
//       </div>

//       {/* Prediction */}
//       <div className="space-y-3">
//         <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
//           <Zap className="w-4 h-4 text-primary" />
//           Market Prediction
//         </h3>
//         <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
//           <p className="text-sm leading-relaxed">{analysis.prediction}</p>
//         </div>
//       </div>
//     </div>
//   );
// }
