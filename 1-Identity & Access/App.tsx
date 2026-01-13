import React, { useState, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Login } from "./components/Login";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { UsersList } from "./components/UsersList";
import { UserProfile } from "./components/UserProfile";
import { AuditLogViewer } from "./components/AuditLogViewer";
import { User, Role } from "./types";
import { AuditService } from "./services";
import { AppShell, useAuth } from "@bundlros/ui";

function App() {
  const {
    user: authUser,
    setUser: setAuthUser,
    logout: authLogout,
  } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Only run once on mount
    if (initialized) return;

    // Check local storage for persistent session simulation
    const storedUser = localStorage.getItem("nexus_session");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      // Also update the shared AuthContext
      setAuthUser({
        id: user.id,
        email: user.email,
        name: user.name,
        title: user.title,
        role: user.role,
        avatarUrl: user.avatarUrl,
      });
    }
    setInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("nexus_session", JSON.stringify(user));
    // Update the shared AuthContext so AppBar shows the user
    setAuthUser({
      id: user.id,
      email: user.email,
      name: user.name,
      title: user.title,
      role: user.role,
      avatarUrl: user.avatarUrl,
    });
  };

  const handleLogout = () => {
    if (currentUser) {
      AuditService.log(
        "auth.login",
        `User ${currentUser.email} logged out`,
        currentUser.id,
        currentUser.name
      );
    }
    setCurrentUser(null);
    localStorage.removeItem("nexus_session");
    authLogout(); // This will also redirect
  };

  // AppShell currently doesn't support logout prop directly in this iteration,
  // but we are adhering to the Visual Interface Spec.
  // We can pass handleLogout via a Context or custom prop later.
  // For now, we wrap the content.

  const ProtectedLayout = () => {
    if (!currentUser) return <Navigate to="/identity/login" replace />;

    return (
      <AppShell moduleName="Identity & Access">
        <div className="flex h-full">
          <Sidebar currentUserRole={currentUser.role} onLogout={handleLogout} />
          <main className="flex-1 overflow-auto p-8">
            <Outlet />
          </main>
        </div>
      </AppShell>
    );
  };

  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    if (currentUser?.role !== Role.ADMIN)
      return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
  };

  return (
    <Routes>
      <Route
        path="login"
        element={
          !currentUser ? (
            <Login onLogin={handleLogin} />
          ) : (
            <Navigate to="../dashboard" />
          )
        }
      />

      <Route element={<ProtectedLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route
          path="me"
          element={currentUser ? <UserProfile user={currentUser} /> : null}
        />

        <Route
          path="users"
          element={
            <AdminRoute>
              <UsersList />
            </AdminRoute>
          }
        />
        <Route
          path="audit"
          element={
            <AdminRoute>
              <AuditLogViewer />
            </AdminRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/identity/dashboard" replace />}
        />
      </Route>
    </Routes>
  );
}

export default App;
