import { Stack, Divider, Text, Center, Title } from "@mantine/core";
import MetricsTable from "./metricsTable";
import { useSession } from "next-auth/react";

export default function Profile() {
    const { data: session, status }: any = useSession();

    return (
        <Stack gap="sm" align="center">
            <Title order={1}>
                Health Metrics for {session.user.name} ({session?.user.role})
            </Title>
            <Divider my="sm" variant="dashed" />
            <MetricsTable></MetricsTable>
        </Stack>
    );
}
