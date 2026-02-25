import { useState, useEffect } from "react";

/**
 * Hook to determine the current region ('india' or 'global')
 * based on the hostname where the app is running.
 */
export const useRegion = () => {
    const [region, setRegion] = useState("india"); // Default fallback

    useEffect(() => {
        // Determine the current hostname
        const hostname = window.location.hostname;

        // In development mode, you can use local storage or an environment variable to test
        if (import.meta.env.DEV) {
            const devRegion = localStorage.getItem('devPublicRegion');
            if (devRegion) {
                setRegion(devRegion);
                return;
            }
        }

        // Determine region based on hostname
        // You should configure these domains in your frontend config or env vars
        const globalDomains = [
            "global.y4dinfo.org",
            "y4d-global.netlify.app", // Example Netlify domains if applicable
            "global.localhost" // Local testing
        ];

        const isGlobal = globalDomains.some(domain => hostname.includes(domain)) || hostname.startsWith("global.");

        if (isGlobal) {
            setRegion("global");
        } else {
            // By default, if it's app.y4dinfo.org or y4d.in, it's India
            setRegion("india");
        }

    }, []);

    return region;
};

// Export a non-hook utility version for use outside React components (e.g., in Axios instances)
export const getActiveRegion = () => {
    // Safely check if window is defined (for SSR / static generation)
    if (typeof window === "undefined") return "india";

    const hostname = window.location.hostname;

    if (import.meta.env.DEV) {
        const devRegion = localStorage.getItem('devPublicRegion');
        if (devRegion) return devRegion;
    }

    const globalDomains = [
        "global.y4dinfo.org",
        "global.localhost"
    ];

    const isGlobal = globalDomains.some(domain => hostname.includes(domain)) || hostname.startsWith("global.");
    return isGlobal ? "global" : "india";
};
