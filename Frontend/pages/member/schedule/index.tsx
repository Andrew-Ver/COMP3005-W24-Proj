import { Center, Title, Container, Space } from "@mantine/core";
import { useSession } from "next-auth/react";
import SessionsTable from "@/components/member/sessionsTable";

export default function Schedule() {
  const { data: session, status } = useSession();
  return (
    <Container px="1.7rem">
      <Title order={1} c="rgb(73, 105, 137)" ta="center">
        Your Upcoming Sessions
      </Title>
      <SessionsTable></SessionsTable>
    </Container>
  );
}
