import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; //if using mantine date picker features
import "mantine-react-table/styles.css"; //make sure MRT styles were imported in your app root (once)
import { useEffect, useMemo, useState } from "react";
import {
    MantineReactTable,
    type MRT_ColumnDef,
    type MRT_Row,
    type MRT_TableOptions,
    useMantineReactTable,
} from "mantine-react-table";
import {
    ActionIcon,
    Button,
    Flex,
    Text,
    Tooltip,
    Stack,
    Title,
    Divider,
    Grid,
} from "@mantine/core";
import { ModalsProvider, modals } from "@mantine/modals";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { CirclePlus } from "tabler-icons-react";
import {
    QueryClient,
    QueryClientProvider,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { useSession } from "next-auth/react";

type Metric = {
    id: string,
    username: string,
    description: string
};

export default function ExerciseRoutineTable() {
    const { data: session, status } = useSession();

    return (
        <Stack gap="sm" align="center">
            <Title order={1} c="rgb(73, 105, 137)" ta="center">
                Exercise Routines for {session?.user?.name}
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
                accessorKey: "description",
                header: "Description",
                enableEditing: true,
                minSize: 800,
            },
        ],
        [validationErrors]
    );

    //call CREATE hook
    const { mutateAsync: createMetric, isPending: isCreatingMetric } =
        useCreateMetric();
    //call READ hook
    const {
        data: fetchedMetrics = [],
        isError: isLoadingMetricsError,
        isFetching: isFetchingMetrics,
        isLoading: isLoadingMetrics,
    } = useGetMetrics();
    //call UPDATE hook
    const { mutateAsync: updateMetric, isPending: isUpdatingMetric } =
        useUpdateMetric();
    //call DELETE hook
    const { mutateAsync: deleteMetric, isPending: isDeletingMetric } =
        useDeleteMetric();

    //CREATE action
    const handleCreateMetric: MRT_TableOptions<Metric>["onCreatingRowSave"] =
        async ({ values, exitCreatingMode }) => {
            const newValidationErrors = validateMetric(values);
            if (Object.values(newValidationErrors).some((error) => error)) {
                setValidationErrors(newValidationErrors);
                return;
            }
            setValidationErrors({});
            await createMetric(values);
            exitCreatingMode();
        };

    //UPDATE action
    const handleSaveMetric: MRT_TableOptions<Metric>["onEditingRowSave"] =
        async ({ values, exitEditingMode }) => {
            const newValidationErrors = validateMetric(values);
            if (Object.values(newValidationErrors).some((error) => error)) {
                setValidationErrors(newValidationErrors);
                return;
            }
            setValidationErrors({});
            await updateMetric(values);
            exitEditingMode();
        };


    //DELETE action
    const openDeleteConfirmModal = (row: MRT_Row<Metric>) =>
        modals.openConfirmModal({
            title: "Confirm Deletion?",
            children: (
                <Text>
                    Are you sure you want to delete this record? This action cannot be
                    undone.
                </Text>
            ),
            labels: { confirm: "Delete", cancel: "Cancel" },
            confirmProps: { color: "red" },
            onConfirm: () => deleteMetric(row.original),
        });

    const table = useMantineReactTable({
        columns,
        data: fetchedMetrics,
        initialState: {
            columnVisibility: { Actions: false }
        },
        enableColumnActions: false,
        enableRowActions: false,
        createDisplayMode: "row", // ('modal', and 'custom' are also available)
        editDisplayMode: "row", // ('modal', 'cell', 'table', and 'custom' are also available)
        getRowId: (row) => row.description,
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
        onCreatingRowCancel: () => setValidationErrors({}),
        onCreatingRowSave: handleCreateMetric,
        onEditingRowCancel: () => setValidationErrors({}),
        onEditingRowSave: handleSaveMetric,
        renderTopToolbarCustomActions: ({ table }) => (
            <Button
                onClick={() => {
                    table.setCreatingRow(true); //simplest way to open the create row modal with no default values
                    //or you can pass in a row object to set default values with the `createRow` helper function
                    // table.setCreatingRow(
                    //   createRow(table, {
                    //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
                    //   }),
                    // );
                }}
            >
                <CirclePlus />
                {"  "}Exercise Routine
            </Button>
        ),
        state: {
            isLoading: isLoadingMetrics,
            isSaving: isCreatingMetric || isUpdatingMetric|| isDeletingMetric,
            showAlertBanner: isLoadingMetricsError,
            showProgressBars: isFetchingMetrics,
        },
    });

    return <MantineReactTable table={table} />;
};

//CREATE hook (post new user to api)
function useCreateMetric() {
    const { data: session, status } = useSession();

    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (metric: Metric) => {
            //send api request here
            const response = await fetch("/api/member/exercise-routine/create", {
                method: "POST",
                body: JSON.stringify({
                    member_username: session?.user?.username,
                    description: metric.description,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();

            return data;
        },
        //client side optimistic update
        onMutate: (newMetric: Metric) => {},
        onSettled: () => queryClient.invalidateQueries({ queryKey: ["metric"] }), //refetch users after mutation, disabled for demo
    });
}

//READ hook (get users from api)
function useGetMetrics() {
    const { data: session, status } = useSession();
    const member_username = session?.user?.username;

    return useQuery<Metric[]>({
        queryKey: ["metric"],
        queryFn: async () => {
            //send api request here
            const response = await fetch("/api/member/exercise-routine/get", {
                method: "POST",
                body: JSON.stringify({ member_username: member_username }),
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

//DELETE hook (delete user in api)
function useDeleteMetric() {
    const { data: session, status } = useSession();

    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (metric: Metric) => {
            //send api request here
            const response = await fetch("/api/member/exercise-routine/delete", {
                method: "POST",
                // Send timestamp and username
                body: JSON.stringify({
                    member_username: session?.user?.username,
                    description: metric.description,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();

            return data;
        },
        //client side optimistic update
        onMutate: (metric: Metric) => {
            queryClient.setQueryData(
                ["metric"],
                (prevMetrics: any) =>
                    prevMetrics?.filter(
                        (metric_: { description: string; }) =>
                            metric_.description !== metric.description
                    )
            );
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ["metric"] }), //refetch users after mutation, disabled for demo
    });
}

//UPDATE hook (update user in api)
function useUpdateMetric() {
    const { data: session, status } = useSession();

    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (metric: Metric) => {
            //send api request here
            const response = await fetch("/api/member/exercise-routine/update", {
                method: "POST",
                body: JSON.stringify({
                    member_username: session?.user?.username,
                    old_description: metric.description,
                    new_description: metric.description,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();

            return data;
        },
        //client side optimistic update
        onMutate: (metric: Metric) => {
            queryClient.setQueryData(
                ["metric"],
                (prevMetrics: any) =>
                    prevMetrics?.map((metric_: { description: string; }) =>
                        metric_.description === metric.description ? metric : metric_
                    )
            );
        }
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

const validateRequired = (value: string) => !!value.length;

function validateMetric(metric: Metric) {
    return {
        begin_time: !validateRequired(metric.description) ? "Description is Required" : ""
    };
}
