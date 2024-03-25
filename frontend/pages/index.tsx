import { Center, Loader, Container } from "@mantine/core";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function IndexPage() {
  const { data: session, status }: any = useSession();
  const router = useRouter();

  if (status == "loading") {
    return (
      <Center>
        <Loader size="xl" />
      </Center>
    );
  }

  if (session?.user && status === "authenticated") {
    return (
      <Container>
        <h1>
          Welcome to Health & Fitness. Please use the links in the header to
          navigate around.
        </h1>
      </Container>
    );
  } else {
    router.push("/login");
  }
}
