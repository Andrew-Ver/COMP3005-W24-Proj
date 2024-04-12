import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; //if using mantine date picker features
import "mantine-react-table/styles.css"; //make sure MRT styles were imported in your app root (once)
import GoalsTable from "@/components/member/goals";
import MemberProfile from "@/components/member/memberProfile";
import { Center, Tabs, Stack, Title } from "@mantine/core";
import MetricTable from "@/components/member/metricTable";

export default function Profile() {
  return (
    <Center>
      <Tabs defaultValue="profile" my="auto">
        <Tabs.List>
          <Tabs.Tab value="profile" miw={300}>
            Profile
          </Tabs.Tab>
          <Tabs.Tab value="stats" miw={300}>
            Stats
          </Tabs.Tab>
          <Tabs.Tab value="goals" miw={300}>
            Goals
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="profile" my="15px">
          <Title order={3} c="rgb(73, 105, 137)" ta="center" mb="md">
            Change Profile Info
          </Title>
          <MemberProfile />
        </Tabs.Panel>

        <Tabs.Panel value="stats" my="15px">
          <Title order={3} c="rgb(73, 105, 137)" ta="center">
            Member Stats
          </Title>
          <Stack gap="md" my="auto">
            <MetricTable />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="goals" my="15px">
          <Title order={3} c="rgb(73, 105, 137)" ta="center">
            Goals
          </Title>

          <Stack gap="md" my="auto">
            <GoalsTable />
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Center>
  );
}
