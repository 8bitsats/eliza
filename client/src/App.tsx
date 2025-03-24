import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/app-sidebar";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toaster";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Chat from "./routes/chat";
import Overview from "./routes/overview";
import Home from "./routes/home";
import Ordinals from "./routes/ordinals";
import TokenLauncher from "./routes/token-launcher";
import ArtStudio from "./pages/art-studio";
import DNAArtGeneratorPage from "./pages/dna-art-generator-page";
import { ThemeProvider } from "./contexts/theme-context";
import useVersion from "./hooks/use-version";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: Number.POSITIVE_INFINITY,
        },
    },
});

function App() {
    useVersion();
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <div className="antialiased">
                    <BrowserRouter>
                        <TooltipProvider delayDuration={0}>
                            <SidebarProvider>
                                <AppSidebar />
                                <SidebarInset>
                                    <div className="flex flex-1 flex-col gap-4 size-full container">
                                        <Routes>
                                            <Route path="/" element={<Home />} />
                                            <Route
                                                path="chat/:agentId"
                                                element={<Chat />}
                                            />
                                            <Route
                                                path="settings/:agentId"
                                                element={<Overview />}
                                            />
                                            <Route
                                                path="ordinals"
                                                element={<Ordinals />}
                                            />
                                            <Route
                                                path="token-launcher"
                                                element={<TokenLauncher />}
                                            />
                                            <Route
                                                path="art-studio"
                                                element={<ArtStudio />}
                                            />
                                            <Route
                                                path="dna-art-generator"
                                                element={<DNAArtGeneratorPage />}
                                            />
                                        </Routes>
                                    </div>
                                </SidebarInset>
                            </SidebarProvider>
                            <Toaster />
                        </TooltipProvider>
                    </BrowserRouter>
                </div>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;
