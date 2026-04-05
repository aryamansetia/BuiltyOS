import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AgencyBookingsPage from "./pages/agency/AgencyBookingsPage";
import AgencyDashboard from "./pages/agency/AgencyDashboard";
import DocumentCenterPage from "./pages/agency/DocumentCenterPage";
import LandingPage from "./pages/common/LandingPage";
import LoginPage from "./pages/common/LoginPage";
import RegisterPage from "./pages/common/RegisterPage";
import BookingFormPage from "./pages/customer/BookingFormPage";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import SearchAgenciesPage from "./pages/customer/SearchAgenciesPage";
import TrackingPage from "./pages/customer/TrackingPage";
import JobsPage from "./pages/workforce/JobsPage";
import MarketplacePage from "./pages/workforce/MarketplacePage";
import { useAuth } from "./context/AuthContext";

const HomeRoute = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  if (user.role === "agency") {
    return <Navigate to="/agency/dashboard" replace />;
  }

  if (user.role === "worker") {
    return <Navigate to="/marketplace" replace />;
  }

  return <Navigate to="/customer/dashboard" replace />;
};

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-brand-background text-brand-secondary">
      <div className="mx-auto w-[min(1440px,94vw)] py-4 pb-10">
        <Navbar />
        <main key={`${location.pathname}${location.search}`} className="mt-6 grid gap-6 page-fade-in">
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/tracking" element={<TrackingPage />} />

            <Route
              path="/marketplace"
              element={
                <ProtectedRoute roles={["agency", "worker"]}>
                  <MarketplacePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <ProtectedRoute roles={["agency", "worker"]}>
                  <JobsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/customer/search"
              element={
                <ProtectedRoute roles={["customer"]}>
                  <SearchAgenciesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/book"
              element={
                <ProtectedRoute roles={["customer"]}>
                  <BookingFormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/dashboard"
              element={
                <ProtectedRoute roles={["customer"]}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/agency/dashboard"
              element={
                <ProtectedRoute roles={["agency"]}>
                  <AgencyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agency/bookings"
              element={
                <ProtectedRoute roles={["agency"]}>
                  <AgencyBookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agency/documents"
              element={
                <ProtectedRoute roles={["agency"]}>
                  <DocumentCenterPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
