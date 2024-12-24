import '@mantine/core/styles.css'
import '@mantine/dates/styles.css' //if using mantine date picker features
import 'mantine-react-table/styles.css' //make sure MRT styles were imported in your app root (once)
import { useEffect, useMemo, useState } from 'react'
import {
    MantineReactTable,
    type MRT_ColumnDef,
    useMantineReactTable
} from 'mantine-react-table'
import { Stack, Title, Divider } from '@mantine/core'

import { useQuery } from '@tanstack/react-query'

import { useSession } from 'next-auth/react'

type Metric = {
    member_username: string
    goal_type: string
    achieved: boolean
}

export default function GoalsTable() {
    return (
        <Stack gap="sm" align="center">
            <Title order={2} c="rgb(73, 105, 137)" ta="center">
                Completed Goals
            </Title>
            <Table />
        </Stack>
    )
}

const Table = () => {
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string | undefined>
    >({})

    const columns = useMemo<MRT_ColumnDef<Metric>[]>(
        () => [
            {
                accessorKey: 'goal_type',
                header: 'Completed Goals',
                size: 500
            }
        ],
        []
    )

    //call READ hook
    const {
        data: fetchedMetrics = [],
        isError: isLoadingMetricsError,
        isFetching: isFetchingMetrics,
        isLoading: isLoadingMetrics
    } = useGetMetrics()

    const table = useMantineReactTable({
        columns,
        data: fetchedMetrics,
        createDisplayMode: 'row', // ('modal', and 'custom' are also available)
        enableRowActions: false,
        enableRowSelection: false,
        enableEditing: false,
        enableMultiRowSelection: false, //shows radio buttons instead of checkboxes
        // getRowId: (row) => row.availability_id.toString(),
        mantineToolbarAlertBannerProps: isLoadingMetricsError
            ? {
                  color: 'red',
                  children: 'Error loading data'
              }
            : undefined,
        mantineTableContainerProps: {
            style: {
                minHeight: '500px',
                minWidth: '500px'
            }
        },
        state: {
            isLoading: isLoadingMetrics,
            showAlertBanner: isLoadingMetricsError,
            showProgressBars: isFetchingMetrics
        },
        onCreatingRowCancel: () => setValidationErrors({})
    })

    return <MantineReactTable table={table} />
}

//READ hook (get users from api)
function useGetMetrics() {
    const { data: session, status } = useSession()

    return useQuery<Metric[]>({
        queryKey: ['metrics'],
        queryFn: async () => {
            //send api request here
            const response = await fetch('/api/member/goals/getDone', {
                method: 'POST',
                body: JSON.stringify({
                    member_username: session?.user?.username
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const data = await response.json()

            return data
        },
        refetchOnWindowFocus: true
    })
}
