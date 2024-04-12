import React, { useEffect, useState } from "react";
import {
  Avatar,
  Text,
  Group,
  Input,
  Button,
  Select,
  Stack,
  ActionIcon,
  NumberInput,
} from "@mantine/core";
import classes from "./UserInfoIcons.module.css";
import { useSession } from "next-auth/react";
import { notifications } from "@mantine/notifications";

export function UserInfoIcons() {
  const { data: session }: any = useSession();
  const username = session?.user?.username;
  const name = session?.user?.name;
  const [age, setAge] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [isEditingAge, setIsEditingAge] = useState(false);
  const [isEditingGender, setIsEditingGender] = useState(false);
  const [newAge, setNewAge] = useState<
    string | number | readonly string[] | undefined
  >("");
  const [newGender, setNewGender] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  });

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/member/profile/get`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      setAge(data.age);
      setGender(data.gender);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleUpdateAge = async () => {
    // Implement API call to update age
    const result = await fetch("/api/member/profile/set", {
      method: "POST",
      body: JSON.stringify({
        username: session?.user?.username,
        age: newAge,
        gender: gender,
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

    setIsEditingAge(false); // Exit edit mode after update
  };

  const handleUpdateGender = async () => {
    // Implement API call to update gender
    const result = await fetch("/api/member/profile/set", {
      method: "POST",
      body: JSON.stringify({
        username: session?.user?.username,
        age: age,
        gender: newGender,
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

    setIsEditingGender(false); // Exit edit mode after update
  };

  return (
    <Group justify="center">
      <Avatar
        src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png"
        size={94}
        radius="md"
      />
      <Stack bg="var(--mantine-color-body)" gap="sm" align="center">
        <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
          Username: {username}
        </Text>
        <Text fz="lg" fw={500} className={classes.name}>
          {name}
        </Text>
        <Group gap={10} mt={3} justify="center" grow>
          {isEditingAge ? (
            <>
              <NumberInput
                size="xs"
                value={newAge as string} // Explicitly type newAge as string
                onChange={(value) => setNewAge(value)} // Pass the value directly to setNewAge
                placeholder="New age"
                max={100}
                min={18}
              />
              <Button
                variant="outline"
                size="xs"
                onClick={() => setIsEditingAge(false)}
              >
                Cancel
              </Button>
              <Button variant="outline" size="xs" onClick={handleUpdateAge}>
                Save
              </Button>
            </>
          ) : (
            <Text fz="xs" c="dimmed" onClick={() => setIsEditingAge(true)}>
              Age: {age} (Edit)
            </Text>
          )}
        </Group>
        <Group gap={10} mt={3} justify="center" grow>
          {isEditingGender ? (
            <>
              <Select
                size="xs"
                data={["male", "female", "other"]}
                value={newGender}
                onChange={setNewGender}
                placeholder="Select gender"
              />
              <Button
                variant="outline"
                size="xs"
                onClick={() => setIsEditingGender(false)}
              >
                Cancel
              </Button>
              <Button variant="outline" size="xs" onClick={handleUpdateGender}>
                Save
              </Button>
            </>
          ) : (
            <Text fz="xs" c="dimmed" onClick={() => setIsEditingGender(true)}>
              Gender: {gender} (Edit)
            </Text>
          )}
        </Group>
      </Stack>
    </Group>
  );
}
