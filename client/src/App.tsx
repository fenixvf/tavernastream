import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NotificationPermissionDialog } from "@/components/NotificationPermissionDialog";
import { installPopupBlocker } from "@/utils/blockPopups";
import Home from "@/pages/Home";
import MyListPage from "@/pages/MyListPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/minha-lista" component={MyListPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    installPopupBlocker();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <NotificationPermissionDialog />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
