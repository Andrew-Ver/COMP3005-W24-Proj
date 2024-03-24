import {
  TextInput,
  PasswordInput,
  Checkbox,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  PaperProps,
  Group,
  Divider,
  Stack,
  Button,
  RadioGroup,
  Radio,
  Notification,
} from "@mantine/core";

import React, { useState } from "react";

import { useRouter } from "next/router";

import { useForm } from "@mantine/form";
import { useToggle, upperFirst } from "@mantine/hooks";

import { useSession, signIn } from "next-auth/react";

export default function AuthForm(props: PaperProps) {
  const [errorMessage, setErrorMessage] = useState("");
  const [type, toggle] = useToggle(["login", "register"]);
  const form = useForm({
    initialValues: {
      username: "",
      password: "",
      role: "member",
    },

    validate: {
      username: (value) => (value.length >= 3 ? null : "Name is too short"),
      password: (value) => (value.length >= 6 ? null : "Password is too short"),
    },
  });

  const router = useRouter();

  return (
    <>
      {errorMessage && (
        <Notification color="red" onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Notification>
      )}

      <Paper radius="md" p="xl" withBorder {...props}>
        <Text size="xl" fw={500}>
          Welcome, please {type} to continue
        </Text>

        <Divider labelPosition="center" my="lg" />

        {/* Route to api handler here */}
        <form
          onSubmit={form.onSubmit(async (values) => {
            if (type === "login") {
              const result: any = await signIn("credentials", {
                username: values.username,
                password: values.password,
                redirect: false,
              });

              if (!result.ok) {
                // Handle the error here
                // console.log("Error: ", result);
                setErrorMessage(`Error: ${result.error}`);
                form.reset();
              } else {
                router.push("/profile");
              }
            }
          })}
        >
          <Stack>
            <TextInput
              required
              label="Userame"
              placeholder="Your username"
              value={form.values.username}
              onChange={(event) =>
                form.setFieldValue("username", event.currentTarget.value)
              }
              error={
                form.errors.username &&
                "Username should include at least 3 characters"
              }
              radius="md"
            />

            {type === "register" && (
              <RadioGroup
                label="User Role"
                required
                value={form.values.role}
                onChange={(event) => form.setFieldValue("role", event)}
              >
                <Group justify="center">
                  <Radio value="member" label="Member" />
                  <Radio value="trainer" label="Trainer" />
                  <Radio value="staff" label="Staff" />
                </Group>
              </RadioGroup>
            )}

            <PasswordInput
              required
              label="Password"
              placeholder="Your password"
              value={form.values.password}
              onChange={(event) =>
                form.setFieldValue("password", event.currentTarget.value)
              }
              error={
                form.errors.password &&
                "Password should include at least 6 characters"
              }
              radius="md"
            />
          </Stack>

          <Group justify="space-between" mt="xl">
            <Anchor
              component="button"
              type="button"
              c="dimmed"
              onClick={() => toggle()}
              size="xs"
            >
              {type === "register"
                ? "Already have an account? Login"
                : "Don't have an account? Register"}
            </Anchor>
            <Button type="submit" radius="xl">
              {upperFirst(type)}
            </Button>
          </Group>
        </form>
      </Paper>
    </>
  );
}
