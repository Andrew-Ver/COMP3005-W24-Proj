import cx from "clsx";
import {
    Container,
    Avatar,
    UnstyledButton,
    Group,
    Text,
    Menu,
    Tabs,
    Burger,
    Button,
    Tooltip,
    Loader,
    Center,
    Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./header.module.css";
import { useRouter } from "next/router";

import { signOut, useSession } from "next-auth/react";

import { IconUserOff, IconUser } from "@tabler/icons-react";

import { usePathname } from "next/navigation";

const membersLinks = [
    { href: "/", title: "Home" },
    { href: "/profile", title: "Profile" },
    { href: "/schedule", title: "Schedule" },
    { href: "/dashboard", title: "Dashboard" },
];

const trainerLinks = [
    { href: "/", title: "Home" },
    { href: "/schedule", title: "Scheduling" },
    { href: "/search", title: "Member Search" },
];

const adminLinks = [
    { href: "/", title: "Home" },
    { href: "/schedule", title: "Class Schedule" },
    { href: "/search", title: "Member Search" },
    { href: "/room-booking", title: "Room Booking" },
    { href: "/maintenance", title: "Maintenance" },
    { href: "/billing", title: "Billing" },
];

const unauthenticatedLinks = [
    { href: "/", title: "Home" },
    { href: "/login", title: "Login" },
];

export default function Header() {
    const [opened, { toggle }] = useDisclosure(false);

    const { data: session, status }: any = useSession();

    const router = useRouter();

    const pathname = usePathname();

    const currentUser: Record<string, string> = {
        role: session?.user?.role,
        name: session?.user?.name,
    };

    let links: Array<Record<string, string>> = [];

    if (currentUser.role === "Member") {
        links = membersLinks;
    } else if (currentUser.role === "Trainer") {
        links = trainerLinks;
    } else if (currentUser.role === "Administrator") {
        links = adminLinks;
    } else {
        links = unauthenticatedLinks;
    }

    const items = links.map((link: any) => (
        <Tooltip
            key={link.href}
            label={link.title}
            transitionProps={{
                transition: "skew-down",
                duration: 300,
            }}
            position="bottom"
        >
            <Tabs.Tab value={link.href} key={link.href}>
                {link.title}
            </Tabs.Tab>
        </Tooltip>
    ));

    return (
        <div className={classes.header}>
            <Container className={classes.mainSection} size="md">
                <Group justify="space-between" mx="1rem">
                    <Menu
                        shadow="md"
                        width={200}
                        position="bottom-end"
                        transitionProps={{ transition: "pop-top-right" }}
                        withinPortal
                    >
                        <Menu.Target>
                            <Burger
                                opened={opened}
                                onClick={toggle}
                                hiddenFrom="sm"
                                size="sm"
                            />
                        </Menu.Target>

                        <Menu.Dropdown>
                            {links.map((link: Record<string, string>) => (
                                <Menu.Item key={link.title} onClick={toggle}>
                                    {link.title}
                                </Menu.Item>
                            ))}
                        </Menu.Dropdown>
                    </Menu>

                    <Text size="xl" visibleFrom="sm">
                        Health & Fitness Club
                    </Text>

                    <Stack>
                        {status === "loading" && (
                            <Loader size={30} color="blue" />
                        )}
                        <UnstyledButton className={cx(classes.user)}>
                            <Group gap={7}>
                                <Avatar
                                    alt={session?.user.name}
                                    radius="lg"
                                    size={28}
                                >
                                    {session?.user ? (
                                        <IconUser color="blue" />
                                    ) : (
                                        <IconUserOff />
                                    )}
                                </Avatar>
                                {session?.user && (
                                    <Tooltip
                                        label={session?.user.name}
                                        transitionProps={{
                                            transition: "skew-up",
                                            duration: 300,
                                        }}
                                        position="bottom"
                                    >
                                        <Text fw={700} size="sm" lh={1} mr={3}>
                                            {currentUser.name} (
                                            {currentUser.role})
                                        </Text>
                                    </Tooltip>
                                )}
                                {!session?.user && (
                                    <Tooltip
                                        label="You are not logged in"
                                        transitionProps={{
                                            transition: "skew-up",
                                            duration: 300,
                                        }}
                                        position="left"
                                    >
                                        <Text fw={700} size="sm" lh={1} mr={3}>
                                            Not logged in
                                        </Text>
                                    </Tooltip>
                                )}
                            </Group>
                        </UnstyledButton>

                        {session?.user && (
                            <Tooltip
                                label="Log Out"
                                transitionProps={{
                                    transition: "skew-up",
                                    duration: 300,
                                }}
                                position="bottom"
                            >
                                <Button size="xs" onClick={() => signOut()}>
                                    Log Out
                                </Button>
                            </Tooltip>
                        )}
                    </Stack>
                </Group>
            </Container>
            <Container size="md">
                <Tabs
                    // Set current active tab based on pathname
                    value={pathname}
                    // Change route on tab change
                    onChange={(value) =>
                        router.push(`${value}`, undefined, { shallow: true })
                    }
                    variant="outline"
                    visibleFrom="sm"
                    classNames={{
                        root: classes.links,
                        list: classes.tabsList,
                        tab: classes.tab,
                    }}
                >
                    <Tabs.List>{items}</Tabs.List>
                </Tabs>
            </Container>
        </div>
    );
}
