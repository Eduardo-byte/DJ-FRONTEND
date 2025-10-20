import React, { useState, useRef, useEffect } from "react";

const HiddenScrollbarOnScroll = ({ children, className = "" }) => {
    const [isScrolling, setIsScrolling] = useState(false);
    const containerRef = useRef(null);
    const timerRef = useRef(null);

    const handleScroll = () => {
        if (!isScrolling) setIsScrolling(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            setIsScrolling(false);
        }, 1000); // scrollbar shows for 1s after the last scroll event
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        container.addEventListener("scroll", handleScroll);
        return () => {
            container.removeEventListener("scroll", handleScroll);
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isScrolling]);

    return (
        <div
            ref={containerRef}
            className={`${className} hidden-scrollbar ${isScrolling ? "scrolling" : ""}`}
        >
            {children}
        </div>
    );
};

export default HiddenScrollbarOnScroll;
