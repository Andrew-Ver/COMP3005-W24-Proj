import { Center, Loader } from "@mantine/core";
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
    router.push("/profile");
  } else {
    router.push("/login");
  }
}
