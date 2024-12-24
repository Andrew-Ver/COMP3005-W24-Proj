import TrainerAvailabilityTable from '@/components/admin/trainerAvailabilityTable'
import { Container } from '@mantine/core'
export default function ClassSchedule() {
    return (
        <Container fluid px="1.7rem">
            <TrainerAvailabilityTable></TrainerAvailabilityTable>
        </Container>
    )
}
