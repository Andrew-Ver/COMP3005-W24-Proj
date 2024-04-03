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

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

import { useSession } from "next-auth/react";
import { Form, useForm } from "@mantine/form";

type Metric = {
  class_id: number;
  availability_id: number;
  room_id: number;
  description: string;
  fee: number;
  completed: boolean;
};

export default function GroupClassTable() {
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
      <ExampleWithProviders />
      <Divider my="sm" variant="dashed" />
    </Stack>
  );
}


const Example = () => {

  const columns = useMemo<MRT_ColumnDef<Metric>[]>(
    () => [
      {
        accessorKey: "class_id",
        header: "Class ID",
      },
      {
        accessorKey: "availability_id",
        header: "Availability ID",
      },
      {
        accessorKey: "room_id",
        header: "Room ID",
      },
      {
        accessorKey: "description",
        header: "Description",
      },
      {
        accessorKey: "fee",
        header: "Fee",
      },
      {
        accessorKey: "completed",
        header: "Is Completed?",
        accessorFn: (row) => { return row.completed ? 'Completed' : 'Not Completed' }
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
    enableRowSelection: (row) => row.original.completed == false,
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
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        onClick={handleBookSelected}
      >
        Book Selected Group Class
      </Button>
    ),
  });

  // After press the button
  const { data: session, status } = useSession();

  const handleBookSelected = async () => {
    console.log("Submit clicked")
    const member_username = session?.user?.username;
    const selectedRow = table.getSelectedRowModel().rows[0]; //or read entire rows
    const class_id = selectedRow.original.class_id;
    const availability_id = selectedRow.original.availability_id;
    const fee = selectedRow.original.fee;
    const description = selectedRow.original.description;

    const dataToSend = {
      member_username,
      class_id,
      availability_id,
      fee,
      description
    };

    console.log("dataToSend: ", dataToSend);

    try {
      const response = await fetch("/api/member/group-class/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        // Handle successful response
        console.log("Data submitted successfully:", dataToSend);
        modals.open({
          title: 'Booking Confirmed',
          children: (
            <>
            <Text>Your booking for group class is successful!</Text>
            <Button fullWidth onClick={() => modals.closeAll()} mt="md">
              Confirm
            </Button>
          </>
          ),
        });
      } else {
        // Handle error response
        console.error("Error submitting data:", response.statusText);
      }
    } catch (error) {
      // Handle network error
      console.error("Network error:", error);
    }
  }




  return <MantineReactTable table={table} />;
};

//READ hook (get users from api)
function useGetMetrics() {

  return useQuery<Metric[]>({
    queryKey: ["metrics"],
    queryFn: async () => {
      //send api request here
      const response = await fetch("/api/group-class/get", {
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

const queryClient = new QueryClient();

const ExampleWithProviders = () => (
  //Put this with your other react-query providers near root of your app
  <QueryClientProvider client={queryClient}>
    <ModalsProvider>
      <Example />
    </ModalsProvider>
  </QueryClientProvider>
);
