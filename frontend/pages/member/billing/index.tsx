import { Center, Title } from "@mantine/core";
import BillingTable from "@/components/member/billingTable"

export default function Dashboard() {
    return (
        <>
            <Title order={1} c="rgb(73, 105, 137)" ta="center">
                Bill Payment
            </Title>
            <BillingTable></BillingTable>
        </>
    );
}
