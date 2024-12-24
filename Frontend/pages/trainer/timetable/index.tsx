import Groupclasses from '@/components/trainer/groupClasses'
import Sessions from '@/components/trainer/sessions'
import { Container } from '@mantine/core'

export default function Schedule() {
    return (
        <Container px="1.7rem">
            <Sessions></Sessions>
            <Groupclasses></Groupclasses>
        </Container>
    )
}
