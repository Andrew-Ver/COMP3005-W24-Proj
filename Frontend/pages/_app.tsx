import "@mantine/core/styles.css";
import Head from "next/head";
import { MantineProvider } from "@mantine/core";
import { theme } from "../theme";
import { SessionProvider } from "next-auth/react";
import Layout from "../components/layout";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ModalsProvider } from "@mantine/modals";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnReconnect: "always",
      refetchOnWindowFocus: "always",
    },
  },
});

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: any) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Head>
        <title>Health & Fitness</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
        <link rel="shortcut icon" href="/favicon.svg" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <SessionProvider session={session}>
          <ModalsProvider>
            <Notifications
              position="top-center"
              zIndex={1000}
              autoClose={3000}
            />
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ModalsProvider>
        </SessionProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
}
