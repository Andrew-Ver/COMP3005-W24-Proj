import { Center, Title, Container, Space } from "@mantine/core";

export default function MemberSearch() {
    return (
        <Container px="1.7rem">
            <Title order={1} c="rgb(73, 105, 137)" ta="center">
                Admins will search for members here (for billing and
                activations/deactivations).
            </Title>
        </Container>
    );
}
