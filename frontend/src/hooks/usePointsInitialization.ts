import { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";

const STORAGE_KEY_PREFIX = "points_initialized_";

export function usePointsInitialization() {
    const currentAccount = useCurrentAccount();
    const storageKey = currentAccount?.address
        ? `${STORAGE_KEY_PREFIX}${currentAccount.address}`
        : null;

    const [isInitialized, setIsInitialized] = useState<boolean>(() => {
        if (!storageKey) return false;
        return localStorage.getItem(storageKey) === "true";
    });

    // Update isInitialized when account changes
    useEffect(() => {
        if (storageKey) {
            setIsInitialized(localStorage.getItem(storageKey) === "true");
        } else {
            setIsInitialized(false);
        }
    }, [storageKey]);

    const markInitialized = () => {
        if (!storageKey) return;
        setIsInitialized(true);
        localStorage.setItem(storageKey, "true");
    };

    const resetInitialization = () => {
        if (!storageKey) return;
        setIsInitialized(false);
        localStorage.removeItem(storageKey);
    };

    return {
        isInitialized,
        markInitialized,
        resetInitialization,
    };
}