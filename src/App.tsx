import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Schedule } from "./pages/Schedule";
import { Classes } from "./pages/Classes";
import { Membership } from "./pages/Membership";
import { Contact } from "./pages/Contact";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { Account } from "./pages/Account";
import { NotFound } from "./pages/NotFound";
import { ProtectedRoute, AdminRoute } from "./auth/ProtectedRoute";
import { PageLoading } from "./components/ui/PageLoading";

// The admin portal pulls in more Firestore/auth code paths than a typical
// visitor ever needs, so it's split into its own chunk.
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout").then((m) => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() =>
  import("./pages/admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard })),
);
const AdminMembers = lazy(() => import("./pages/admin/AdminMembers").then((m) => ({ default: m.AdminMembers })));
const AdminSchedule = lazy(() => import("./pages/admin/AdminSchedule").then((m) => ({ default: m.AdminSchedule })));
const AdminAnnouncements = lazy(() =>
  import("./pages/admin/AdminAnnouncements").then((m) => ({ default: m.AdminAnnouncements })),
);
const AdminEmail = lazy(() => import("./pages/admin/AdminEmail").then((m) => ({ default: m.AdminEmail })));

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="classes" element={<Classes />} />
        <Route path="membership" element={<Membership />} />
        <Route path="contact" element={<Contact />} />
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
        <Route
          path="account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <AdminRoute>
              <Suspense fallback={<PageLoading />}>
                <AdminLayout />
              </Suspense>
            </AdminRoute>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={<PageLoading />}>
                <AdminDashboard />
              </Suspense>
            }
          />
          <Route
            path="members"
            element={
              <Suspense fallback={<PageLoading />}>
                <AdminMembers />
              </Suspense>
            }
          />
          <Route
            path="schedule"
            element={
              <Suspense fallback={<PageLoading />}>
                <AdminSchedule />
              </Suspense>
            }
          />
          <Route
            path="announcements"
            element={
              <Suspense fallback={<PageLoading />}>
                <AdminAnnouncements />
              </Suspense>
            }
          />
          <Route
            path="email"
            element={
              <Suspense fallback={<PageLoading />}>
                <AdminEmail />
              </Suspense>
            }
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
