import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  delay?: number;
}

const StatCard = ({
  label,
  value,
  icon,
  trend,
  prefix = "",
  suffix = "",
  className,
  delay = 0,
}: StatCardProps) => {
  return (
    <div
      className={cn("stat-card opacity-0 animate-fade-in bg-background", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm text-muted-foreground font-medium">
          {label}
        </span>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xl md:text-3xl  font-bold">
            {prefix}
            {typeof value === "number" ? value.toLocaleString() : value}
            {suffix}
          </p>
          {trend !== undefined && (
            <p
              className={cn(
                "text-sm font-medium mt-1",
                trend >= 0 ? "text-success" : "text-destructive"
              )}
            >
              {trend >= 0 ? "+" : ""}
              {trend.toFixed(1)}% this week
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
