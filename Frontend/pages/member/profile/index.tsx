import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; //if using mantine date picker features
import "mantine-react-table/styles.css"; //make sure MRT styles were imported in your app root (once)
import { useMemo, useState, useEffect } from "react";
import {
  MantineReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
} from "mantine-react-table";
import { Button, Text, Stack, Title, Tabs, Center, Flex } from "@mantine/core";
import { CirclePlus } from "tabler-icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useSession } from "next-auth/react";
import { UserInfoIcons } from "@/components/member/UserInfoIcons";
import GoalsTable from "@/components/member/goals";
import MemberProfile from "@/components/member/memberProfile";

type Metric = {
  id: string;
  metric_timestamp: string;
  weight: string;
  body_fat_percentage: string;
  blood_pressure: string;
};

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
            <MetricTable />
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

function MetricTable() {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const queryClient = useQueryClient();

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
    refetch: refetchMetrics,
  } = useGetMetrics();

  const { isLoading, error, data } = useGetMetrics();

  useEffect(() => {
    if (!isLoading && !error && data) {
      refetchMetrics();
    }
  }, [isLoading, error, data, refetchMetrics]);

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
      refetchMetrics();
    };

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
        minHeight: "500px",
        minWidth: "800px",
      },
    },
    state: {
      isLoading: isLoadingMetrics,
      showAlertBanner: isLoadingMetricsError,
      showProgressBars: isFetchingMetrics,
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateMetric,
    onEditingRowCancel: () => setValidationErrors({}),

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
  });

  return <MantineReactTable table={table} />;
}

//CREATE hook (post new metric to api)
function useCreateMetric() {
  const { data: session } = useSession();

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (metric: Metric) => {
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

    onMutate: (newMetricInfo: Metric) => {
      queryClient.setQueryData(
        ["metrics"],
        (prevMetrics: any) => [] as Metric[]
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
