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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { UserInfoIcons } from "./UserInfoIcons";

export default function MemberProfile() {
  const { data: session } = useSession();

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
    <Box maw={250} mx="auto" my="auto">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleButtonClick();
        }}
      >
        <Stack gap="md" my="auto">
          <Flex gap="md" justify="center">
            <UserInfoIcons />
          </Flex>
          <Stack gap="md">
            <Text>Name</Text>
            <TextInput disabled {...form.getInputProps("name")} />
            <Flex direction="row" gap="md">
              <NumberInput
                label="Age"
                value={form.values.age}
                withAsterisk
                placeholder="20"
                onChange={(event) => {
                  form.setFieldValue("age", event as number);
                }}
                min={18}
                max={100}
              />
              <Select
                label="Gender"
                value={form.values.gender}
                placeholder="Select Gender"
                required
                data={["male", "female", "other"]}
                onChange={(event) => {
                  form.setFieldValue("gender", event as string);
                }}
              />
            </Flex>
          </Stack>
          <Button
            type="submit"
            onClick={handleButtonClick}
            disabled={isButtonDisabled}
          >
            Save
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
