import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; //if using mantine date picker features
import "mantine-react-table/styles.css"; //make sure MRT styles were imported in your app root (once)
import { useEffect, useMemo, useState } from "react";
import {
    MantineReactTable,
    type MRT_ColumnDef, type MRT_TableOptions,
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
    QueryClientProvider, useMutation,
    useQuery, useQueryClient,
} from "@tanstack/react-query";

import { useSession } from "next-auth/react";
import { Form, useForm } from "@mantine/form";
import {useForceUpdate} from "@mantine/hooks";
import {showNotification} from "@mantine/notifications";
import {CirclePlus} from "tabler-icons-react";

type Metric = {
    member_username: string;
    goal_type: string;
    achieved: boolean;
};

export default function GoalsTable() {
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
                Current Goals
            </Title>
            <ExampleWithProviders />
            <Divider my="sm" variant="dashed" />
        </Stack>
    );
}


const Example = () => {
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string | undefined>
    >({});

    const columns = useMemo<MRT_ColumnDef<Metric>[]>(
        () => [
            {
                accessorKey: "goal_type",
                header: "Goal",
            },
        ],
        []
    );

    const { mutateAsync: createEquipment, isPending: isCreatingEquipment } =
        useCreateEquipment();
    //call READ hook
    const {
        data: fetchedMetrics = [],
        isError: isLoadingMetricsError,
        isFetching: isFetchingMetrics,
        isLoading: isLoadingMetrics,
    } = useGetMetrics();


    const handleCreateEquipment: MRT_TableOptions<Metric>["onCreatingRowSave"] =
        async ({ values, exitCreatingMode }) => {
            const newValidationErrors = validateMetric(values);
            if (Object.values(newValidationErrors).some((error) => error)) {
                setValidationErrors(newValidationErrors);
                return;
            }
            setValidationErrors({});
            await createEquipment(values);
            exitCreatingMode();
        };

    const table = useMantineReactTable({
        columns,
        data: fetchedMetrics,
        createDisplayMode: "row", // ('modal', and 'custom' are also available)
        enableRowActions: false,
        enableRowSelection: true,
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
        onCreatingRowCancel: () => setValidationErrors({}),
        onCreatingRowSave: handleCreateEquipment,
        renderTopToolbarCustomActions: ({ table }) => {
            // Check if any rows are selected
            const isRowSelected = table.getSelectedRowModel().rows.length > 0;

            return (

                <><Button
                    onClick={() => {
                        table.toggleAllRowsSelected(false);
                        table.setCreatingRow(true);
                    }}
                >
                    <CirclePlus/>
                    {"  "}New Goal
                </Button><Button
                    onClick={handleCompletionConfirmed}
                    // Disable the button if no rows are selected
                    disabled={!isRowSelected}
                >
                    Mark as achieved
                </Button></>
            );
        },
    });


    const handleCompletionConfirmed = async () => {
        const selectedRows = table.getSelectedRowModel().rows;
        const goal_types: string[] = selectedRows.map(row => row.original.goal_type);
        try {
            const response = await fetch("/api/member/goals/complete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({member_username: session?.user?.username, goal_types})
            });

            if (response.ok) {
                modals.closeAll();

                // Show success notification
                showNotification({
                    title: 'Success',
                    message: 'Goals marked as achieved!',
                    color: 'green',
                });

                table.toggleAllRowsSelected(false);
                await queryClient.invalidateQueries();
            } else {
                console.error("Error submitting data: ", response.statusText);
            }
        } catch (error) {
            console.error("Network error: ", error);
        }
    }

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
            const response = await fetch("/api/member/goals/getOngoing", {
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

const validateRequired = (value: string) => !!value.length;
function validateMetric(goal: Metric) {
    return {
        description: !validateRequired(goal.goal_type)
            ? "Description is Required"
            : "",
    };
}

function useCreateEquipment() {
    const { data: session, status } = useSession();

    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (metric: Metric) => {
            // Set time to current time.
            //   metric.metric_timestamp = new Date().toISOString();
            //send api request here
            const response = await fetch("/api/member/goals/create", {
                method: "POST",
                // In body, send session?.user?.username, weight, body_fat_percentage, and blood_pressure
                body: JSON.stringify({
                    member_username: session?.user?.username,
                    goal_type: metric.goal_type,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();

            return data;
        },
        //client side optimistic update
        onMutate: (newMetricInfo: Metric) => {
            queryClient.setQueryData(
                ["metrics"],
                (prevMetrics: any) =>
                    [
                    ] as Metric[]
            );
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ["metrics"] }), //refetch users after mutation, disabled for demo
    });
}

const ExampleWithProviders = () => (
    //Put this with your other react-query providers near root of your app
    <QueryClientProvider client={queryClient}>
        <ModalsProvider>
            <Example />
        </ModalsProvider>
    </QueryClientProvider>
);
