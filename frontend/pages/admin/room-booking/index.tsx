import { Center, Title, Container, Space } from "@mantine/core";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function RoomBooking() {
    const { data: session, status }: any = useSession();
    const router = useRouter();

    if (status === "loading") {
        return (
            <Center>
                <Title order={1} c="rgb(73, 105, 137)" ta="center">
                    Loading...
                </Title>
            </Center>
        );
    } else if (session?.user?.role !== "administrator") {
        router.push("/");
    }

    return (
        <Container px="1.7rem">
            <Title order={1} c="rgb(73, 105, 137)" ta="center">
                Manage Room Booking here.
            </Title>
        </Container>
    );
}