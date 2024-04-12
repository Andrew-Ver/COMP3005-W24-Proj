import { Center, Title, Container, Space, ScrollArea } from "@mantine/core";
import GroupSchedulingTable from "@/components/admin/groupSchedulingTable";
import TrainerAvailabilityTable from "@/components/admin/trainerAvailabilityTable";
export default function ClassSchedule() {
  return (
    <Container fluid px="1.7rem">
      <TrainerAvailabilityTable></TrainerAvailabilityTable>
    </Container>
  );
}
