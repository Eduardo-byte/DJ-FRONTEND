import { useEffect, useState } from "react";
import { VisuallyHidden, useSwitch } from "@heroui/react";

export const MoonIcon = (props) => {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M21.53 15.93c-.16-.27-.61-.69-1.73-.49a8.46 8.46 0 01-1.88.13 8.409 8.409 0 01-5.91-2.82 8.068 8.068 0 01-1.44-8.66c.44-1.01.13-1.54-.09-1.76s-.77-.55-1.83-.11a10.318 10.318 0 00-6.32 10.21 10.475 10.475 0 007.04 8.99 10 10 0 002.89.55c.16.01.32.02.48.02a10.5 10.5 0 008.47-4.27c.67-.93.49-1.519.32-1.79z"
        fill="currentColor"
      />
    </svg>
  );
};

export const SunIcon = (props) => {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <g fill="currentColor">
        <path d="M19 12a7 7 0 11-7-7 7 7 0 017 7z" />
        <path d="M12 22.96a.969.969 0 01-1-.96v-.08a1 1 0 012 0 1.038 1.038 0 01-1 1.04zm7.14-2.82a1.024 1.024 0 01-.71-.29l-.13-.13a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.984.984 0 01-.7.29zm-14.28 0a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a1 1 0 01-.7.29zM22 13h-.08a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zM2.08 13H2a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zm16.93-7.01a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a.984.984 0 01-.7.29zm-14.02 0a1.024 1.024 0 01-.71-.29l-.13-.14a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.97.97 0 01-.7.3zM12 3.04a.969.969 0 01-1-.96V2a1 1 0 012 0 1.038 1.038 0 01-1 1.04z" />
      </g>
    </svg>
  );
};

const ThemeSwitcher = () => {
  // Theme states: "light", "dark", or "system"
  const [theme, setTheme] = useState("light");
  // Track if the theme is currently dark (either from system preference or manual selection)
  const [isDark, setIsDark] = useState(false);

  // Check for system preference
  useEffect(() => {
    // Get initial theme from localStorage or default to "light"
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);

    // Check if system prefers dark mode
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    // Set initial dark mode based on saved theme or system preference
    if (savedTheme === "dark" || (savedTheme === "system" && systemPrefersDark)) {
      setIsDark(true);
      document.querySelector("main").classList.add("dark");
    } else {
      setIsDark(false);
      document.querySelector("main").classList.remove("dark");
    }

    // Listen for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      if (theme === "system") {
        setIsDark(e.matches);
        if (e.matches) {
          document.querySelector("main").classList.add("dark");
        } else {
          document.querySelector("main").classList.remove("dark");
        }
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Toggle between light and dark
  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setTheme(newTheme);
    setIsDark(!isDark);
    localStorage.setItem("theme", newTheme);
    
    if (newTheme === "dark") {
      document.querySelector("main").classList.add("dark");
    } else {
      document.querySelector("main").classList.remove("dark");
    }
  };

  // Reset to system preference
  const resetToSystem = () => {
    setTheme("system");
    localStorage.setItem("theme", "system");
    
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(systemPrefersDark);
    
    if (systemPrefersDark) {
      document.querySelector("main").classList.add("dark");
    } else {
      document.querySelector("main").classList.remove("dark");
    }
  };

  // Handle triple click to reset to system preference
  const handleTripleClick = () => {
    resetToSystem();
  };

  // Use HeroUI's useSwitch hook for the toggle
  const {Component, slots, getBaseProps, getInputProps, getWrapperProps} = useSwitch({
    isSelected: isDark,
    onChange: toggleTheme
  });

  return (
    <div className="flex items-center">
      <Component {...getBaseProps()}>
        <VisuallyHidden>
          <input {...getInputProps()} />
        </VisuallyHidden>
        <div
          {...getWrapperProps()}
          className={slots.wrapper({
            class: [
              "w-8 h-8",
              "flex items-center justify-center",
              "rounded-lg",
              isDark 
                ? "bg-gradient-to-tr from-brand to-brand-secondary text-gray-900" 
                : "bg-default-100 hover:bg-default-200 text-gray-600 hover:text-gray-900",
            ],
          })}
          title={theme === "system" 
            ? "Using system preference (click to toggle)" 
            : isDark 
              ? "Dark mode (click to switch to light, triple-click for system)" 
              : "Light mode (click to switch to dark, triple-click for system)"
          }
          onDoubleClick={(e) => e.preventDefault()} // Prevent default double-click behavior
          onMouseDown={(e) => {
            // Track clicks for triple-click detection
            const now = new Date().getTime();
            const lastClick = e.currentTarget.dataset.lastClick ? parseInt(e.currentTarget.dataset.lastClick) : 0;
            const clickCount = now - lastClick < 500 
              ? parseInt(e.currentTarget.dataset.clickCount || 0) + 1 
              : 1;
            
            e.currentTarget.dataset.lastClick = now;
            e.currentTarget.dataset.clickCount = clickCount;
            
            if (clickCount === 3) {
              e.preventDefault();
              handleTripleClick();
              e.currentTarget.dataset.clickCount = 0;
            }
          }}
        >
          {isDark ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
        </div>
      </Component>
    </div>
  );
};

export default ThemeSwitcher;
