import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell, LanguageProvider, AuthProvider } from "@bundlros/ui";
import { TitleBar } from "./components/TitleBar";

// Lazy load modules
const IdentityModule = lazy(() => import("@bundlros/module-identity"));
const CoreModule = lazy(() => import("@bundlros/module-core"));
const AssetsModule = lazy(() => import("@bundlros/module-assets"));
const InboxModule = lazy(() => import("@bundlros/module-inbox"));
const ClientsModule = lazy(() => import("@bundlros/module-clients"));
const FactoriesModule = lazy(() => import("@bundlros/module-factories"));
const ApprovalsModule = lazy(() => import("@bundlros/module-approvals"));
const QAModule = lazy(() => import("@bundlros/module-qa"));
const ReportingModule = lazy(() => import("@bundlros/module-reporting"));
const AdminModule = lazy(() => import("@bundlros/module-admin"));
const BudgetsModule = lazy(() => import("@bundlros/module-budgets"));

const App: React.FC = () => {
  return (
    <>
      <TitleBar />
      <div style={{ paddingTop: "0" }}>
        <AuthProvider>
          <LanguageProvider>
            <BrowserRouter>
              <Suspense
                fallback={
                  <div className="h-screen w-screen bg-[#080809] flex items-center justify-center text-white font-mono">
                    A carregar BundlrOS...
                  </div>
                }
              >
                <Routes>
                  <Route
                    path="/"
                    element={<Navigate to="/identity" replace />}
                  />

                  {/* Identity doesn't need external AppShell as it has its own logic/sidebar */}
                  <Route path="/identity/*" element={<IdentityModule />} />

                  {/* Other Modules wrapped in AppShell */}
                  <Route
                    path="/core/*"
                    element={
                      <AppShell moduleName="Core Data">
                        <CoreModule />
                      </AppShell>
                    }
                  />

                  <Route
                    path="/assets/*"
                    element={
                      <AppShell moduleName="Asset Hub">
                        <AssetsModule />
                      </AppShell>
                    }
                  />
                  <Route
                    path="/inbox/*"
                    element={
                      <AppShell moduleName="Unified Inbox">
                        <InboxModule />
                      </AppShell>
                    }
                  />
                  <Route
                    path="/clients/*"
                    element={
                      <AppShell moduleName="Client 360">
                        <ClientsModule />
                      </AppShell>
                    }
                  />
                  <Route
                    path="/factories/*"
                    element={
                      <AppShell moduleName="Service Factories">
                        <FactoriesModule />
                      </AppShell>
                    }
                  />
                  <Route
                    path="/approvals/*"
                    element={
                      <AppShell moduleName="Approvals Center">
                        <ApprovalsModule />
                      </AppShell>
                    }
                  />
                  <Route
                    path="/qa/*"
                    element={
                      <AppShell moduleName="QA Gates">
                        <QAModule />
                      </AppShell>
                    }
                  />
                  <Route
                    path="/reporting/*"
                    element={
                      <AppShell moduleName="Reporting">
                        <ReportingModule />
                      </AppShell>
                    }
                  />

                  <Route
                    path="/admin/*"
                    element={
                      <AppShell moduleName="Admin Hub">
                        <AdminModule />
                      </AppShell>
                    }
                  />
                  <Route
                    path="/budgets/*"
                    element={
                      <AppShell moduleName="Budgets">
                        <BudgetsModule />
                      </AppShell>
                    }
                  />

                  <Route
                    path="*"
                    element={<Navigate to="/identity" replace />}
                  />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </LanguageProvider>
        </AuthProvider>
      </div>
    </>
  );
};

export default App;
