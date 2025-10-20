import React, { useRef, useEffect } from "react";

function ScrollableTabHeader({ children }) {
    const headerRef = useRef(null);

    useEffect(() => {
        const header = headerRef.current;
        if (!header) return;

        let isDown = false;
        let startX = 0;
        let scrollLeft = 0;

        // Mouse events
        const mouseDownHandler = (e) => {
            isDown = true;
            startX = e.pageX - header.offsetLeft;
            scrollLeft = header.scrollLeft;
        };

        const mouseLeaveHandler = () => {
            isDown = false;
        };

        const mouseUpHandler = () => {
            isDown = false;
        };

        const mouseMoveHandler = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - header.offsetLeft;
            const walk = (x - startX) * 1; // Adjust speed multiplier as needed
            header.scrollLeft = scrollLeft - walk;
        };

        // Touch events (for mobile)
        const touchStartHandler = (e) => {
            isDown = true;
            startX = e.touches[0].pageX - header.offsetLeft;
            scrollLeft = header.scrollLeft;
        };

        const touchEndHandler = () => {
            isDown = false;
        };

        const touchMoveHandler = (e) => {
            if (!isDown) return;
            const x = e.touches[0].pageX - header.offsetLeft;
            const walk = (x - startX) * 1;
            header.scrollLeft = scrollLeft - walk;
        };

        header.addEventListener("mousedown", mouseDownHandler);
        header.addEventListener("mouseleave", mouseLeaveHandler);
        header.addEventListener("mouseup", mouseUpHandler);
        header.addEventListener("mousemove", mouseMoveHandler);

        header.addEventListener("touchstart", touchStartHandler);
        header.addEventListener("touchend", touchEndHandler);
        header.addEventListener("touchmove", touchMoveHandler);

        return () => {
            header.removeEventListener("mousedown", mouseDownHandler);
            header.removeEventListener("mouseleave", mouseLeaveHandler);
            header.removeEventListener("mouseup", mouseUpHandler);
            header.removeEventListener("mousemove", mouseMoveHandler);

            header.removeEventListener("touchstart", touchStartHandler);
            header.removeEventListener("touchend", touchEndHandler);
            header.removeEventListener("touchmove", touchMoveHandler);
        };
    }, []);

    return (
        <div
            ref={headerRef}
            className="overflow-x-auto whitespace-nowrap scrollable-tab-header"
            style={{ cursor: "grab" }}
        >
            {children}
        </div>
    );
}

export default ScrollableTabHeader;
