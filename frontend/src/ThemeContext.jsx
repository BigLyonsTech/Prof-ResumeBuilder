import React, { createContext, useState, useEffect } from "react";

// Light theme colors
const LIGHT_THEME = {
  bg: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceHi: "#F5F5F5",
  border: "#E0E0E0",
  borderHi: "#D0D0D0",
  gold: "#F5A623",
  goldDim: "#C4841C",
  goldGlow: "rgba(245,166,35,0.12)",
  goldGlow2: "rgba(245,166,35,0.06)",
  text: "#1A1A1A",
  muted: "#666666",
  faint: "#AAAAAA",
  blue: "#4F6EF7",
  blueDim: "rgba(79,110,247,0.15)",
  success: "#00B366",
  successDim: "rgba(0,179,102,0.12)",
  danger: "#E63946",
  dangerDim: "rgba(230,57,70,0.12)",
  warn: "#FFB347",
};

// Dark theme colors (original Obsidian Studio)
const DARK_THEME = {
  bg: "#0A0A0F",
  surface: "#111118",
  surfaceHi: "#16161F",
  border: "#1E1E2E",
  borderHi: "#2E2E4E",
  gold: "#F5A623",
  goldDim: "#C4841C",
  goldGlow: "rgba(245,166,35,0.12)",
  goldGlow2: "rgba(245,166,35,0.06)",
  text: "#F0EFE9",
  muted: "#6B6B7B",
  faint: "#3A3A4A",
  blue: "#4F6EF7",
  blueDim: "rgba(79,110,247,0.15)",
  success: "#00D48A",
  successDim: "rgba(0,212,138,0.12)",
  danger: "#FF4D6A",
  dangerDim: "rgba(255,77,106,0.12)",
  warn: "#FFB347",
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem("theme-mode");
    if (saved) return saved === "dark";
    
    // Fall back to system preference
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const theme = isDark ? DARK_THEME : LIGHT_THEME;

  const toggleTheme = () => {
    setIsDark((prev) => {
      const newValue = !prev;
      localStorage.setItem("theme-mode", newValue ? "dark" : "light");
      return newValue;
    });
  };

  // Update document background
  useEffect(() => {
    document.documentElement.style.backgroundColor = theme.bg;
    document.body.style.backgroundColor = theme.bg;
  }, [theme.bg]);

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
