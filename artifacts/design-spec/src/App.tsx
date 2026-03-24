import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout";
import OverviewPage from "@/pages/overview";
import ArchitecturePage from "@/pages/architecture";
import DataModelPage from "@/pages/data-model";
import ExecutionFlowPage from "@/pages/execution-flow";
import FeaturesPage from "@/pages/features";
import ConnectorsPage from "@/pages/connectors";
import OpenQuestionsPage from "@/pages/open-questions";
import BuildStepsPage from "@/pages/build-steps";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={OverviewPage} />
        <Route path="/architecture" component={ArchitecturePage} />
        <Route path="/data-model" component={DataModelPage} />
        <Route path="/execution-flow" component={ExecutionFlowPage} />
        <Route path="/features" component={FeaturesPage} />
        <Route path="/connectors" component={ConnectorsPage} />
        <Route path="/open-questions" component={OpenQuestionsPage} />
        <Route path="/build-steps" component={BuildStepsPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
