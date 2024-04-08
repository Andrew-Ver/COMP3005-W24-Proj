import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; //if using mantine date picker features
import "mantine-react-table/styles.css"; //make sure MRT styles were imported in your app root (once)
import { useEffect, useMemo, useState } from "react";
import {
    MantineReactTable,
    type MRT_ColumnDef,
    useMantineReactTable,
} from "mantine-react-table";
import {
    Stack,
    Title,
    Divider,
    Button,
    TextInput,
    Box,
    Group, Text,
} from "@mantine/core";
import { ModalsProvider, modals } from "@mantine/modals";

import {
    QueryClient,
    QueryClientProvider,
    useQuery,
} from "@tanstack/react-query";

import { useSession } from "next-auth/react";
import { Form, useForm } from "@mantine/form";
import {useForceUpdate} from "@mantine/hooks";
import {showNotification} from "@mantine/notifications";

type Metric = {
    session_id: number;
    name: string;
    begin_time: string;
    end_time: string;
    description: string;
    is_completed: boolean;
};

export default function Sessions() {
    const { data: session, status } = useSession();

    // TODO: add code to the following block
    useEffect(() => {
        // Fetch data when the component mounts or when session changes
        if (session) {
            // Fetch data from the API
            // This will automatically trigger the useGetMetrics hook
            // and update the fetchedMetrics state
        }
    }, [session]);

    return (
        <Stack gap="sm" align="center">
    <Title order={2} c="rgb(73, 105, 137)" ta="center">
        Completed Personal Training Sessions
    </Title>
    <ExampleWithProviders />
    <Divider my="sm" variant="dashed" />
        </Stack>
);
}


const Example = () => {

    const columns = useMemo<MRT_ColumnDef<Metric>[]>(
        () => [
            {
                accessorKey: "trainer_name",
                header: "Trainer Name",
            },
            {
                accessorKey: "end_time",
                header: "Completed at",
            },
            {
                accessorKey: "description",
                header: "Description",
            }
        ],
        []
    );

    //call READ hook
    const {
        data: fetchedMetrics = [],
        isError: isLoadingMetricsError,
        isFetching: isFetchingMetrics,
        isLoading: isLoadingMetrics,
    } = useGetMetrics();

    const table = useMantineReactTable({
        columns,
        data: fetchedMetrics,
        createDisplayMode: "row", // ('modal', and 'custom' are also available)
        enableEditing: false,
        enableRowSelection: false,
        enableMultiRowSelection: false, //shows radio buttons instead of checkboxes
        // getRowId: (row) => row.availability_id.toString(),
        mantineToolbarAlertBannerProps: isLoadingMetricsError
            ? {
                color: "red",
                children: "Error loading data",
            }
            : undefined,
        mantineTableContainerProps: {
            style: {
                minHeight: "500px",
            },
        },
        state: {
            isLoading: isLoadingMetrics,
            showAlertBanner: isLoadingMetricsError,
            showProgressBars: isFetchingMetrics,
        },
    });


    // After press the button
    const { data: session, status } = useSession();


    return <MantineReactTable table={table} />;
};



//READ hook (get users from api)
function useGetMetrics() {
    const { data: session, status } = useSession();

    return useQuery<Metric[]>({
        queryKey: ["metrics"],
        queryFn: async () => {
            //send api request here
            const response = await fetch("/api/member/personal-training/getComplete", {
                method: "POST",
                body: JSON.stringify({member_username: session?.user?.username}),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();

            return data;
        },
        refetchOnWindowFocus: true,
    });
}

const queryClient = new QueryClient();

const ExampleWithProviders = () => (
    //Put this with your other react-query providers near root of your app
    <QueryClientProvider client={queryClient}>
        <ModalsProvider>
            <Example />
        </ModalsProvider>
        </QueryClientProvider>
);
