import { Center, Title, Container, Space, Loader } from "@mantine/core";
import SchedulingTable from "@/components/trainer/schedulingTable"

export default function Schedule() {
    return (
        <Container px="1.7rem">
            <SchedulingTable></SchedulingTable>

        </Container>
    );
}
