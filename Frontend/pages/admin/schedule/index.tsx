import { Center, Title, Container, Space } from "@mantine/core";
import GroupSchedulingTable from "@/components/admin/groupSchedulingTable";
export default function ClassSchedule() {
    return (
        <Container px="1.7rem">
            <Title order={1} c="rgb(73, 105, 137)" ta="center">
                Available Group Class Schedules
            </Title>
            <GroupSchedulingTable></GroupSchedulingTable>
        </Container>
    );
}
