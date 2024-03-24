import { Stack, Divider, Text, Center } from "@mantine/core";
import MetricsTable from "./metricsTable";
import { useSession } from "next-auth/react";

export default function Profile() {
  const { data: session, status }: any = useSession();

  return (
    <Stack gap="sm" align="center">
      <Text size="lg">Health Metrics for {session.user.name} (member)</Text>
      <Divider my="sm" variant="dashed" />
      <MetricsTable></MetricsTable>
    </Stack>
  );
}
