// import { PropsWithChildren, createContext, useEffect, useState } from "react";
// import { useAuthContext } from "../../auth/AuthContext";

// export const ChatSubscriptionContext = createContext({});

// const ChatSubscriptionProvider: React.FC<PropsWithChildren> = ({
//   children,
// }) => {
//   const { authUser } = useAuthContext();
//   const userId = authUser.id;

//   const webSocket = new WebSocket("ws://localhost:3100", `userId=${userId}`);
//   const [ws, setWs] = useState<WebSocket>(webSocket);

//   useEffect(() => {
//     const onClose = () => {
//       setTimeout(() => {
//         console.error("Websocket closed. Reconnecting in 1sec...");
//         setWs(new WebSocket("ws://localhost:3100", `userId=${userId}`));
//       }, 1000);
//     };

//     ws.addEventListener("close", onClose);

//     return () => {
//       ws.removeEventListener("close", onClose);
//     };
//   }, [ws, setWs, userId]);

//   return (
//     <ChatSubscriptionContext.Provider value={ws}>
//       {children}
//     </ChatSubscriptionContext.Provider>
//   );
// };

// export default ChatSubscriptionProvider;

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
