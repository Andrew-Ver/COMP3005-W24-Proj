import { Avatar, Text, Group, Flex } from "@mantine/core";
import { IconCurrencyDollar } from "@tabler/icons-react";
import classes from "./UserInfoIcons.module.css";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function UserInfoIcons() {
  const { data: session, status }: any = useSession();
  const username = session?.user?.username;
  const name = session?.user?.name;
  const [ratePerHour, setRatePerHour] = useState<string | null>(null);

  useEffect(() => {
    fetchRatePerHour();
  }, []);

  const fetchRatePerHour = async () => {
    try {
      const response = await fetch(`/api/trainer/get-rateperhour`, {
        method: "POST", // Use POST for sending data
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username }), // Include username in request body
      });
      const data = await response.json();
      setRatePerHour(data.rate_per_hour);
    } catch (error) {
      console.error("Error fetching rate per hour:", error);
    }
  };

  return (
    <div>
      <Group wrap="nowrap">
        <Avatar
          src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-2.png"
          size={94}
          radius="md"
        />
        <div>
          <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
            Trainer
          </Text>

          <Text fz="lg" fw={500} className={classes.name}>
            {name}
          </Text>

          <Flex direction="row">
            <IconCurrencyDollar
              stroke={1.5}
              size="1rem"
              className={classes.icon}
            />
            <Text fz="xs" c="dimmed">
              Rate per hour: {ratePerHour}/h
            </Text>
          </Flex>
        </div>
      </Group>
    </div>
  );
}
