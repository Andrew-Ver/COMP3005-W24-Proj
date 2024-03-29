import { Container, Title } from "@mantine/core";

export default function Denied() {
    return (
        <Container px="1.7rem">
            <Title order={1} c="rgb(73, 105, 137)" ta="center">
                You do not have permission to access this page.
            </Title>
        </Container>
    );
}
