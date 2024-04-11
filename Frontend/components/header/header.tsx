import cx from "clsx";
import {
  Container,
  Avatar,
  Badge,
  UnstyledButton,
  Group,
  Text,
  Menu,
  Tabs,
  Burger,
  Button,
  Tooltip,
  Loader,
  Flex,
  Space,
  useMantineColorScheme,
  useComputedColorScheme,
  ActionIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./header.module.css";
import { useRouter } from "next/router";

import { signOut, useSession } from "next-auth/react";

import { IconUserOff, IconUser } from "@tabler/icons-react";

import { usePathname } from "next/navigation";

import { IconSun, IconMoon } from "@tabler/icons-react";

const membersLinks = [
  { href: "/", title: "Home" },
  { href: "/member/profile", title: "Profile" },
  { href: "/member/personal-training", title: "Personal Training Booking" },
  { href: "/member/schedule", title: "Your Sessions" },
  { href: "/member/group-class", title: "Group Class" },
  { href: "/member/dashboard", title: "Dashboard" },
  { href: "/member/billing", title: "Billing" },
];

const trainerLinks = [
  { href: "/", title: "Home" },
  { href: "/trainer/profile", title: "Profile" },
  { href: "/trainer/schedule", title: "Scheduling" },,
  { href: "/trainer/timetable", title: "Your Timetable" },
  { href: "/trainer/search", title: "Member Search" },
];

const adminLinks = [
  { href: "/", title: "Home" },
  { href: "/admin/equipment", title: "Maintenance" },
  { href: "/admin/room-booking", title: "Room Management" },
  { href: "/admin/trainers", title: "Trainer Availability" },
  { href: "/admin/schedule", title: "Group Class Schedule" },
  { href: "/admin/billing", title: "Billing" },
  { href: "/admin/payment-processing", title: "Payment Processing" },
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

  const { setColorScheme } = useMantineColorScheme();

  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });

  const currentUser: Record<string, string> = {
    role: session?.user?.role,
    name: session?.user?.name,
  };

  let links: Array<Record<string, string>> = [];

  if (currentUser.role === "member") {
    links = membersLinks;
  } else if (currentUser.role === "trainer") {
    links = trainerLinks;
  } else if (currentUser.role === "administrator") {
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
      color="rgb(51, 58, 115)"
    >
      <Tabs.Tab value={link.href} key={link.href}>
        {link.title}
      </Tabs.Tab>
    </Tooltip>
  ));

  return (
    <div className={classes.header}>
      <Container className={classes.mainSection} size="md">
        <Flex justify="space-between" align="center" mx="1rem" direction="row">
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
                <Menu.Item
                  value={link.href}
                  key={link.title}
                  onClick={() => {
                    toggle();
                    router.push(link.href);
                  }}
                >
                  {link.title}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>

          <Text size="xl" visibleFrom="sm">
            Health & Fitness Club
          </Text>

          <Flex direction="column" justify="center">
            {status === "loading" ? (
              <Loader size={30} color="blue" />
            ) : (
              <UnstyledButton className={cx(classes.user)}>
                <Group gap={7}>
                  <Avatar alt={session?.user.name} radius="lg" size={28}>
                    {session?.user ? (
                      <IconUser color="blue" />
                    ) : (
                      <IconUserOff />
                    )}
                  </Avatar>
                  {session?.user && (
                    <Tooltip
                      label={"Logged in as: " + session?.user.name}
                      transitionProps={{
                        transition: "skew-up",
                        duration: 300,
                      }}
                      position="bottom"
                      offset={15}
                      color="rgb(51, 58, 115)"
                    >
                      <Text fw={700} size="sm" lh={1} mr={3}>
                        {currentUser.name} ({currentUser.role})
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
                      position="bottom"
                      offset={15}
                      color="rgb(51, 58, 115)"
                    >
                      <Text fw={700} size="sm" lh={1} mr={3}>
                        Not logged in
                      </Text>
                    </Tooltip>
                  )}
                </Group>
              </UnstyledButton>
            )}
            <Flex
              direction="row"
              align="center"
              justify="space-between"
              px={12}
              py={1}
            >
              <ActionIcon
                variant="outline"
                radius="md"
                onClick={() =>
                  setColorScheme(
                    computedColorScheme === "light" ? "dark" : "light"
                  )
                }
              >
                <IconSun
                  className={cx(classes.icon, classes.light)}
                  stroke={1.5}
                />
                <IconMoon
                  className={cx(classes.icon, classes.dark)}
                  stroke={1.5}
                />
              </ActionIcon>

              <Space w="sm" />

              {session?.user && (
                <Tooltip
                  label="Log Out"
                  transitionProps={{
                    transition: "skew-up",
                    duration: 300,
                  }}
                  position="bottom"
                  color="rgb(51, 58, 115)"
                >
                  <Button
                    variant="outline"
                    size="xs"
                    radius="lg"
                    onClick={() => {
                      signOut();
                    }}
                  >
                    Log Out
                  </Button>
                </Tooltip>
              )}
            </Flex>
          </Flex>
        </Flex>
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
