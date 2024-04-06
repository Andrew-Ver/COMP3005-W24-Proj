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
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useSession } from "next-auth/react";
import { DateTimePicker } from "@mantine/dates";

type Metric = {
  id: string;
  class_id: string;
  room_id: string;
  availability_id: string;
  description: string,
  fee: string
};

interface Room {
  room_id: string;
  description: string;
};

interface Availability {
  availability_id: string;
};

interface ExampleProps {
  roomIds: string[];
  availabilityIds: string[];
}


export default function GroupSchedulingTable() {
  const { data: session, status } = useSession();
  const [roomIds, setRoomIds] = useState<string[]>([]);
  const [availabilityIds, setAvailabilityIds] = useState<string[]>([]);

  useEffect(() => {
    fetchRoomIds();
    fetchAvailabilityIds();
  }, []);

  const fetchRoomIds = async () => {
    try {
      const response = await fetch(`/api/room/get`, {
        method: 'POST', // Use POST for sending data
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // Include username in request body
      });
      const data: Room[] = await response.json();
      const ids = data.map((room: Room) => room.room_id.toString());
      setRoomIds(ids);
    } catch (error) {
      console.error("Error fetching class ids:", error);
    }
  };

  const fetchAvailabilityIds = async () => {
    try {
      const response = await fetch(`/api/group-class/get-availability`, {
        method: 'POST', // Use POST for sending data
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // Include username in request body
      });
      const data: Availability[] = await response.json();
      const ids = data.map((availability: Availability) => availability.availability_id.toString());
      setAvailabilityIds(ids);
    } catch (error) {
      console.error("Error fetching class ids:", error);
    }
  };

  return (
    <Stack gap="sm" align="center">
      <ExampleWithProviders roomIds={roomIds} availabilityIds={availabilityIds} />
      <Divider my="sm" variant="dashed" />
    </Stack>
  );
}

const Example = ({ roomIds, availabilityIds }: ExampleProps) => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const columns = useMemo<MRT_ColumnDef<Metric>[]>(
    () => [
      {
        accessorKey: "class_id",
        header: "Class ID",
        enableEditing: false
      },
      {
        accessorKey: "room_id",
        header: "Room ID",
        editVariant: 'select',
        mantineEditSelectProps: {
          data: roomIds,
          error: validationErrors?.room_id,
        },
      },
      {
        accessorKey: "availability_id",
        header: "Availability ID",
        editVariant: 'select',
        mantineEditSelectProps: {
          data: availabilityIds,
          error: validationErrors?.availability_id,
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        minSize: 300,
        mantineEditTextInputProps: {
          type: "string",
          required: true,
          error: validationErrors?.description,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              description: undefined,
            }),
        },
      },
      {
        accessorKey: "fee",
        header: "Fee",
        mantineEditTextInputProps: {
          type: "string",
          required: true,
          error: validationErrors?.fee,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              fee: undefined,
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
        {"  "}New Group Class
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
      const response = await fetch("/api/group-class/create", {
        method: "POST",
        // In body, send session?.user?.username, weight, body_fat_percentage, and blood_pressure
        body: JSON.stringify({
          availability_id: metric.availability_id,
          room_id: metric.room_id,
          description: metric.description,
          fee: metric.fee
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
      const response = await fetch("/api/group-class/getall", {
        method: "POST",
        body: JSON.stringify({}),
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
      const response = await fetch("/api/group-class/update", {
        method: "POST",
        body: JSON.stringify({
          class_id: metric.class_id,
          availability_id: metric.availability_id,
          room_id: metric.room_id,
          description: metric.description,
          fee: metric.fee
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
        prevMetrics?.filter(
          (metric: Metric) => metric.id !== id
        )
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["metrics"] }), //refetch users after mutation, disabled for demo
  });
}

const queryClient = new QueryClient();

const ExampleWithProviders = ({ roomIds, availabilityIds }: ExampleProps) => (
  //Put this with your other react-query providers near root of your app
  <QueryClientProvider client={queryClient}>
    <ModalsProvider>
      <Example roomIds={roomIds} availabilityIds={availabilityIds} />
    </ModalsProvider>
  </QueryClientProvider>
);

const validateRequired = (value: string) => !!value.length;

function validateMetric(metric: Metric) {
  return {
    room_id: !validateRequired(metric.room_id) ? "Room ID is Required" : "",
    availability_id: !validateRequired(metric.availability_id)
      ? "End time is Required"
      : "",
    description: !validateRequired(metric.description)
      ? "End time is Required"
      : "",
    fee: !validateRequired(metric.fee)
      ? "Fee is Required"
      : "",
  };
}
