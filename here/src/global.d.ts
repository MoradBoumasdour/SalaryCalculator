declare global {
  interface Window {
    /** Toggle theme: returns true when dark mode is active after toggle */
    toggleTheme?: () => boolean;
  }
}

export {};
