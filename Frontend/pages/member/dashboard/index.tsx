import { Center, Title } from "@mantine/core";
import GoalsTable from "@/components/member/dashboard/goals";
import Sessions from "@/components/member/dashboard/sessions";
import GroupClasses from "@/components/member/dashboard/groupClasses";

export default function Dashboard() {
    return (
        <>
            <Title order={1} c="rgb(73, 105, 137)" ta="center">
                Member Dashboard
            </Title>
            <GoalsTable />
            <Sessions />
            <GroupClasses />
        </>
    );
}
