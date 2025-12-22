import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { clearServiceWorkersAndCaches } from "./service-worker-cleanup.ts";

createRoot(document.getElementById("root")!).render(<App />);

clearServiceWorkersAndCaches();
