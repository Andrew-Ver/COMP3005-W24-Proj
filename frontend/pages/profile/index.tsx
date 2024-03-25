import { Stack, Divider, Text, Center, Button } from "@mantine/core";
import MetricsTable from "@/components/profile/metricsTable";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      // redirect to login page if not authenticated
      router.push("/login");
    }
  }, [session, status, router]);

  if (session) {
    return (
      <Stack gap="sm" align="center">
        <Text size="lg">
          Health Metrics for {session?.user?.name}{" "}
          <Text
            size="xl"
            fw={900}
            variant="gradient"
            gradient={{ from: "gray", to: "blue", deg: 48 }}
          >
            ({session?.user?.role})
          </Text>
        </Text>
        <Divider my="sm" variant="dashed" />
        <MetricsTable></MetricsTable>
      </Stack>
    );
  }
  return null;
}
