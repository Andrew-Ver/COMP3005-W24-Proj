import { Center, Title, Container, Space } from "@mantine/core";
import ExerciseRoutineTable from "@/components/member/exerciseRoutineTable";

export default function Schedule() {
    return (
        <Container px="1.7rem">
            <ExerciseRoutineTable></ExerciseRoutineTable>
        </Container>
    );
}
