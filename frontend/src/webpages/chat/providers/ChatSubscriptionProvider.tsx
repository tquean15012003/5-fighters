import { createContext, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { useAuthContext } from "../../auth/AuthContext";

export const ChatSubscriptionContext = createContext<any>(undefined);

const ChatSubscriptionProvider = ({ children }: { children: any }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { authUser } = useAuthContext();
  if (!authUser) {
    throw new Error(
      "ChatSubscriptionProvider must be used within an AuthContextProvider"
    );
  }
  useEffect(() => {
    const socket = io("http://localhost:3100", {
      query: {
        userId: authUser.id,
      },
    });
    setSocket(socket);

    return () => {
      socket.close();
    };
  }, [authUser]);

  return (
    <ChatSubscriptionContext.Provider value={socket}>
      {children}
    </ChatSubscriptionContext.Provider>
  );
};

export default ChatSubscriptionProvider;
