import {
    Center,
    Button,
    Title,
    Container,
    Space,
    useMantineColorScheme,
} from "@mantine/core";

export default function MemberSearch() {
    return (
        <Container px="1.7rem">
            <Title order={1} c="rgb(73, 105, 137)" ta="center">
                Search for Gym Members here.
            </Title>
        </Container>
    );
}
