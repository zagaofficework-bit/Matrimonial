import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import AdminRoute from "./components/admin/AdminRoute/AdminRoute";
import AdminLayout from "./components/admin/Layout/AdminLayout";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ForgotPassword from "./components/password/forgotPassword/ForgotPassword";
import ResetPassword from "./components/password/ResetPassword/ResetPassword";
import ProfileForm from "./pages/ProfileForm/ProfileForm";
import Preferences from "./pages/Preferences/Preferences";
import ProfileView from "./pages/ProfileView/ProfileView";
import PublicProfile from "./pages/profile/PublicProfile";
import Search from "./pages/Search/Search";
import Interests from "./pages/Interests/Interests";
import Matches from "./pages/Matches/Matches";
import SavedProfiles from "./pages/SavedProfiles/SavedProfiles";
import Chat from "./pages/Chat/Chat";
import Membership from "./pages/Membership/Membership";
import SuccessStoriesList from "./pages/SuccessStories/SuccessStoriesList";
import SuccessStoryDetail from "./pages/SuccessStories/SuccessStoryDetail";
import AddSuccessStory from "./pages/SuccessStories/AddSuccessStory";

import Privacypolicy from "./pages/PrivacyPolicy/Privacypolicy";

// Admin panel pages
import AdminDashboard from "./pages/admin/AdminDashboard/Dashboard";
import UserDirectory from "./pages/admin/Users/UserDirectory";
import Verifications from "./pages/admin/Verifications/Verifications";
import PhotoModeration from "./pages/admin/PhotoModeration/PhotoModeration";
import ReportsHub from "./pages/admin/Reports/ReportsHub";
import PlanManager from "./pages/admin/Plans/PlanManager";
import RevenueAnalytics from "./pages/admin/Revenue/RevenueAnalytics";
import StaffManagement from "./pages/admin/Staff/StaffManagement";
import AuditLogs from "./pages/admin/AuditLogs/AuditLogs";

function App() {
  const location = useLocation();

  // Hide Navbar/Footer on specific pages
  const hideLayout =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password" ||
    location.pathname.startsWith("/reset-password") ||
    location.pathname.startsWith("/chat") ||
    location.pathname.startsWith("/admin");

  return (
    <>
      {!hideLayout && <Navbar />}

      <Routes>

        {/* ==================== Public Routes ==================== */}

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />


        <Route path="/privacy-policy" element={<Privacypolicy />} />
       

        {/* ==================== Protected Routes ==================== */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/create"
          element={
            <ProtectedRoute>
              <ProfileForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/preferences"
          element={
            <ProtectedRoute>
              <Preferences />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/me"
          element={
            <ProtectedRoute>
              <ProfileView />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <PublicProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interests"
          element={
            <ProtectedRoute>
              <Interests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/matches"
          element={
            <ProtectedRoute>
              <Matches />
            </ProtectedRoute>
          }
        />

        <Route
          path="/saved-profiles"
          element={
            <ProtectedRoute>
              <SavedProfiles />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat/:conversationId"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        <Route
          path="/membership"
          element={
            <ProtectedRoute>
              <Membership />
            </ProtectedRoute>
          }
        />

        <Route
          path="/success-stories"
          element={
            <ProtectedRoute>
              <SuccessStoriesList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/success-stories/new"
          element={
            <ProtectedRoute>
              <AddSuccessStory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/success-stories/:id"
          element={
            <ProtectedRoute>
              <SuccessStoryDetail />
            </ProtectedRoute>
          }
        />

        {/* ==================== Admin Panel ==================== */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route
            index
            element={<AdminDashboard />}
          />

          <Route
            path="users"
            element={
              <AdminRoute requirePermission="users:manage">
                <UserDirectory />
              </AdminRoute>
            }
          />

          <Route
            path="verifications"
            element={
              <AdminRoute requirePermission="content:moderate">
                <Verifications />
              </AdminRoute>
            }
          />

          <Route
            path="photos"
            element={
              <AdminRoute requirePermission="content:moderate">
                <PhotoModeration />
              </AdminRoute>
            }
          />

          <Route
            path="reports"
            element={
              <AdminRoute requirePermission="reports:manage">
                <ReportsHub />
              </AdminRoute>
            }
          />

          <Route
            path="plans"
            element={
              <AdminRoute requirePermission="finance:manage">
                <PlanManager />
              </AdminRoute>
            }
          />

          <Route
            path="revenue"
            element={
              <AdminRoute requirePermission="finance:manage">
                <RevenueAnalytics />
              </AdminRoute>
            }
          />

          <Route
            path="staff"
            element={
              <AdminRoute requireSuperAdmin>
                <StaffManagement />
              </AdminRoute>
            }
          />

          <Route
            path="audit-logs"
            element={
              <AdminRoute requirePermission="audit:view">
                <AuditLogs />
              </AdminRoute>
            }
          />
        </Route>

      </Routes>

      {!hideLayout && <Footer />}
    </>
  );
}

export default App;