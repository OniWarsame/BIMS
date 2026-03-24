import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Registration from "./pages/Registration.tsx";
import DatabasePage from "./pages/Database.tsx";
import ResultPage from "./pages/Result.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "@/pages/Login";
import { isLoggedIn } from "@/lib/auth";
import UserManagement from "./pages/UserManagement.tsx";
import Reports from "./pages/Reports.tsx";
import Create from "./pages/Create.tsx";
import Settings from "./pages/Settings.tsx";
import Profile from "./pages/Profile.tsx";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          {/* Protected */}
          <Route path="/"         element={<RequireAuth><Index /></RequireAuth>} />
          <Route path="/register" element={<RequireAuth><Registration /></RequireAuth>} />
          <Route path="/database" element={<RequireAuth><DatabasePage /></RequireAuth>} />
          <Route path="/result/:id" element={<RequireAuth><ResultPage /></RequireAuth>} />
          <Route path="/users"     element={<RequireAuth><UserManagement /></RequireAuth>} />
          <Route path="/reports"   element={<RequireAuth><Reports /></RequireAuth>} />
          <Route path="/create"    element={<RequireAuth><Create /></RequireAuth>} />
          <Route path="/settings"  element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="/profile"   element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
