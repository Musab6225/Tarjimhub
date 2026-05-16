import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardPage from "@/pages/dashboard";
import GlossaryPage from "@/pages/glossary";
import TerminologiesPage from "@/pages/terminologies";
import ToolsPage from "@/pages/tools";
import JobsPage from "@/pages/jobs";
import FeedPage from "@/pages/feed";
import MessagesPage from "@/pages/messages";
import ProfilePage from "@/pages/profile";
import ProfileEditPage from "@/pages/profile-edit";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user } = useAuth();
  if (!user) return <Redirect to="/login" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard"><ProtectedRoute component={DashboardPage} /></Route>
      <Route path="/glossary"><ProtectedRoute component={GlossaryPage} /></Route>
      <Route path="/terminologies"><ProtectedRoute component={TerminologiesPage} /></Route>
      <Route path="/tools"><ProtectedRoute component={ToolsPage} /></Route>
      <Route path="/jobs"><ProtectedRoute component={JobsPage} /></Route>
      <Route path="/feed"><ProtectedRoute component={FeedPage} /></Route>
      <Route path="/messages"><ProtectedRoute component={MessagesPage} /></Route>
      <Route path="/profile/edit"><ProtectedRoute component={ProfileEditPage} /></Route>
      <Route path="/profile/:id"><ProtectedRoute component={ProfilePage} /></Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
