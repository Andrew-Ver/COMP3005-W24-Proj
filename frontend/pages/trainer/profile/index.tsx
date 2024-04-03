import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; //if using mantine date picker features
import "mantine-react-table/styles.css"; //make sure MRT styles were imported in your app root (once)
import { useMemo, useState } from "react";
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
    Container,
    Box,
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
import { UserInfoIcons } from "@/components/member/UserInfoIcons";
import { Specialty } from "@/db";
import SpecialtyTable from "@/components/trainer/specialtyTable";


export default function Profile() {
    const { data: session, status }: any = useSession();


    return (
        <Container px="1.7rem">
            <Title order={1} style={{ marginBottom: 20 }}>
                Trainer Profile
            </Title>
            <Box style={{ marginBottom: 20 }}>
                <UserInfoIcons></UserInfoIcons>
            </Box>
            <ExampleWithProviders />
            <Divider my="sm" variant="dashed" />
        </Container>
    );
}


const Example = () => {
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string | undefined>
    >({});

    const columns = useMemo<MRT_ColumnDef<Specialty>[]>(
        () => [
            {
                accessorKey: "specialty",
                header: "Specialty",
                enableEditing: true,
                size: 80,
            },
        ],
        [validationErrors]
    );

    //call CREATE hook
    const { mutateAsync: createSpecialty, isPending: isCreatingSpecialty } =
        useCreateSpecialty();
    //call READ hook
    const {
        data: fetchedSpecialties = [],
        isError: isLoadingSpecialtiesError,
        isFetching: isFetchingSpecialties,
        isLoading: isLoadingSpecialties,
    } = useGetSpecialties();
    //call UPDATE hook
    const { mutateAsync: updateSpecialty, isPending: isUpdatingSpecialty } =
        useUpdateSpecialty();
    //call DELETE hook
    const { mutateAsync: deleteSpecialty, isPending: isDeletingSpecialty } =
        useDeleteSpecialty();

    //CREATE action
    const handleCreateSpecialty: MRT_TableOptions<Specialty>["onCreatingRowSave"] =
        async ({ values, exitCreatingMode }) => {
            const newValidationErrors = validateSpecialty(values);
            if (Object.values(newValidationErrors).some((error) => error)) {
                setValidationErrors(newValidationErrors);
                return;
            }
            setValidationErrors({});
            await createSpecialty(values);
            exitCreatingMode();
        };

    //UPDATE action
    const handleSaveSpecialty: MRT_TableOptions<Specialty>["onEditingRowSave"] =
        async ({ values, exitEditingMode }) => {
            const newValidationErrors = validateSpecialty(values);
            if (Object.values(newValidationErrors).some((error) => error)) {
                setValidationErrors(newValidationErrors);
                return;
            }
            setValidationErrors({});
            await updateSpecialty(values);
            exitEditingMode();
        };


    //DELETE action
    const openDeleteConfirmModal = (row: MRT_Row<Specialty>) =>
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
            onConfirm: () => deleteSpecialty(row.original),
        });

    const table = useMantineReactTable({
        columns,
        data: fetchedSpecialties,
        createDisplayMode: "row", // ('modal', and 'custom' are also available)
        editDisplayMode: "row", // ('modal', 'cell', 'table', and 'custom' are also available)
        enableEditing: true,
        getRowId: (row) => row.specialty,
        mantineToolbarAlertBannerProps: isLoadingSpecialtiesError
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
        onCreatingRowSave: handleCreateSpecialty,
        onEditingRowCancel: () => setValidationErrors({}),
        onEditingRowSave: handleSaveSpecialty,
        renderRowActions: ({ row, table }) => (
            <Flex gap="md" justify="center">
                <Tooltip label="Edit">
                    <ActionIcon onClick={() => table.setEditingRow(row)}>
                        <IconEdit />
                    </ActionIcon>
                </Tooltip>
                {<Tooltip label="Delete">
          <ActionIcon color="red" onClick={() => openDeleteConfirmModal(row)}>
            <IconTrash />
          </ActionIcon>
        </Tooltip> }
            </Flex>
        ),
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
                {"  "}Specialty
            </Button>
        ),
        state: {
            isLoading: isLoadingSpecialties,
            isSaving: isCreatingSpecialty || isDeletingSpecialty,
            showAlertBanner: isLoadingSpecialtiesError,
            showProgressBars: isFetchingSpecialties,
        },
    });

    return <MantineReactTable table={table} />;
};

//CREATE hook (post new user to api)
function useCreateSpecialty() {
    const { data: session, status } = useSession();

    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (specialty: Specialty) => {
            //send api request here
            const response = await fetch("/api/trainer/profile/create", {
                method: "POST",
                body: JSON.stringify({
                    trainer_username: session?.user?.username,
                    specialty: specialty.specialty,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();

            return data;
        },
        //client side optimistic update
        onMutate: (specialty: Specialty) => {
            queryClient.setQueryData(["specialty"], (prevSpecialties: any) => [
                ...prevSpecialties,
                specialty,
            ]);
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ["specialty"] }), //refetch users after mutation, disabled for demo
    });
}

//READ hook (get users from api)
function useGetSpecialties() {
    const { data: session, status } = useSession();

    return useQuery<Specialty[]>({
        queryKey: ["specialty"],
        queryFn: async () => {
            //send api request here
            const response = await fetch("/api/trainer/profile/get", {
                method: "POST",
                body: JSON.stringify({ trainer_username: session?.user?.username }),
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
function useDeleteSpecialty() {
    const { data: session, status } = useSession();

    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (specialty: Specialty) => {
            //send api request here
            const response = await fetch("/api/user/profile/delete", {
                method: "POST",
                // Send timestamp and username
                body: JSON.stringify({
                    trainer_username: session?.user?.username,
                    specialty: specialty.specialty,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();

            return data;
        },
        //client side optimistic update
        onMutate: (specialty: Specialty) => {
            queryClient.setQueryData(
                ["specialty"],
                (prevSpecialties: any) =>
                    prevSpecialties?.filter(
                        (specialty_: { specialty: string; }) =>
                            specialty_.specialty !== specialty.specialty
                    )
            );
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ["specialty"] }), //refetch users after mutation, disabled for demo
    });
}

//UPDATE hook (update user in api)
function useUpdateSpecialty() {
    const { data: session, status } = useSession();

    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (specialty: Specialty) => {
            //send api request here
            const response = await fetch("/api/trainer/profile/update", {
                method: "POST",
                body: JSON.stringify({
                    trainer_username: session?.user?.username,
                    old_specialty: specialty.specialty,
                    new_specialty: specialty.specialty,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();

            return data;
        },
        //client side optimistic update
        onMutate: (specialty: Specialty) => {
            queryClient.setQueryData(
                ["specialty"],
                (prevSpecialties: any) =>
                    prevSpecialties?.map((specialty_: { specialty: string; }) =>
                        specialty_.specialty === specialty.specialty ? specialty : specialty_
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

function validateSpecialty(specialty: Specialty) {
    if (!validateRequired(specialty.specialty)) {
        return {
            specialty: "Specialty is Required",
        };
    }
    else {
        specialty.specialty = specialty.specialty.charAt(0).toUpperCase() + specialty.specialty.slice(1);
        return {};
    }
}

