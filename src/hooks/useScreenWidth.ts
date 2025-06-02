import { useState, useEffect } from 'react';

export function useScreenWidth(): number {
    const [screenWidth, setScreenWidth] = useState<number>(0);

    useEffect(() => {
        // Function to update screen width
        const updateScreenWidth = (): void => {
            setScreenWidth(window.innerWidth);
        };

        // Check if window is available (client-side)
        if (typeof window !== 'undefined') {
            // Set initial width
            updateScreenWidth();

            // Add event listener for resize
            window.addEventListener('resize', updateScreenWidth);

            // Cleanup function to remove event listener
            return () => {
                window.removeEventListener('resize', updateScreenWidth);
            };
        }
    }, []);

    return screenWidth;
}
