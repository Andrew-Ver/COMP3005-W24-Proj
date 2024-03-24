import "@mantine/core/styles.css";
import Head from "next/head";
import { MantineProvider } from "@mantine/core";
import { theme } from "../theme";
import { SessionProvider } from "next-auth/react";
import Layout from "../components/layout";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: any) {
  return (
    <MantineProvider theme={theme}>
      <Head>
        <title>Health & Fitness</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
        <link rel="shortcut icon" href="/favicon.svg" />
      </Head>
      <SessionProvider session={session}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SessionProvider>
    </MantineProvider>
  );
}
