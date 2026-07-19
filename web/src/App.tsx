import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { PageTransitionProvider } from "./components/layout/PageTransition";
import { LocaleProvider } from "./i18n/locale";
import { HomePage } from "./pages/HomePage";
import { SpacePage } from "./pages/SpacePage";

function App() {
  return (
    <LocaleProvider>
      <BrowserRouter>
        <PageTransitionProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/spazi/:slug" element={<SpacePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PageTransitionProvider>
        <Analytics />
      </BrowserRouter>
    </LocaleProvider>
  );
}

export default App;
