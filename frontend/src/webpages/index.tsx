import { Routes, Route, Outlet, useLocation } from "react-router-dom";
import MainLayout, { MainLayoutContent } from "./mainLayout";
import { HStack, Hide } from "@chakra-ui/react";
// import ConversationListSidebar from "./chat/components/ConversationListSidebar";
import { Suspense, useEffect } from "react";
// import ChatPage from "./chat/ChatPage";
import ChatPage from "./chat/ChatPage";
import ConversationListSidebar from "./chat/components/ConversationListSidebar";
import { ProtectedLayout } from "./auth/ProtectedLayout";
import Profiles from "./profile/ProfilePage";
import { FallbackLoader } from "./misc/FallBackLoader";
import ChatSubscriptionProvider from "./chat/providers/ChatSubscriptionProvider";
import EmptyChatPage from "./misc/EmptyChatPage";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "./auth/AuthContext";

const ProfileLayOut = () => {
  return (
    <MainLayout>
      <MainLayoutContent maxW="none" p={0} h="full">
        <HStack
          h="full"
          align="center"
          flexGrow={1}
          spacing={2}
          py={{ base: 3, sm: 8 }}
          pr={{ base: 3, sm: 8 }}
          pl={{ base: 3, sm: 8 }}
        >
          <Outlet />
        </HStack>
      </MainLayoutContent>
    </MainLayout>
  );
};

const HomeLayOut = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const { authUser } = useAuthContext();
  useEffect(() => {
    if (location.pathname.startsWith("/chat")) {
      queryClient.invalidateQueries({
        queryKey: ["conversations", authUser.id],
      });
    }
  }, [authUser.id, location, queryClient]);

  return (
    <ChatSubscriptionProvider>
      <MainLayout>
        <MainLayoutContent maxW="none" p={0} h="full">
          <HStack
            h="full"
            align="flex-start"
            flexGrow={1}
            spacing={2}
            pb={{ base: 3, sm: 8 }}
            pr={{ base: 3, sm: 8 }}
            pl={{ base: 3, sm: 8, md: 0 }}
          >
            <Hide below="md">
              <ConversationListSidebar />
            </Hide>
            <Outlet />
          </HStack>
        </MainLayoutContent>
      </MainLayout>
    </ChatSubscriptionProvider>
  );
};

export const Webpages: React.FC = () => {
  return (
    <Routes>
      <Route element={<ProfileLayOut />}>
        <Route
          index
          element={
            <Suspense fallback={<FallbackLoader />}>
              <Profiles />
            </Suspense>
          }
        />
      </Route>
      <Route element={<ProtectedLayout />}>
        <Route element={<HomeLayOut />}>
          <Route
            path="/chat"
            element={
              <Suspense fallback={<FallbackLoader />}>
                <EmptyChatPage isLoading={false} />
              </Suspense>
            }
          />
          <Route
            path="chat/:id"
            element={
              <Suspense fallback={<FallbackLoader />}>
                <ChatPage />
              </Suspense>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
};
