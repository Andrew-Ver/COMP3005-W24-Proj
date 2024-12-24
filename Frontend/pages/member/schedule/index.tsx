import SessionsTable from '@/components/member/sessionsTable'
import { Container, Title } from '@mantine/core'
import { useSession } from 'next-auth/react'

export default function Schedule() {
    const { data: session, status } = useSession()
    return (
        <Container px="1.7rem">
            <Title order={1} c="rgb(73, 105, 137)" ta="center">
                Your Upcoming Sessions
            </Title>
            <SessionsTable></SessionsTable>
        </Container>
    )
}
