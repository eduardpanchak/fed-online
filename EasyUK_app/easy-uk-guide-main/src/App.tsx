import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { FilterProvider } from "@/contexts/FilterContext";
import { UserPreferencesProvider, useUserPreferences } from "@/contexts/UserPreferencesContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Start from "./pages/Start";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Documents from "./pages/Documents";
import DocumentDetails from "./pages/DocumentDetails";
import NHS from "./pages/NHS";
import NHSDetails from "./pages/NHSDetails";
import Checklists from "./pages/Checklists";
import ChecklistDetails from "./pages/ChecklistDetails";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Housing from "./pages/Housing";
import HousingDetails from "./pages/HousingDetails";
import Benefits from "./pages/Benefits";
import BenefitDetails from "./pages/BenefitDetails";
import Education from "./pages/Education";
import EducationDetails from "./pages/EducationDetails";
import Saved from "./pages/Saved";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";
import BusinessRegistration from "./pages/BusinessRegistration";
import AddService from "./pages/AddService";
import MyServices from "./pages/MyServices";
import EditService from "./pages/EditService";
import Statistics from "./pages/Statistics";
import Account from "./pages/Account";
import AccountTypeSelection from "./pages/AccountTypeSelection";
import SelectAccountType from "./pages/SelectAccountType";
import MyProfile from "./pages/MyProfile";
import About from "./pages/About";
import Feedback from "./pages/Feedback";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import { Info } from "lucide-react";

const queryClient = new QueryClient();

const ProtectedRoutes = () => {
  const { hasCompletedOnboarding } = useUserPreferences();
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasCompletedOnboarding) {
    return <Navigate to="/start" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<Services />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/documents/:id" element={<DocumentDetails />} />
      <Route path="/nhs" element={<NHS />} />
      <Route path="/nhs/:id" element={<NHSDetails />} />
      <Route path="/checklists" element={<Checklists />} />
      <Route path="/checklists/:id" element={<ChecklistDetails />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:id" element={<JobDetails />} />
      <Route path="/housing" element={<Housing />} />
      <Route path="/housing/:id" element={<HousingDetails />} />
      <Route path="/benefits" element={<Benefits />} />
      <Route path="/benefits/:id" element={<BenefitDetails />} />
      <Route path="/education" element={<Education />} />
      <Route path="/education/:id" element={<EducationDetails />} />
      <Route path="/saved" element={<Saved />} />
      <Route path="/search" element={<Search />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/services" element={<Index />} />
      <Route path="/services/:id" element={<ServiceDetails />} />
      <Route path="/business-registration" element={<BusinessRegistration />} />
      <Route path="/add-service" element={<AddService />} />
      <Route path="/my-services" element={<MyServices />} />
      <Route path="/edit-service/:id" element={<EditService />} />
      <Route path="/statistics" element={<Statistics />} />
      <Route path="/account" element={<Account />} />
      <Route path="/my-profile" element={<MyProfile />} />
      <Route path="/about" element={<About />} />
      <Route path="/feedback" element={<Feedback />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <FilterProvider>
        <AuthProvider>
          <UserPreferencesProvider>
            <AppProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/start" element={<Start />} />
                    <Route path="/select-account-type" element={<SelectAccountType />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/account-type-selection" element={<AccountTypeSelection />} />
                    <Route path="*" element={<ProtectedRoutes />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </AppProvider>
          </UserPreferencesProvider>
        </AuthProvider>
      </FilterProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
