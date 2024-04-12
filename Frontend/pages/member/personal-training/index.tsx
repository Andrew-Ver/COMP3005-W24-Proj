import { Center, Title, Container, Space } from "@mantine/core";
import TrainersAvailabilityTable from "@/components/member/trainerAvailabilityTable";
import SessionsTable from "@/components/member/sessionsTable";

export default function Schedule() {
  return (
    <Container px="1.7rem">
      <Title order={1} c="rgb(73, 105, 137)" ta="center">
        Schedule a Personal Training Session Here
      </Title>
      <TrainersAvailabilityTable></TrainersAvailabilityTable>
    </Container>
  );
}
