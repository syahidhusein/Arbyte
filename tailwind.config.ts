import type { Config } from "tailwindcss";

export default {
  /**
   * DARK MODE STRATEGY
   * Using "class" means dark mode is toggled by adding .dark to <html>
   * This gives us full control over theme switching
   */
  darkMode: "class",

  /**
   * CONTENT PATHS
   * Tailwind scans these paths to find class usage
   * Any unused classes are removed from production build
   */
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],

  /**
   * PREFIX
   * Empty prefix means classes are used as-is: "bg-primary"
   * Could be set to "tw-" for "tw-bg-primary" to avoid conflicts
   */
  prefix: "",

  theme: {
    /**
     * CONTAINER CONFIGURATION
     * The .container class will be centered with 2rem padding
     * Max-width of 1400px on 2xl screens
     */
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },

    /**
     * THEME EXTENSIONS
     * These ADD to Tailwind's defaults rather than replacing them
     * We still have access to all default colors, spacing, etc.
     */
    extend: {
      /**
       * SEMANTIC COLOR SYSTEM
       * Each color maps to a CSS variable defined in index.css
       * This creates a bridge: CSS Variable → Tailwind Class
       * 
       * Pattern: hsl(var(--variable-name))
       * Result: Enables opacity modifiers like bg-primary/50
       */
      colors: {
        // ========== CORE SEMANTIC COLORS ==========
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // ========== PRIMARY BRAND COLOR ==========
        // Usage: Buttons, links, key actions
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },

        // ========== SECONDARY COLOR ==========
        // Usage: Secondary buttons, less prominent actions
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },

        // ========== DESTRUCTIVE/ERROR ==========
        // Usage: Delete buttons, error states, warnings
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },

        // ========== MUTED ==========
        // Usage: Subdued backgrounds, disabled states
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        // ========== ACCENT ==========
        // Usage: Highlights, focus indicators, success states
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },

        // ========== SUCCESS STATE ==========
        // Usage: Success messages, positive indicators
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },

        // ========== WARNING STATE ==========
        // Usage: Warning messages, caution indicators
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },

        // ========== POPOVER ==========
        // Usage: Dropdown menus, tooltips
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        // ========== CARD ==========
        // Usage: Card backgrounds
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // ========== SIDEBAR (for future use) ==========
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },

        // ========== FEATURE IMPORTANCE (App-Specific) ==========
        // Usage: ML feature importance visualization
        feature: {
          positive: "hsl(var(--feature-positive))",
          negative: "hsl(var(--feature-negative))",
          neutral: "hsl(var(--feature-neutral))",
        },
      },

      /**
       * BORDER RADIUS
       * Uses CSS variable for consistency
       * Creates small, medium, large variants automatically
       */
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      /**
       * KEYFRAME ANIMATIONS
       * Define the animation behavior here
       * Apply via animation property below
       */
      keyframes: {
        // Accordion expand/collapse
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },

        // Fade in (for mounting components)
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },

        // Fade in with upward movement
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },

        // Scale in (for modals, dropdowns)
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },

      /**
       * ANIMATION UTILITIES
       * Combine keyframes with timing functions
       * Usage: className="animate-fade-in"
       */
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
      },

      /**
       * TYPOGRAPHY
       * Custom font families
       * Using Inter for both display and body text
       */
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },

  /**
   * PLUGINS
   * tailwindcss-animate: Provides additional animation utilities
   */
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
