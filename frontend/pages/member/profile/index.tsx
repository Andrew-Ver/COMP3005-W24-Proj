import { Stack, Divider, Text, Title, Center, Button } from "@mantine/core";
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
                <Title order={1} c="rgb(73, 105, 137)" ta="center">
                    Health Metrics for{" "}
                    {session?.user?.name?.replace(/\b\w/g, (c: any) =>
                        c.toUpperCase()
                    )}{" "}
                </Title>
                <Divider my="sm" variant="dashed" />
                <MetricsTable></MetricsTable>
            </Stack>
        );
    }
    return null;
}
