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
  Button,
  Text,
  Stack,
  Title,
  Box,
  Flex,
  Tabs,
  Center,
  NumberInput,
  TextInput,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { CirclePlus } from "tabler-icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@mantine/form";

import { useSession } from "next-auth/react";
import { UserInfoIcons } from "@/components/trainer/UserInfoIcons";
import { Specialty } from "@/db";
import { notifications } from "@mantine/notifications";

function TrainerProfile() {
  const { data: session } = useSession();

  async function handleFormSubmit(values: { rate: number }) {
    /*
      Make a post request to /api/trainer/profile/set with the form values
    */
    const result = await fetch("/api/trainer/profile/set", {
      method: "POST",
      body: JSON.stringify({
        username: session?.user?.username,
        rate: values.rate,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (result.ok) {
      // Show a success notification
      notifications.show({
        title: "Profile Updated",
        message: `Trainer rate changed to: $${values.rate} per hour.`,
        color: "green",
      });
    } else {
      // Show an error notification
      notifications.show({
        title: "Error Updating Profile",
        message: "An error occurred while updating the profile.",
        color: "red",
      });
    }
  }

  const form = useForm({
    initialValues: {
      rate: 20,
      name: session?.user?.name,
    },
  });
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const handleButtonClick = async () => {
    setIsButtonDisabled(true);
    await handleFormSubmit(form.values);
    form.reset();
    setTimeout(() => {
      setIsButtonDisabled(false);
    }, 1500);
  };

  return (
    <Box maw={250} mx="auto" my="auto">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleButtonClick();
        }}
      >
        <Stack gap="md" my="auto">
          <Flex gap="md" justify="center">
            <UserInfoIcons />
          </Flex>
          <Stack gap="md">
            <Text>Name</Text>
            <TextInput disabled {...form.getInputProps("name")} />
            <NumberInput
              {...form.getInputProps("rate")}
              variant="default"
              label="Training Rates"
              description="Hourly Training Rate $/hr (1-100)"
              placeholder="20"
              min={1}
              max={100}
            />
          </Stack>
          <Button
            type="submit"
            onClick={handleButtonClick}
            disabled={isButtonDisabled}
          >
            Save
          </Button>
        </Stack>
      </form>
    </Box>
  );
}

export default function Profile() {
  return (
    <Center>
      <Tabs defaultValue="profile" my="auto">
        <Tabs.List>
          <Tabs.Tab value="profile" miw={300}>
            Profile
          </Tabs.Tab>
          <Tabs.Tab value="specialties" miw={300}>
            Specialty
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="profile" my="15px">
          <Title order={3} c="rgb(73, 105, 137)" ta="center">
            Change Profile Info
          </Title>
          <TrainerProfile />
        </Tabs.Panel>

        <Tabs.Panel value="specialties" my="15px">
          <Title order={3} c="rgb(73, 105, 137)" ta="center">
            Update Trainer Specialties
          </Title>
          <Example />
        </Tabs.Panel>
      </Tabs>
    </Center>
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
        mantineEditTextInputProps: {
          type: "text",
          required: true,
          error: validationErrors?.specialty,
        },
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
    initialState: {
      columnVisibility: { Actions: false },
    },

    enableColumnActions: false,
    enableRowActions: false,
    createDisplayMode: "row", // ('modal', and 'custom' are also available)
    editDisplayMode: "row", // ('modal', 'cell', 'table', and 'custom' are also available)
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
        striped: "even",
        minWidth: "500px",
      },
    },
    mantineTableHeadRowProps: {
      style: { display: "flex", justifyContent: "center" },
    },

    mantineTableHeadCellProps: {
      style: { display: "flex", justifyContent: "center" },
    },

    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateSpecialty,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveSpecialty,
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        onClick={() => {
          table.setCreatingRow(true);
        }}
      >
        <CirclePlus />
        {"  "}Specialty
      </Button>
    ),
    state: {
      isLoading: isLoadingSpecialties,
      isSaving:
        isCreatingSpecialty || isUpdatingSpecialty || isDeletingSpecialty,
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
    onMutate: (newSpecialty: Specialty) => {},
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
      queryClient.setQueryData(["specialty"], (prevSpecialties: any) =>
        prevSpecialties?.filter(
          (specialty_: { specialty: string }) =>
            specialty_.specialty !== specialty.specialty
        )
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["specialty"] }), //refetch users after mutation, disabled for demo
  });
}

//UPDATE hook (update user in api)
function useUpdateSpecialty() {
  const { data: session } = useSession();

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
      queryClient.setQueryData(["specialty"], (prevSpecialties: any) =>
        prevSpecialties?.map((specialty_: { specialty: string }) =>
          specialty_.specialty === specialty.specialty ? specialty : specialty_
        )
      );
    },
  });
}

const validateRequired = (value: string) => {
  return value.length >= 5 && value.length <= 25;
};

function validateSpecialty(specialty: Specialty) {
  return {
    specialty: !validateRequired(specialty.specialty)
      ? "Speciality must be 5-25 characters"
      : "",
  };
}
