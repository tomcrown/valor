import { useState } from "react";

const STORAGE_KEY = "points_initialized";

export function usePointsInitialization() {
    const [isInitialized, setIsInitialized] = useState<boolean>(() => {
        return localStorage.getItem(STORAGE_KEY) === "true";
    });

    const markInitialized = () => {
        setIsInitialized(true);
        localStorage.setItem(STORAGE_KEY, "true");
    };

    const resetInitialization = () => {
        setIsInitialized(false);
        localStorage.removeItem(STORAGE_KEY);
    };

    return {
        isInitialized,
        markInitialized,
        resetInitialization,
    };
}
