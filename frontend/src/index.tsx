import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter, redirect } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";
import {
  ChakraProvider,
  ColorModeScript,
  createStandaloneToast,
} from "@chakra-ui/react";

import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import theme from "./theme";
import { getAxiosErrorMessage } from "./lib/axios";
import { AuthContextProvider } from "./webpages/auth/AuthContext";

const { ToastContainer, toast } = createStandaloneToast({
  theme,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    },
  },
  queryCache: new QueryCache({
    onError: (err, query) => {
      const { errorMessage, redirectPath } =
        (query?.meta as Partial<{
          errorMessage: string;
          redirectPath: string;
        }>) || {};

      const message = errorMessage || getAxiosErrorMessage(err);

      toast({
        title: typeof message === "string" ? message : "Error",
        description: err?.message,
        status: "error",
        isClosable: true,
      });

      if (redirectPath) {
        redirect(redirectPath);
      }
    },
  }),
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <AuthContextProvider>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ChakraProvider theme={theme}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <ToastContainer />
          <App />
        </ChakraProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </AuthContextProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
