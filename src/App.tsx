// Toast notifications - for showing success/error messages to users
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

// Tooltip provider - enables hover tooltips across the entire app
import { TooltipProvider } from "@/components/ui/tooltip";

// React Query - manages API calls, caching, and loading states
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// React Router - handles navigation between pages without page reload
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Page components - the actual content for each route
import Index from "./pages/Index";      // Main application page
import NotFound from "./pages/NotFound"; // 404 error page

/**
 * QueryClient manages server state (data from your backend API)
 * It handles:
 * - Caching API responses
 * - Automatic refetching
 * - Loading and error states
 */
const queryClient = new QueryClient();
/**
 * The App component is structured like Russian nesting dolls:
 * 
 * QueryClientProvider (outermost)
 *   └── TooltipProvider
 *         └── Toaster + Sonner (notification systems)
 *               └── BrowserRouter
 *                     └── Routes
 *                           └── Route (individual pages)
 * 
 * Each wrapper provides functionality to all components inside it.
 */
const App = () => (
  // Provides React Query context to entire app
  <QueryClientProvider client={queryClient}>
    {/* Enables tooltips on any component that needs them */}
    <TooltipProvider>
      {/* Toast notification containers - these render the actual toasts */}
      <Toaster />
      <Sonner />
      
      {/* 
        BrowserRouter enables client-side routing
        - Uses browser history API
        - Allows navigation without page reloads
        - URLs change but the page doesn't fully refresh
      */}
      <BrowserRouter>
        {/* Routes is the container for all your route definitions */}
        <Routes>
          {/* 
            Route defines: "when URL is X, show component Y"
            
            path="/" → The homepage (e.g., https://yourapp.com/)
            element={<Index />} → Show the Index component
          */}
          <Route path="/" element={<Index />} />
          
          {/* 
            CATCH-ALL ROUTE (must be last!)
            path="*" matches any URL not matched above
            Shows 404 page for unknown URLs
          */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// Export so main.tsx can import and render this component
export default App;
