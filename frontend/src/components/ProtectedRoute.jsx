import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute({
  isAuthenticated = false,
  children,
}) {
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return children || <Outlet />;
}

export default ProtectedRoute;