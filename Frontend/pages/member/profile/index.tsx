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
  Divider,
  Tabs,
  Center,
  Box,
  NumberInput,
  Flex,
  TextInput,
  Select,
} from "@mantine/core";
import { ModalsProvider, modals } from "@mantine/modals";
import { CirclePlus } from "tabler-icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useSession } from "next-auth/react";
import { UserInfoIcons } from "@/components/member/UserInfoIcons";
import GoalsTable from "@/components/member/goals";
import { notifications } from "@mantine/notifications";
import { useForm } from "@mantine/form";

type Metric = {
  id: string;
  metric_timestamp: string;
  weight: string;
  body_fat_percentage: string;
  blood_pressure: string;
};

function MemberProfile() {
  const { data: session } = useSession();

  async function handleFormSubmit(values: { rate: number }) {
    /*
      Make a post request to /api/trainer/profile/set with the form values
    */
    const result = await fetch("/api/member/profile/set", {
      method: "POST",
      body: JSON.stringify({
        username: session?.user?.username,
        ...values,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (result.ok) {
      // Show a success notification
      notifications.show({
        title: "Profile Updated",
        message: `Your profile has been updated successfully.`,
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
      gender: "",
      name: session?.user?.name,
      age: 18,
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
            <Flex direction="row" gap="md">
              <NumberInput
                label="Age"
                value={form.values.age}
                withAsterisk
                placeholder="20"
                onChange={(event) => {
                  form.setFieldValue("age", event as number);
                }}
                min={18}
                max={100}
              />
              <Select
                label="Gender"
                placeholder="Select Gender"
                required
                data={["male", "female", "other"]}
                onChange={(event) => {
                  form.setFieldValue("gender", event as string);
                }}
              />
            </Flex>
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
          <Tabs.Tab value="stats" miw={300}>
            Stats
          </Tabs.Tab>
          <Tabs.Tab value="goals" miw={300}>
            Goals
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="profile" my="15px">
          <Title order={3} c="rgb(73, 105, 137)" ta="center">
            Change Profile Info
          </Title>
          <MemberProfile />
        </Tabs.Panel>

        <Tabs.Panel value="stats" my="15px">
          <Title order={3} c="rgb(73, 105, 137)" ta="center">
            Member Stats
          </Title>
          <Stack gap="md" my="auto">
            <Flex gap="md" justify="center">
              <UserInfoIcons />
            </Flex>
            <Example />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="goals" my="15px">
          <Title order={3} c="rgb(73, 105, 137)" ta="center">
            Goals
          </Title>

          <Stack gap="md" my="auto">
            <Flex gap="md" justify="center">
              <UserInfoIcons />
            </Flex>
            <GoalsTable />
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Center>
  );
}

const Example = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const columns = useMemo<MRT_ColumnDef<Metric>[]>(
    () => [
      {
        accessorKey: "metric_timestamp",
        header: "Time",
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: "weight",
        header: "Weight",
        mantineEditTextInputProps: {
          type: "number",
          required: true,
          error: validationErrors?.weight,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              weight: undefined,
            }),
          //optionally add validation checking for onBlur or onChange
        },
      },
      {
        accessorKey: "body_fat_percentage",
        header: "Bodyfat (%)",
        mantineEditTextInputProps: {
          type: "number",
          required: true,
          error: validationErrors?.body_fat_percentage,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              bodyfat: undefined,
            }),
        },
      },
      {
        accessorKey: "blood_pressure",
        header: "Blood Pressure",
        mantineEditTextInputProps: {
          type: "text",
          required: true,
          error: validationErrors?.blood_pressure,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              bloodPressure: undefined,
            }),
        },
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
    async ({ values, table }) => {
      const newValidationErrors = validateMetric(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await updateMetric(values);
      table.setEditingRow(null); //exit editing mode
    };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<Metric>) =>
    modals.openConfirmModal({
      title: "Confirm Metric Deletion?",
      children: (
        <Text>
          Are you sure you want to delete this record? This action cannot be
          undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteMetric(row.original.metric_timestamp),
    });

  const table = useMantineReactTable({
    columns,
    data: fetchedMetrics,
    createDisplayMode: "row", // ('modal', and 'custom' are also available)
    editDisplayMode: "row", // ('modal', 'cell', 'table', and 'custom' are also available)
    enableRowActions: false,
    getRowId: (row) => row.metric_timestamp,
    mantineToolbarAlertBannerProps: isLoadingMetricsError
      ? {
          color: "red",
          children: "Error loading data",
        }
      : undefined,
    mantineTableContainerProps: {
      style: {
        minHeight: "400px",
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateMetric,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveMetric,
    /* renderRowActions: ({ row, table }) => (
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
    ),*/
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
        {"  "}Metric
      </Button>
    ),
    state: {
      isLoading: isLoadingMetrics,
      isSaving: isCreatingMetric || isUpdatingMetric || isDeletingMetric,
      showAlertBanner: isLoadingMetricsError,
      showProgressBars: isFetchingMetrics,
    },
  });

  return <MantineReactTable table={table} />;
};

//CREATE hook (post new user to api)
function useCreateMetric() {
  const { data: session } = useSession();

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (metric: Metric) => {
      // Set time to current time.
      metric.metric_timestamp = new Date().toISOString();
      //send api request here
      const response = await fetch("/api/user/metrics/create", {
        method: "POST",
        // In body, send session?.user?.username, weight, body_fat_percentage, and blood_pressure
        body: JSON.stringify({
          username: session?.user?.username,
          weight: metric.weight,
          body_fat_percentage: metric.body_fat_percentage,
          blood_pressure: metric.blood_pressure,
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
            ...prevMetrics,
            {
              ...newMetricInfo,
              time: new Date().toISOString(),
              id: (Math.random() + 1).toString(36).substring(7),
            },
          ] as Metric[]
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["metrics"] }), //refetch users after mutation, disabled for demo
  });
}

//READ hook (get users from api)
function useGetMetrics() {
  const { data: session } = useSession();

  return useQuery<Metric[]>({
    queryKey: ["metrics"],
    queryFn: async () => {
      //send api request here
      const response = await fetch("/api/user/metrics/get", {
        method: "POST",
        body: JSON.stringify({ username: session?.user?.username }),
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

//UPDATE hook (put user in api)
function useUpdateMetric() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (metric: Metric) => {
      console.log(metric);
      //send api update request here
      await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
      return Promise.resolve();
    },
    //client side optimistic update
    // onMutate: (newUserInfo: Metric) => {
    //   queryClient.setQueryData(["metrics"], (prevUsers: any) =>
    //     prevUsers?.map((prevUser: Metric) =>
    //       prevUser.id === newUserInfo.id ? newUserInfo : prevUser
    //     )
    //   );
    // },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["metrics"] }), //refetch users after mutation, disabled for demo
  });
}

//DELETE hook (delete user in api)
function useDeleteMetric() {
  const { data: session } = useSession();

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (metricID: string) => {
      //send api request here
      const response = await fetch("/api/user/metrics/delete", {
        method: "POST",
        // Send timestamp and username
        body: JSON.stringify({
          metric_timestamp: metricID,
          username: session?.user?.username,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      return data;
    },
    //client side optimistic update
    onMutate: (metric_timestamp: string) => {
      queryClient.setQueryData(["metrics"], (prevMetrics: any) =>
        prevMetrics?.filter(
          (metric: Metric) => metric.metric_timestamp !== metric_timestamp
        )
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["metrics"] }), //refetch users after mutation, disabled for demo
  });
}

const ExampleWithProviders = () => {
  const { data: session } = useSession();

  return (
    <Stack gap="sm" align="center">
      <Title order={2} c="rgb(73, 105, 137)">
        Health Metrics for {session?.user?.name}
      </Title>
      <ModalsProvider>
        <Example />
      </ModalsProvider>
      <Divider my="sm" variant="dashed" />
    </Stack>
  );
};

const validateRequired = (value: string) => !!value.length;

function validateMetric(metric: Metric) {
  return {
    metric_timestamp: "",
    weight: !validateRequired(metric.weight) ? "Weight is Required" : "",
    body_fat_percentage: !validateRequired(metric.body_fat_percentage)
      ? "Bodyfat is Required"
      : "",
    blood_pressure: !validateRequired(metric.blood_pressure)
      ? "Blood Pressure reading is required in format: 120/80"
      : "",
  };
}
