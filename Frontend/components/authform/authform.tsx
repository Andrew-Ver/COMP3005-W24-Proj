import {
    Anchor,
    Button,
    Divider,
    Flex,
    Group,
    NumberInput,
    Paper,
    PaperProps,
    PasswordInput,
    Radio,
    RadioGroup,
    Select,
    Stack,
    Text,
    TextInput,
    Tooltip
} from '@mantine/core'

import { useForm } from '@mantine/form'
import { upperFirst, useToggle } from '@mantine/hooks'

import { signIn } from 'next-auth/react'

import { notifications } from '@mantine/notifications'

import { IconCheck, IconX } from '@tabler/icons-react'

export default function AuthForm(props: PaperProps) {
    const [type, toggle] = useToggle(['login', 'register'])
    const form = useForm({
        initialValues: {
            username: '',
            password: '',
            firstname: '',
            lastname: '',
            role: 'member',
            rate: 20,
            gender: '',
            age: 18
        },
        validateInputOnChange: true,

        validate: {
            username: (value) =>
                value.length >= 2 && value.length <= 25
                    ? null
                    : 'Username must be between 2-25 characters',
            password: (value) =>
                value.length >= 5 && value.length <= 30
                    ? null
                    : 'Password must be between 5-30 characters',
            firstname: (value) =>
                (value.length >= 1 && value.length <= 25) || type === 'login'
                    ? null
                    : 'Must be between 1-25 characters',
            lastname: (value) =>
                (value.length >= 1 && value.length <= 25) || type === 'login'
                    ? null
                    : 'Must be between 1-25 characters'
        }
    })

    const handleFormSubmit = async (values: {
        username: string
        password: string
        firstname?: string
        lastname?: string
        role: string
        rate?: number
        age?: number
        gender?: string
    }) => {
        if (type === 'login') {
            const result: any = await signIn('credentials', {
                username: values.username.toLowerCase(),
                password: values.password,
                redirect: false
            })

            if (!result.ok) {
                // Handle the error here
                notifications.show({
                    title: 'Error Attempting to Log In',
                    icon: <IconX />,
                    message:
                        result.error == 'CredentialsSignin'
                            ? 'Invalid Credentials'
                            : 'Internal Server Error',
                    color: 'red'
                })
                // Reset the form after an invalid login attempt
                //form.reset();
                form.setFieldValue('password', '')
            } else {
                // User logged in successfully
                notifications.show({
                    title: 'User Logged In',
                    icon: <IconCheck />,
                    message: `Logged in successfully as ${values?.username}`,
                    color: 'green'
                })
            }
        } else if (type === 'register') {
            // Call the API endpoint to register the user in the account db
            const response: any = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                //body: JSON.stringify(values),
                // Combine first and last name into a single name field
                body: JSON.stringify({
                    // ...values, (Unpack values)
                    // But instead we are converting the username to lowercase at registration
                    username: values.username.toLowerCase(),
                    password: values.password,
                    role: values.role,
                    gender: values.gender,
                    age: values.age,
                    // Titlecase the name
                    name: `${values.firstname} ${values.lastname}`.replace(
                        /\b\w/g,
                        (c: any) => c.toUpperCase()
                    ),
                    rate: values.rate
                })
            })

            if (!response.ok) {
                // Handle the error message here
                // using (await response.json()).message), as retrieved from the API
                notifications.show({
                    title: 'Error Attempting to Register',
                    icon: <IconX />,
                    message: (await response.json()).message,
                    color: 'red'
                })
                // Reset the form after an invalid login attempt
                //form.reset();
                form.setFieldValue('password', '')
            } else {
                form.reset()
                toggle()
                notifications.show({
                    title: 'User Registered',
                    message: `Successfully Registered as: ${values?.username}`,
                    color: 'green'
                })
                // Login after successfully registration
                try {
                    await signIn('credentials', {
                        username: values.username.toLowerCase(),
                        password: values.password,
                        redirect: false
                    })
                } catch (error) {
                    // Handle the error here
                    notifications.show({
                        title: 'Error Attempting to Log In',
                        icon: <IconX />,
                        message: `An error occurred (${error})`,
                        color: 'red'
                    })
                }
            }
        }
    }

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
                            form.setFieldValue(
                                'username',
                                event.currentTarget.value
                            )
                        }
                        error={
                            form.errors.username
                            //&& "Username should include at least 3 characters"
                        }
                        radius="md"
                    />

                    {type === 'register' && (
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
                                            'firstname',
                                            event.currentTarget.value
                                        )
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
                                        form.setFieldValue(
                                            'lastname',
                                            event.currentTarget.value
                                        )
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
                                onChange={(event) =>
                                    form.setFieldValue('role', event)
                                }
                            >
                                <Group justify="center">
                                    <Radio value="member" label="Member" />
                                    <Radio value="trainer" label="Trainer" />
                                    <Radio
                                        value="administrator"
                                        label="Staff"
                                    />
                                </Group>
                            </RadioGroup>

                            {form.values.role === 'trainer' && (
                                <NumberInput
                                    label="Hourly Rate"
                                    value={form.values.rate}
                                    withAsterisk
                                    placeholder="20"
                                    onChange={(event) => {
                                        form.setFieldValue(
                                            'rate',
                                            event as number
                                        )
                                    }}
                                    min={1}
                                    max={100}
                                />
                            )}

                            {form.values.role === 'member' && (
                                <Flex direction="row" gap="md">
                                    <NumberInput
                                        label="Age"
                                        value={form.values.age}
                                        withAsterisk
                                        placeholder="20"
                                        onChange={(event) => {
                                            form.setFieldValue(
                                                'age',
                                                event as number
                                            )
                                        }}
                                        min={18}
                                        max={100}
                                    />
                                    <Select
                                        label="Gender"
                                        placeholder="Select Gender"
                                        data={['male', 'female', 'other']}
                                        onChange={(event) => {
                                            form.setFieldValue(
                                                'gender',
                                                event as string
                                            )
                                        }}
                                    />
                                </Flex>
                            )}
                        </>
                    )}

                    <PasswordInput
                        required
                        label="Password"
                        placeholder="Your password"
                        value={form.values.password}
                        onChange={(event) =>
                            form.setFieldValue(
                                'password',
                                event.currentTarget.value
                            )
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
                        {type === 'register'
                            ? 'Already have an account? Login'
                            : "Don't have an account? Register"}
                    </Anchor>
                    <Tooltip
                        label={upperFirst(type)}
                        transitionProps={{
                            transition: 'skew-up',
                            duration: 300
                        }}
                    >
                        <Button type="submit" radius="xl">
                            {upperFirst(type)}
                        </Button>
                    </Tooltip>
                </Group>
            </form>
        </Paper>
    )
}
