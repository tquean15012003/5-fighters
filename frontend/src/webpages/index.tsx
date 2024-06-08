import { Routes, Route, Outlet } from "react-router-dom";
import MainLayout, { MainLayoutContent } from "./mainLayout";
import { Center, HStack, Hide, Spinner } from "@chakra-ui/react";
// import ConversationListSidebar from "./chat/components/ConversationListSidebar";
import { Suspense } from "react";
// import ChatPage from "./chat/ChatPage";
import { Panel } from "../components/panel";
import ChatPage from "./chat/ChatPage";
import ConversationListSidebar from "./chat/components/ConversationListSidebar";
import { ProtectedLayout } from "./auth/ProtectedLayout";
import Profiles from "./profile/ProfilePage";

const FallbackLoader = () => (
  <Panel>
    <Center w="full" h="100dvh">
      <Spinner size="lg" color="brand.purple.500" />
    </Center>
  </Panel>
);

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
  return (
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
            path="/:id"
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
