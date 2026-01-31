import { createContext, useContext } from "react";
import { useUserPoints } from "@/hooks/useUserPoints";

type PointsContextType = ReturnType<typeof useUserPoints>;

const PointsContext = createContext<PointsContextType | null>(null);

export function PointsProvider({ children }: { children: React.ReactNode }) {
    const points = useUserPoints();

    return (
        <PointsContext.Provider value={points}>
            {children}
        </PointsContext.Provider>
    );
}

export function usePoints() {
    const ctx = useContext(PointsContext);
    if (!ctx) {
        throw new Error("usePoints must be used inside PointsProvider");
    }
    return ctx;
}
