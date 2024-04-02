import {
  TextInput,
  PasswordInput,
  Anchor,
  Paper,
  Text,
  PaperProps,
  Group,
  Divider,
  Stack,
  Button,
  RadioGroup,
  Radio,
  Tooltip,
  Flex,
  Select,
  NativeSelect,
} from "@mantine/core";

import React from "react";

import { useForm } from "@mantine/form";
import { useToggle, upperFirst } from "@mantine/hooks";

import { signIn } from "next-auth/react";

import { notifications } from "@mantine/notifications";

import { IconX, IconCheck } from "@tabler/icons-react";

export default function AuthForm(props: PaperProps) {
  const [type, toggle] = useToggle(["login", "register"]);
  const form = useForm({
    initialValues: {
      username: "",
      password: "",
      firstname: "",
      lastname: "",
      role: "member",
      rateperhour: "",
      age: "",
      gender: "male"
    },
    validateInputOnChange: true,

    validate: {
      gender: (value, values) => {
        if (type === "register" && values.role === "member") {
          if (!value) {
            return "Gender is required for members";
          }
        }
        return null;
      },
      age: (value, values) => {
        if (type === "register" && values.role === "member") {
          if (!value) {
            return "Age is required for members";
          } else if (isNaN(parseFloat(value))) {
            return "Age must be a number";
          } else if (parseFloat(value) <= 0) {
            return "Age must be a positive number";
          }
        }
        return null;
      },
      rateperhour: (value, values) => {
        if (type === "register" && values.role === "trainer") {
          if (!value) {
            return "Rate per hour is required for trainers";
          } else if (isNaN(parseFloat(value))) {
            return "Rate per hour must be a number";
          } else if (parseFloat(value) <= 0) {
            return "Rate per hour must be a positive number";
          }
        }
        return null;
      },
      username: (value) =>
        value.length >= 3 && value.length <= 25
          ? null
          : "Username must be between 3-25 characters",
      password: (value) =>
        value.length >= 5 && value.length <= 30
          ? null
          : "Password must be between 5-30 characters",
      firstname: (value) =>
        (value.length >= 3 && value.length <= 25) || type === "login"
          ? null
          : "Must be between 3 and 25 characters",
      lastname: (value) =>
        (value.length >= 3 && value.length <= 25) || type === "login"
          ? null
          : "Must be between 3 and 25 characters",
    },
  });

  const handleFormSubmit = async (values: {
    username: string;
    password: string;
    firstname?: string;
    lastname?: string;
    role?: string;
    rateperhour: string;
    age: string;
    gender?: string;
  }) => {
    if (type === "login") {
      const result: any = await signIn("credentials", {
        username: values.username.toLowerCase(),
        password: values.password,
        redirect: false,
      });
      // console.log(`result: ${JSON.stringify(result)}`);

      if (!result.ok) {
        console.log(result.error);
        // Handle the error here
        notifications.show({
          title: "Error Attempting to Log In",
          icon: <IconX />,
          message:
            result.error == "CredentialsSignin"
              ? "Invalid Credentials"
              : "Internal Server Error",
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
      // Call the API endpoint to register the user in the account db
      const accountResponse: any = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        //body: JSON.stringify(values),
        // Combine first and last name into a single name field
        body: JSON.stringify({
          // ...values, (Unpack values)
          // But instead we are converting the username to lowercase at registration
          username: values.username.toLowerCase(),
          password: values.password,
          // disregard type-error,
          role: values.role,
          // Titlecase the name
          name: `${values.firstname} ${values.lastname}`.replace(
            /\b\w/g,
            (c: any) => c.toUpperCase()
          ),
        }),
      });

      if (values.role === "trainer") {
        // Call the API endpoint to register the user in the trainer db
        const trainerResponse: any = await fetch("/api/trainer/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          //body: JSON.stringify(values),
          body: JSON.stringify({
            username: values.username.toLowerCase(),
            rateperhour: values.rateperhour
          }),
        });
        if (!trainerResponse.ok) {
          // Handle the error message here
          // using (await response.json()).message), as retrieved from the API
          notifications.show({
            title: "Error Attempting to Register to Trainer Database",
            icon: <IconX />,
            message: (await trainerResponse.json()).message,
            color: "red",
          });
          // Reset the form after an invalid login attempt
          //form.reset();
        }
      }
      else if (values.role === "member") {
        // Call the API endpoint to register the user to the member db
        const memberResponse: any = await fetch("/api/member/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          //body: JSON.stringify(values),
          body: JSON.stringify({
            username: values.username.toLowerCase(),
            age: values.age,
            gender: values.gender
          }),
        });

        if (!memberResponse.ok) {
          // Handle the error message here
          // using (await response.json()).message), as retrieved from the API
          notifications.show({
            title: "Error Attempting to Register to Member Database",
            icon: <IconX />,
            message: (await memberResponse.json()).message,
            color: "red",
          });
          // Reset the form after an invalid login attempt
          //form.reset();
        }
      }

      if (!accountResponse.ok) {
        // Handle the error message here
        // using (await response.json()).message), as retrieved from the API
        notifications.show({
          title: "Error Attempting to Register",
          icon: <IconX />,
          message: (await accountResponse.json()).message,
          color: "red",
        });
        // Reset the form after an invalid login attempt
        //form.reset();
        form.setFieldValue("password", "");
      }
      else {
        form.reset();
        //toggle();
        notifications.show({
          title: "User Registered",
          message: `Successfully Registered as: ${values.username}`,
          color: "green",
        });


        // Login after successfully registration
        try {
          await signIn("credentials", {
            username: values.username.toLowerCase(),
            password: values.password,
            redirect: false,
          });
        } catch (error) {
          // Handle the error here
          notifications.show({
            title: "Error Attempting to Log In",
            icon: <IconX />,
            message: `An error occurred (${error})`,
            color: "red",
          });
        }
      }
    }
  };


  return (
    <Paper radius="md" p="xl" withBorder {...props}>
      <Text size="xl" fw={500}>
        Welcome, please {type} to continue
      </Text>

      <Divider labelPosition="center" my="lg" />

      {/* Route to api handler here */}
      <form onSubmit={form.onSubmit(handleFormSubmit)}>
        <Stack>
          <TextInput
            required
            label="Username"
            placeholder="Your username"
            value={form.values.username}
            onChange={(event) =>
              form.setFieldValue("username", event.currentTarget.value)
            }
            error={
              form.errors.username
              //&& "Username should include at least 3 characters"
            }
            radius="md"
          />

          {type === "register" && (
            <>
              <Flex mih={50} gap="md" justify="space-between" direction="row">
                <TextInput
                  required
                  label="First Name"
                  placeholder="Your first name"
                  value={form.values.firstname}
                  onChange={(event) =>
                    form.setFieldValue("firstname", event.currentTarget.value)
                  }
                  error={
                    form.errors.firstname
                    // && "First name should include at least 3 characters"
                  }
                  radius="md"
                ></TextInput>
                <TextInput
                  required
                  label="Last Name"
                  placeholder="Your last name"
                  value={form.values.lastname}
                  onChange={(event) =>
                    form.setFieldValue("lastname", event.currentTarget.value)
                  }
                  error={
                    form.errors.lastname
                    // && "Last name should include at least 3 characters"
                  }
                  radius="md"
                ></TextInput>
              </Flex>

              <RadioGroup
                label="User Role"
                required
                value={form.values.role}
                onChange={(event) => form.setFieldValue("role", event)}
              >
                <Group justify="center">
                  <Radio value="member" label="Member" />
                  <Radio value="trainer" label="Trainer" />
                  <Radio value="administrator" label="Staff" />
                </Group>
              </RadioGroup>

              {form.values.role === "trainer" && (
                <TextInput
                  required
                  label="Rate Per Hour"
                  placeholder="$0/h"
                  value={form.values.rateperhour}
                  onChange={(event) =>
                    form.setFieldValue("rateperhour", event.currentTarget.value)
                  }
                  error={
                    form.errors.rateperhour &&
                    "Rate per hour is required for trainers"
                  }
                  radius="md"
                >
                </TextInput>
              )}

              {form.values.role === "member" && (
                <Group>
                  <TextInput
                    required
                    label="age"
                    placeholder="0"
                    value={form.values.age}
                    onChange={(event) =>
                      form.setFieldValue("age", event.currentTarget.value)
                    }
                    error={
                      form.errors.age &&
                      "Age is required for members"
                    }
                    radius="md"
                  />
                  <NativeSelect
                    required
                    label="gender"
                    value={form.values.gender}
                    data={['male', 'female', 'others']}
                    onChange={(event) =>
                      form.setFieldValue("gender", event.currentTarget.value)
                    }
                    error={
                      form.errors.gender &&
                      "Gender is required for members"
                    }
                    radius="md"
                  />
                </Group>

              )}
            </>
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
              form.errors.password
              // && "Password should include at least 6 characters"
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
            transitionProps={{
              transition: "skew-up",
              duration: 300,
            }}
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