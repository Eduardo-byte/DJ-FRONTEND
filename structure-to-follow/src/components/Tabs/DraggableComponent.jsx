import React, { useRef, useEffect } from "react";

const DraggableTabsContainer = ({ children }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let isDragging = false;
        let startX = 0;
        let scrollLeft = 0;

        const pointerDownHandler = (e) => {
            isDragging = true;
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
            container.style.cursor = "grabbing";
            container.style.userSelect = "none";
        };

        const pointerMoveHandler = (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 1; // adjust multiplier for speed
            container.scrollLeft = scrollLeft - walk;
        };

        const pointerUpHandler = () => {
            isDragging = false;
            container.style.cursor = "grab";
        };

        container.addEventListener("pointerdown", pointerDownHandler);
        container.addEventListener("pointermove", pointerMoveHandler);
        container.addEventListener("pointerup", pointerUpHandler);
        container.addEventListener("pointerleave", pointerUpHandler);

        // Set initial cursor style
        container.style.cursor = "grab";

        return () => {
            container.removeEventListener("pointerdown", pointerDownHandler);
            container.removeEventListener("pointermove", pointerMoveHandler);
            container.removeEventListener("pointerup", pointerUpHandler);
            container.removeEventListener("pointerleave", pointerUpHandler);
        };
    }, []);

    return (
        <div ref={containerRef} className="w-full overflow-auto">
            {children}
        </div>
    );
};

export default DraggableTabsContainer;
