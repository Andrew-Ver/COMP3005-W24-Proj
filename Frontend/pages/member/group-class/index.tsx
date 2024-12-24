import { Center, Title, Container, Space } from '@mantine/core'
import GroupClassTable from '@/components/member/groupClassTable'

export default function Schedule() {
    return (
        <Container px="1.7rem">
            <Title order={1} c="rgb(73, 105, 137)" ta="center">
                Schedule a Group Class Here
            </Title>
            <GroupClassTable />
        </Container>
    )
}
