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
    Flex,
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
            firstname: "",
            lastname: "",
            role: "Member",
        },

        validate: {
            username: (value) =>
                value.length >= 3 ? null : "Name is too short",
            password: (value) =>
                value.length >= 6 ? null : "Password is too short",
            // firstname: (value) =>
            //     value.length >= 3 ? null : "Name is too short",
            // lastname: (value) =>
            //     value.length >= 3 ? null : "Name is too short",
        },
    });

    const handleFormSubmit = async (values: {
        username: string;
        password: string;
        firstname?: string;
        lastname?: string;
    }) => {
        if (type === "login") {
            const result: any = await signIn("credentials", {
                username: values.username,
                password: values.password,
                redirect: false,
            });

            console.log(`result: ${JSON.stringify(result)}`);

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
            // Call the API endpoint to register the user
            console.log("Registering user: ", values);
            const response: any = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                //body: JSON.stringify(values),
                // Combine first and last name into a single name field
                body: JSON.stringify({
                    ...values,
                    name: `${values.firstname} ${values.lastname}`,
                }),
            });
            if (!response.ok) {
                // Handle the error message here
                // using (await response.json()).message), as retrieved from the API
                notifications.show({
                    title: "Error Attempting to Register",
                    icon: <IconX />,
                    message: (await response.json()).message,
                    color: "red",
                });
                // Reset the form after an invalid login attempt
                //form.reset();
                form.setFieldValue("password", "");
            } else {
                form.reset();
                //toggle();
                notifications.show({
                    title: "User Registered",
                    message: "User registered successfully",
                    color: "green",
                });
                // Login after successfully registration
                try {
                    await signIn("credentials", {
                        username: values.username,
                        password: values.password,
                        redirect: false,
                    });
                } catch (error) {
                    // Handle the error here
                    notifications.show({
                        title: "Error Attempting to Log In",
                        icon: <IconX />,
                        message: "An error occurred",
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
                        label="Userame"
                        placeholder="Your username"
                        value={form.values.username}
                        onChange={(event) =>
                            form.setFieldValue(
                                "username",
                                event.currentTarget.value
                            )
                        }
                        error={
                            form.errors.username &&
                            "Username should include at least 3 characters"
                        }
                        radius="md"
                    />

                    {type === "register" && (
                        <>
                            <Flex
                                mih={50}
                                gap="md"
                                justify="space-between"
                                direction="row"
                            >
                                <TextInput
                                    required
                                    label="First Name"
                                    placeholder="Your first name"
                                    value={form.values.firstname}
                                    onChange={(event) =>
                                        form.setFieldValue(
                                            "firstname",
                                            event.currentTarget.value
                                        )
                                    }
                                    error={
                                        form.errors.firstname &&
                                        "First name should include at least 3 characters"
                                    }
                                    radius="md"
                                ></TextInput>
                                <TextInput
                                    required
                                    label="Last Name"
                                    placeholder="Your last name"
                                    value={form.values.lastname}
                                    onChange={(event) =>
                                        form.setFieldValue(
                                            "lastname",
                                            event.currentTarget.value
                                        )
                                    }
                                    error={
                                        form.errors.lastname &&
                                        "Last name should include at least 3 characters"
                                    }
                                    radius="md"
                                ></TextInput>
                            </Flex>

                            <RadioGroup
                                label="User Role"
                                required
                                value={form.values.role}
                                onChange={(event) =>
                                    form.setFieldValue("role", event)
                                }
                            >
                                <Group justify="center">
                                    <Radio value="Member" label="Member" />
                                    <Radio value="Trainer" label="Trainer" />
                                    <Radio
                                        value="Administrator"
                                        label="Staff"
                                    />
                                </Group>
                            </RadioGroup>
                        </>
                    )}

                    <PasswordInput
                        required
                        label="Password"
                        placeholder="Your password"
                        value={form.values.password}
                        onChange={(event) =>
                            form.setFieldValue(
                                "password",
                                event.currentTarget.value
                            )
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
