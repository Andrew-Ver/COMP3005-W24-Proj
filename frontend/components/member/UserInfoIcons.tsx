import { Avatar, Text, Group } from '@mantine/core';
import classes from './UserInfoIcons.module.css';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function UserInfoIcons() {
  const { data: session, status }: any = useSession();
  const username = session?.user?.username;
  const name = session?.user?.name;
  const [age, setAge] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);

  useEffect(() => {
    fetchRatePerHour();
  }, []);

  const fetchRatePerHour = async () => {
    try {
      const response = await fetch(`/api/member/profile/get`, {
        method: 'POST', // Use POST for sending data
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username }), // Include username in request body
      });
      const data = await response.json();
      setAge(data.age);
      setGender(data.gender);
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
            Member
          </Text>

          <Text fz="lg" fw={500} className={classes.name}>
            {name}
          </Text>

          <Group wrap="nowrap" gap={10} mt={3}>
            <Text fz="xs" c="dimmed">
              Age: {age}
            </Text>
          </Group>

          <Group wrap="nowrap" gap={10} mt={3}>
            <Text fz="xs" c="dimmed">
              Gender: {gender}
            </Text>
          </Group>
        </div>
      </Group>
    </div>
  );
}