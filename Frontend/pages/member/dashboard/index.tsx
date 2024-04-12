import { Center, Title, Tabs, Stack } from "@mantine/core";
import GoalsTable from "@/components/member/dashboard/goals";
import Sessions from "@/components/member/dashboard/sessions";
import GroupClasses from "@/components/member/dashboard/groupClasses";
import Routines from "@/components/member/dashboard/routines";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { data: session } = useSession();
  const member_username = session?.user?.username;

  const {
    data: metrics,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["metrics", member_username],
    queryFn: () => fetchMetrics(member_username as string),
  });

  if (isLoading) return <Center>Loading...</Center>;
  if (isError) return <Center>Error: {error.message}</Center>;

  return (
    <>
      <Title
        order={1}
        style={{ color: "rgb(73, 105, 137)", textAlign: "center" }}
      >
        Member Dashboard
      </Title>

      <Center>
        <Tabs defaultValue="stats" my="auto">
          <Tabs.List>
            <Tabs.Tab value="stats" miw={200}>
              Stats
            </Tabs.Tab>
            <Tabs.Tab value="goals" miw={200}>
              Goals
            </Tabs.Tab>
            <Tabs.Tab value="sessions" miw={200}>
              Sessions
            </Tabs.Tab>
            <Tabs.Tab value="routines" miw={200}>
              Routines
            </Tabs.Tab>
            <Tabs.Tab value="group-classes" miw={200}>
              Group Classes
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="stats" my="15px">
            <Title order={2} c="rgb(73, 105, 137)" ta="center" mb="md">
              Member Stats
            </Title>
            <Center>
              <pre>{`Avg historical weight: ${metrics.avg_weight} lbs\nLatest weight: ${metrics.latest_weight} lbs\nAvg historical body fat: ${metrics.avg_body_fat}%\nLatest body fat: ${metrics.latest_body_fat}%\nAvg historical blood pressure: ${metrics.avg_pressure}\nLatest blood pressure: ${metrics.latest_pressure}`}</pre>
            </Center>
          </Tabs.Panel>

          <Tabs.Panel value="goals" my="15px">
            <Stack gap="md" my="auto">
              <GoalsTable />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="sessions" my="15px">
            <Stack gap="md" my="auto">
              <Sessions />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="routines" my="15px">
            <Stack gap="md" my="auto">
              <Routines />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="group-classes" my="15px">
            <Stack gap="md" my="auto">
              <GroupClasses />
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Center>
    </>
  );
}

async function fetchMetrics(member_username: string) {
  const response = await fetch("/api/member/getMetrics", {
    method: "POST",
    body: JSON.stringify({ member_username }),
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch metrics");
  return response.json();
}
