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
} from "@mantine/core";
import { ModalsProvider, modals } from "@mantine/modals";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

import { useSession } from "next-auth/react";

type Metric = {
  availability_id: number;
  trainer_username: string;
  is_booked: boolean;
  begin_time: string;
  end_time: string;
};

export default function TrainersAvailabilityTable() {
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
        Time Slots for All Trainers
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
        accessorKey: "availability_id",
        header: "Availability ID",
      },
      {
        accessorKey: "trainer_username",
        header: "Trainer",
      },
      {
        accessorKey: "is_booked",
        header: "Is Booked",
        accessorFn: (row) => { return !row.is_booked ? 'Available' : 'Not available' }
      },
      {
        accessorKey: "begin_time",
        header: "Begin Time",
      },
      {
        accessorKey: "end_time",
        header: "End Time",
      },
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
    enableRowSelection: (row) => row.original.is_booked == false,
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
      <Button
        onClick={() => {
          const rowSelection = table.getState().rowSelection; //read state
          const selectedRows = table.getSelectedRowModel().rows; //or read entire rows
        }}
      >
        Book Selected Time Slot
      </Button>
    ),
  });

  return <MantineReactTable table={table} />;
};

//READ hook (get users from api)
function useGetMetrics() {
  
  return useQuery<Metric[]>({
    queryKey: ["metrics"],
    queryFn: async () => {
      //send api request here
      const response = await fetch("/api/member/trainer-availability/get", {
        method: "POST",
        body: JSON.stringify({ }),
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
