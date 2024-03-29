import { Center, Loader, Title, Space, Stack, Button } from "@mantine/core";
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
            <Stack px="1.7rem" align="center" justify="space-between">
                <Title order={1} c="rgb(73, 105, 137)" ta="center">
                    Welcome to Health & Fitness.
                </Title>
                <Title order={2} c="rgb(73, 105, 137)" ta="center">
                    Please use the links in the header to navigate around.
                </Title>
                <Space h="xl" />
                <Title order={4} c="blue" ta="center">
                    This Final Project is for COMP3005 - Database Management
                    Systems at Carleton University
                </Title>
            </Stack>
        );
    } else {
        router.push("/login");
    }
}
