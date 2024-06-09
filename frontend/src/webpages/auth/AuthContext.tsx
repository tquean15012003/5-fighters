import { createContext, useContext, useState } from "react";
import { TUser } from "../profile/types";

type TAuthUserContext = {
  authUser: TUser;
  setAuthUser: React.Dispatch<React.SetStateAction<TUser>>;
};

export const AuthContext = createContext<TAuthUserContext>(
  {} as TAuthUserContext
);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuthContext must be used within an AuthContextProvider"
    );
  }
  return context;
};

export const AuthContextProvider = ({ children }: { children: any }) => {
  let userInfor: any = localStorage.getItem("user-info");
  if (userInfor) {
    userInfor = JSON.parse(userInfor) as TUser;
  }

  const [authUser, setAuthUser] = useState<TUser>(userInfor);
  return (
    <AuthContext.Provider value={{ authUser, setAuthUser }}>
      {children}
    </AuthContext.Provider>
  );
};
