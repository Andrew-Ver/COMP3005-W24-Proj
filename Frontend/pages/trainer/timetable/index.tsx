import { Center, Title, Container, Space, Loader } from "@mantine/core";
import Sessions from "@/components/trainer/sessions";
import Groupclasses from "@/components/trainer/groupClasses";

export default function Schedule() {
  return (
    <Container px="1.7rem">
      <Sessions></Sessions>
      <Groupclasses></Groupclasses>
    </Container>
  );
}
