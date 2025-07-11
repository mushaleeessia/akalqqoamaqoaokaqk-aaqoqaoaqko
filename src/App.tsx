
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { MusicPlayer } from "@/components/MusicPlayer";
import Index from "./pages/Index";
import Termo from "./pages/Termo";
import Cruzadas from "./pages/Cruzadas";
import ListenTogether from "./pages/ListenTogether";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {/* Music Player Global - persiste entre páginas */}
          <MusicPlayer />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/termo" element={<Termo />} />
            <Route path="/cruzadas" element={<Cruzadas />} />
            <Route path="/listentogether" element={<ListenTogether />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
