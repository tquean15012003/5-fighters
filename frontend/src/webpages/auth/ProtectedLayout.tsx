import { useAuthContext } from "./AuthContext";

import { Navigate, Outlet } from "react-router-dom";

export const ProtectedLayout = () => {
  const { authUser } = useAuthContext();

  if (!authUser) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};
