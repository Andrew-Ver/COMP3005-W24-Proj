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
  Text,
} from "@mantine/core";
import { ModalsProvider, modals } from "@mantine/modals";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { showNotification } from "@mantine/notifications";

import { useSession } from "next-auth/react";
import { Form, useForm } from "@mantine/form";

type Metric = {
  class_id: number;
  begin_time: string;
  end_time: string;
  room_id: number;
  description: string;
  fee: number;
  completed: boolean;
  signed_up: boolean;
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
          accessorKey: "begin_time",
          header: "Begin Time",
      },
      {
          accessorKey: "end_time",
          header: "End Time",
      },
      {
        accessorKey: "room_id",
        header: "Room",
      },
      {
        accessorKey: "description",
        header: "Description",
      },
      {
        accessorKey: "fee",
        header: "Fee",
      }, {
        accessorKey: "signed_up",
        header: "Registration status",
        accessorFn: (row) => {
          return row.signed_up ? "Signed Up" : "Not Signed Up";
        },
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
    enableRowSelection: (row) => row.original.signed_up == false,
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
    renderTopToolbarCustomActions: ({ table }) =>
      table.getSelectedRowModel().rows[0] ? (
        <Button onClick={handleBookSelected}>Book Selected Group Class</Button>
      ) : (
        <Button disabled onClick={handleBookSelected}>
          Book Selected Group Class
        </Button>
      ),
  });

  // After press the button
  const { data: session, status } = useSession();

  const handleBookSelected = async () => {
    const member_username = session?.user?.username;
    const selectedRow = table.getSelectedRowModel().rows[0]; //or read entire rows
    const class_id = selectedRow.original.class_id;
    const fee = selectedRow.original.fee;
    const description = selectedRow.original.description;

    const dataToSend = {
      member_username,
      class_id,
      fee,
      description,
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
        modals.closeAll();

        // Show success notification
        showNotification({
          title: 'Success',
          message: 'Booking successful!',
          color: 'green',
        });
        await queryClient.invalidateQueries();
        table.toggleAllRowsSelected(false);
      } else {
        // Handle error response
        console.error("Error submitting data:", response.statusText);
        // Show success notification
        showNotification({
          title: 'Error',
          message: 'You have already booked this group class',
          color: 'red',
        });
      }
    } catch (error) {
      // Handle network error
      console.error("Network error:", error);
    }
  };

  return <MantineReactTable table={table} />;
};

//READ hook (get users from api)
function useGetMetrics() {
  const { data: session, status } = useSession();
  const member_username = session?.user?.username;
  return useQuery<Metric[]>({
    queryKey: ["metrics"],
    queryFn: async () => {
      //send api request here
      const response = await fetch("/api/group-class/get", {
        method: "POST",
        body: JSON.stringify({member_username}),
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
