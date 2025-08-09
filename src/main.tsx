import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./styles/custom.css";
import "./styles/globals.css";
import "./styles/modal.css";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);

// Register service worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/grocinv/sw.js", { scope: "/grocinv/" })
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}
