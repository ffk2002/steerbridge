"use client";

import { useCallback, useSyncExternalStore } from "react";

const FAVORITES_KEY = "stayfinder_favorites";
const EMPTY_ARRAY: string[] = [];

function readFavoritesFromStorage(): string[] {
    if (typeof window === "undefined") return EMPTY_ARRAY;
    try {
        const stored = localStorage.getItem(FAVORITES_KEY);
        // Important: return a stable empty array if no favorites exist
        if (!stored) return EMPTY_ARRAY;
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : EMPTY_ARRAY;
    } catch {
        return EMPTY_ARRAY;
    }
}

// Snapshot for client reads
let cachedFavorites = typeof window !== "undefined" ? readFavoritesFromStorage() : EMPTY_ARRAY;
const listeners = new Set<() => void>();

function notifyListeners() {
    cachedFavorites = readFavoritesFromStorage();
    listeners.forEach((listener) => listener());
}

function getSnapshot(): string[] {
    return cachedFavorites;
}

function getServerSnapshot(): string[] {
    return EMPTY_ARRAY;
}

function subscribe(onStoreChange: () => void): () => void {
    listeners.add(onStoreChange);

    // Listen for cross-tab localStorage changes
    const handleStorage = (e: StorageEvent) => {
        if (e.key === FAVORITES_KEY) {
            notifyListeners();
        }
    };

    if (typeof window !== "undefined") {
        window.addEventListener("storage", handleStorage);
    }

    return () => {
        listeners.delete(onStoreChange);
        if (typeof window !== "undefined") {
            window.removeEventListener("storage", handleStorage);
        }
    };
}

export function useFavorites() {
    const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const isFavorite = useCallback(
        (id: string) => favorites.includes(id),
        [favorites]
    );

    const toggleFavorite = useCallback((id: string) => {
        const current = readFavoritesFromStorage();
        const next = current.includes(id)
            ? current.filter((f) => f !== id)
            : [...current, id];
        
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
        
        // Notify all local subscribers immediately
        notifyListeners();
    }, []);

    return { favorites, isFavorite, toggleFavorite };
}
