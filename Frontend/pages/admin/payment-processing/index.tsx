import BillingTable from '@/components/admin/billingTable'
import { Title } from '@mantine/core'

export default function Dashboard() {
    return (
        <>
            <Title order={1} c="rgb(73, 105, 137)" ta="center">
                Bill Payment
            </Title>
            <BillingTable></BillingTable>
        </>
    )
}
