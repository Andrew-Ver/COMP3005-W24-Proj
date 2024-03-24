import cx from "clsx";
import { useState } from "react";
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
  Center,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./header.module.css";

import { signOut, useSession } from "next-auth/react";

const membersLinks = [
  { link: "/home", title: "Home" },
  { link: "/profile", title: "Profile" },
  { link: "/schedule", title: "Schedule" },
  { link: "/dashboard", title: "Dashboard" },
];

const trainerLinks = [
  { link: "/home", title: "Home" },
  { link: "/schedule", title: "Schedule" },
  { link: "/search", title: "Search" },
];

const staffLinks = [
  { link: "/home", title: "Home" },
  { link: "/search", title: "Search" },
  { link: "/room-booking", title: "Room Booking" },
  { link: "/equipment-maintenance", title: "Equipment Maintenance" },
  { link: "/class-schedule", title: "Class Schedule" },
  { link: "/billing-and-payments", title: "Billing and Payments" },
];

const unauthenticatedLinks = [{ link: "/home", title: "Home" }];

export default function Header() {
  const [opened, { toggle }] = useDisclosure(false);

  const [showMenu, setShowMenu] = useState(false);

  const { data: session, status }: any = useSession();

  const user = {
    role: "",
  };

  let links: any = [];

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

  // const activeTab =
  //   links.find((link: any) => router.pathname.includes(link.link))?.title ||
  //   "Home";

  const items = links.map((link: any) => (
    <Tabs.Tab value={link.title} key={link.title}>
      {link.title}
    </Tabs.Tab>
  ));

  return (
    <div className={classes.header}>
      <Container className={classes.mainSection} size="md">
        <Group justify="space-between">
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
              {links.map((link: any) => (
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
            <UnstyledButton className={cx(classes.user)}>
              <Group gap={7}>
                <Avatar alt={session?.user.name} radius="xl" size={30} />
                {session?.user && (
                  <Text fw={700} size="sm" lh={1} mr={3}>
                    {session?.user.name}
                    {/* ({user.role}) */}
                  </Text>
                )}
                {!session?.user && (
                  <Text fw={700} size="sm" lh={1} mr={3}>
                    Not logged in
                  </Text>
                )}
              </Group>
            </UnstyledButton>

            {session?.user && (
              <Button size="xs" onClick={() => signOut()}>
                Log Out
              </Button>
            )}
          </Center>
        </Group>
      </Container>
      <Container size="md">
        <Tabs
          defaultValue="Home"
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
