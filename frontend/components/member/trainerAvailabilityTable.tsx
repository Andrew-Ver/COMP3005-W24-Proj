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
        Book Selected Time Slot
      </Button>
    ),
  });

  // After press the button
  const { data: session, status } = useSession();

  const handleDescriptionSubmitted = async (description: string) => {
    console.log("Submit clicked")
    const member_username = session?.user?.username;
    const selectedRow = table.getSelectedRowModel().rows[0]; //or read entire rows
    const availability_id = selectedRow.original.availability_id;
    const trainer_username = selectedRow.original.trainer_username;
    const begin_time = selectedRow.original.begin_time;
    const end_time = selectedRow.original.end_time;

    const dataToSend = {
      member_username,
      availability_id,
      description,
      trainer_username,
      begin_time,
      end_time
    };

    console.log("dataToSend: ", dataToSend);

    try {
      const response = await fetch("/api/member/personal-training/register", {
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
      } else {
        // Handle error response
        console.error("Error submitting data:", response.statusText);
      }
    } catch (error) {
      // Handle network error
      console.error("Network error:", error);
    }
  }

  function DescriptionForm() {
    const form = useForm({
      initialValues: {
        description: '',
      },
    });

    return (
      <Box mx="auto">
        <form onSubmit={form.onSubmit((values) => handleDescriptionSubmitted(values.description))}>
          <TextInput
            onChange={(event) =>
              form.setFieldValue("description", event.currentTarget.value)
            }
            label="Description"
            placeholder="Description for this personal training session (optional)"
          />
          <Group justify="flex-end" mt="md">
            <Button type="submit" fullWidth>Submit</Button>
          </Group>
        </form>
      </Box>
    );
  }


  const handleBookSelected = () => {
    modals.open({
      title: 'Add Description',
      children: (
        <DescriptionForm></DescriptionForm>
      ),
    });
  }



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
