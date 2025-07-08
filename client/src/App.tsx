import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import CodeGenerationPage from "./pages/code-generation/page";
import Layout from "./components/layout/page";
import MasterDetailCodeGenerationPage from "./pages/code-generation2/page";


const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<CodeGenerationPage />} />
              <Route
                path="/code-generation-2"
                element={<MasterDetailCodeGenerationPage />}
              />
            </Route>
          </Routes>
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
