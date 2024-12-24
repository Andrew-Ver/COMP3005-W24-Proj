import GroupSchedulingTable from '@/components/admin/groupSchedulingTable'
import { Container, ScrollArea, Title } from '@mantine/core'
export default function ClassSchedule() {
    return (
        <Container fluid px="1.7rem">
            <Title order={1} c="rgb(73, 105, 137)" ta="center">
                Available Group Class Schedules
            </Title>
            <ScrollArea>
                <GroupSchedulingTable></GroupSchedulingTable>
            </ScrollArea>
        </Container>
    )
}
