// createRoot is React 18's rendering engine
import { createRoot } from "react-dom/client";

// The root App component - contains your entire application
import App from "./App.tsx";

// Global CSS - this applies Tailwind and custom styles to the whole app
import "./index.css";

/**
 * MOUNTING THE APPLICATION
 * 
 * document.getElementById("root") 
 *   → Finds the <div id="root"></div> in index.html
 * 
 * createRoot(...) 
 *   → Creates a React root at that div
 * 
 * .render(<App />) 
 *   → Renders the App component inside that root
 * 
 * The "!" after getElementById is TypeScript saying "I know this exists"
 */
createRoot(document.getElementById("root")!).render(<App />);