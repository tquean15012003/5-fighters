import { createContext, useContext, useState } from "react";

export const AuthContext = createContext<any>(undefined);

export const useAuthContext = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }: { children: any }) => {
  let userInfor = localStorage.getItem("user-info");
  if (userInfor) {
    userInfor = JSON.parse(userInfor);
  }
  const [authUser, setAuthUser] = useState(userInfor);
  return (
    <AuthContext.Provider value={{ authUser, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
};
