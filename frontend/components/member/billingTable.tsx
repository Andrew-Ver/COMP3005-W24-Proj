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
    Group,
    Text
} from "@mantine/core";
import { ModalsProvider, modals } from "@mantine/modals";
import { useRouter  } from "next/router";

import {
    QueryClient,
    QueryClientProvider,
    useQuery,
} from "@tanstack/react-query";

import { useSession } from "next-auth/react";
import { Form, useForm } from "@mantine/form";
import {showNotification} from "@mantine/notifications";
import {router} from "next/client";
import {setTimeout} from "next/dist/compiled/@edge-runtime/primitives";

type Metric = {
    bill_id: number;
    member_username: string;
    amount: number;
    description: string;
    bill_timestamp: string;
    cleared: boolean;
};

export default function BillingTable() {
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
                Billings for Member {session?.user?.name}
            </Title>
            <ExampleWithProviders />
            <Divider my="sm" variant="dashed" />
        </Stack>
    );
}


const Example = () => {
    const [, forceUpdate] = useState();

    const columns = useMemo<MRT_ColumnDef<Metric>[]>(
        () => [
            {
                accessorKey: "bill_id",
                header: "Bill ID",
            },
            {
                accessorKey: "member_username",
                header: "Member Username",
            },
            {
                accessorKey: "amount",
                header: "Amount"
            },
            {
                accessorKey: "description",
                header: "Description",
            },
            {
                accessorKey: "bill_timestamp",
                header: "Bill Timestamp",
            },
            {
                accessorKey: "cleared",
                header: "Cleared?",
                accessorFn: (row) => { return row.cleared ? 'Paid' : 'Not paid' }
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
        enableRowSelection: (row) => row.original.cleared == false,
        enableMultiRowSelection: true, //shows radio buttons instead of checkboxes
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
        renderTopToolbarCustomActions: ({ table }) => (
            <Button onClick={handlePaySelected}>
                Pay Selected Bills
            </Button>
        ),
    });


    const handlePaySelected = () => {
        modals.openConfirmModal({
            title: 'Please confirm your payment',
            children: (
              <Text size="sm">
                Are you sure you want to pay for the selected bills?
              </Text>
            ),
            labels: { confirm: 'Confirm', cancel: 'Cancel' },
            onCancel: () => console.log('Cancel'),
            onConfirm: () => handlePaymentConfirmed(),
          });
    }

    const handlePaymentConfirmed = async () => {
        const selectedRows = table.getSelectedRowModel().rows; 
        const bill_ids: number[] = selectedRows.map(row => row.original.bill_id);
        console.log(bill_ids)
        try {
            const response = await fetch("/api/member/billing/pay", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({bill_ids})
            });

            if (response.ok) {
                console.log("Payment submitted successfully");
                modals.closeAll();

                // Show success notification
                showNotification({
                    title: 'Success',
                    message: 'Payment successful!',
                    color: 'green',
                });

                await queryClient.invalidateQueries();
                table.toggleAllRowsSelected(false);
            } else {
                console.error("Error submitting data: ", response.statusText);
            }
        } catch (error) {
            console.error("Network error: ", error);
        }
    }


    return <MantineReactTable table={table} />;
};

//READ hook (get users from api)
function useGetMetrics() {
    const { data: session, status } = useSession();

    return useQuery<Metric[]>({
        queryKey: ["metrics"],
        queryFn: async () => {
            //send api request here
            const response = await fetch("/api/member/billing/get", {
                method: "POST",
                body: JSON.stringify({ member_username: session?.user?.username }),
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

const queryClient = new QueryClient(
    {
        defaultOptions: {
            queries: {
                refetchOnReconnect: "always",
                refetchOnWindowFocus: "always",
            },
        },
    }
);

const ExampleWithProviders = () => (
    //Put this with your other react-query providers near root of your app
    <QueryClientProvider client={queryClient}>
        <ModalsProvider>
            <Example />
        </ModalsProvider>
    </QueryClientProvider>
);
