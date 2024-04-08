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
} from "@mantine/core";
import { ModalsProvider, modals } from "@mantine/modals";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { CirclePlus } from "tabler-icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useSession } from "next-auth/react";
import { DateTimePicker } from "@mantine/dates";

type Metric = {
  id: string;
  availability_id: string;
  username: string;
  begin_time: string;
  end_time: string;
};

export default function SchedulingTable() {
  const { data: session, status } = useSession();

  return (
    <Stack gap="sm" align="center">
      <Title order={1} c="rgb(73, 105, 137)" ta="center">
        Available Time Slots for {session?.user?.name}
      </Title>
      <Example />
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
        accessorKey: "availability_id",
        header: "Availability ID",
        enableEditing: false,
      },
      {
        accessorKey: "begin_time",
        header: "Begin Time",
        minSize: 300,
        mantineEditTextInputProps: {
          type: "string",
          required: true,
          placeholder: "YYYY-MM-DD HH:MM:SS",
          error: validationErrors?.end_time,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              end_time: undefined,
            }),
        },
      },
      {
        accessorKey: "end_time",
        header: "End Time",
        minSize: 300,
        mantineEditTextInputProps: {
          type: "string",
          required: true,
          placeholder: "YYYY-MM-DD HH:MM:SS",
          error: validationErrors?.end_time,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              end_time: undefined,
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
      onConfirm: () => deleteMetric(row.original.id),
    });

  const table = useMantineReactTable({
    columns,
    data: fetchedMetrics,
    createDisplayMode: "row", // ('modal', and 'custom' are also available)
    editDisplayMode: "row", // ('modal', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    getRowId: (row) => row.id,
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
    mantineTableHeadRowProps: {
      style: { justifyContent: "center" },
    },

    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateMetric,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveMetric,
    renderRowActions: ({ row, table }) => (
      <Flex gap="md" justify="center">
        <Tooltip label="Edit">
          <ActionIcon onClick={() => table.setEditingRow(row)}>
            <IconEdit />
          </ActionIcon>
        </Tooltip>
        {/* <Tooltip label="Delete">
          <ActionIcon color="red" onClick={() => openDeleteConfirmModal(row)}>
            <IconTrash />
          </ActionIcon>
        </Tooltip> */}
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
        {"  "}Time Slot
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
  const { data: session, status } = useSession();

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (metric: Metric) => {
      // Set time to current time.
      //   metric.metric_timestamp = new Date().toISOString();
      //send api request here
      const response = await fetch("/api/trainer/availability/create", {
        method: "POST",
        // In body, send session?.user?.username, weight, body_fat_percentage, and blood_pressure
        body: JSON.stringify({
          username: session?.user?.username,
          begin_time: metric.begin_time,
          end_time: metric.end_time,
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

  return useQuery<Metric[]>({
    queryKey: ["metrics"],
    queryFn: async () => {
      //send api request here
      const response = await fetch("/api/trainer/availability/get", {
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
      //send api update request here
      const response = await fetch("/api/trainer/availability/update", {
        method: "POST",
        body: JSON.stringify({
          availability_id: metric.availability_id,
          begin_time: metric.begin_time,
          end_time: metric.end_time,
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
              id: (Math.random() + 1).toString(36).substring(7),
            },
          ] as Metric[]
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["metrics"] }), //refetch users after mutation, disabled for demo
  });
}

//DELETE hook (delete user in api)
function useDeleteMetric() {
  const { data: session, status } = useSession();

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
    onMutate: (id: string) => {
      queryClient.setQueryData(["metrics"], (prevMetrics: any) =>
        prevMetrics?.filter((metric: Metric) => metric.id !== id)
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["metrics"] }), //refetch users after mutation, disabled for demo
  });
}

const validateRequired = (value: string) => !!value.length;

function validateMetric(metric: Metric) {
  return {
    begin_time: !validateRequired(metric.begin_time)
      ? "Begin time is Required"
      : "",
    end_time: !validateRequired(metric.end_time) ? "End time is Required" : "",
  };
}
