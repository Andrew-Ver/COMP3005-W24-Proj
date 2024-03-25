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
  Tooltip,
  rem,
} from "@mantine/core";

import React from "react";

import { useForm } from "@mantine/form";
import { useToggle, upperFirst } from "@mantine/hooks";

import { useSession, signIn } from "next-auth/react";

import { notifications } from "@mantine/notifications";

import { IconX, IconCheck } from "@tabler/icons-react";

export default function AuthForm(props: PaperProps) {
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

  return (
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
              notifications.show({
                title: "Error Attempting to Log In",
                icon: <IconX />,
                message:
                  result.error == "CredentialsSignin"
                    ? "Invalid Credentials"
                    : "An error occurred",
                color: "red",
              });
              // Reset the form after an invalid login attempt
              //form.reset();
              form.setFieldValue("password", "");
            } else {
              notifications.show({
                title: "User Logged In",
                icon: <IconCheck />,
                message: "Logged in successfully",
                color: "green",
              });
            }
          } else if (type === "register") {
            // Register the user here
            // console.log("Registering user: ", values);
            notifications.show({
              title: "User Registered",
              message: "User registered successfully",
              color: "green",
            });
            form.reset();
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
          <Tooltip
            label={upperFirst(type)}
            transitionProps={{ transition: "skew-up", duration: 300 }}
          >
            <Button type="submit" radius="xl">
              {upperFirst(type)}
            </Button>
          </Tooltip>
        </Group>
      </form>
    </Paper>
  );
}
