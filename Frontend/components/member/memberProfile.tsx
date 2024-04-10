import { useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";
import {
  Box,
  Stack,
  Select,
  Button,
  Text,
  TextInput,
  NumberInput,
  Flex,
  Paper
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { UserInfoIcons } from "./UserInfoIcons";

export default function MemberProfile() {
  const { data: session } = useSession();
  const [age, setAge] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);

  async function handleFormSubmit(values: { age: number; gender: string }) {
    /*
        Make a post request to /api/trainer/profile/set with the form values
    */
    const result = await fetch("/api/member/profile/set", {
      method: "POST",
      body: JSON.stringify({
        username: session?.user?.username,
        ...values,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (result.ok) {
      // Show a success notification
      notifications.show({
        title: "Profile Updated",
        message: `Your profile has been updated successfully.`,
        color: "green",
      });
    } else {
      // Show an error notification
      notifications.show({
        title: "Error Updating Profile",
        message: "An error occurred while updating the profile.",
        color: "red",
      });
    }
  }

  const form = useForm({
    initialValues: {
      gender: "",
      name: session?.user?.name,
      age: 18,
    },
  });
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const handleButtonClick = async () => {
    setIsButtonDisabled(true);
    await handleFormSubmit(form.values);
    form.reset();
    setTimeout(() => {
      setIsButtonDisabled(false);
    }, 1500);
  };

  return (
    <Paper maw={250} mx="auto" my="auto" shadow="lg" radius="lg" p="xl" withBorder>
      <UserInfoIcons></UserInfoIcons>
    </Paper>
  );
}
