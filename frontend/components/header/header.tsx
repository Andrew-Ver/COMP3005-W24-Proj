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

const staffLinks = [
  { href: "/", title: "Home" },
  { href: "/search", title: "Member Search" },
  { href: "/room-booking", title: "Room Booking" },
  { href: "/equipment-maintenance", title: "Equipment Maintenance" },
  { href: "/class-schedule", title: "Class Schedule" },
  { href: "/billing", title: "Billing and Payments" },
];

const unauthenticatedLinks = [{ href: "/", title: "Home" }];

export default function Header() {
  const [opened, { toggle }] = useDisclosure(false);

  const { data: session, status }: any = useSession();

  const router = useRouter();

  const pathname = usePathname();

  const user = {
    role: "",
  };

  let links: Array<Record<string, string>> = [];

  if (session?.user) {
    user.role = "member";
  }

  if (user.role === "member") {
    links = membersLinks;
  } else if (user.role === "trainer") {
    links = trainerLinks;
  } else if (user.role === "staff") {
    links = staffLinks;
  } else {
    links = unauthenticatedLinks;
  }

  const items = links.map((link: any) => (
    <Tabs.Tab value={link.href} key={link.href}>
      {link.title}
    </Tabs.Tab>
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

          <Center>
            {status === "loading" && <Loader size={30} color="blue" />}
            <UnstyledButton className={cx(classes.user)}>
              <Group gap={7}>
                <Avatar alt={session?.user.name} radius="lg" size={28}>
                  {session?.user ? <IconUser color="blue" /> : <IconUserOff />}
                </Avatar>
                {session?.user && (
                  <Tooltip
                    label={session?.user.name}
                    transitionProps={{ transition: "skew-up", duration: 300 }}
                  >
                    <Text fw={700} size="sm" lh={1} mr={3}>
                      {session?.user.name}
                      {/* ({user.role}) */}
                    </Text>
                  </Tooltip>
                )}
                {!session?.user && (
                  <Tooltip
                    label="You are not logged in"
                    transitionProps={{ transition: "skew-up", duration: 300 }}
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
                transitionProps={{ transition: "skew-up", duration: 300 }}
              >
                <Button size="xs" onClick={() => signOut()}>
                  Log Out
                </Button>
              </Tooltip>
            )}
          </Center>
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
