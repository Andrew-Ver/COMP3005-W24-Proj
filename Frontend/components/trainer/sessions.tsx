import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; //if using mantine date picker features
import "mantine-react-table/styles.css"; //make sure MRT styles were imported in your app root (once)
import { useMemo } from "react";
import {
  MantineReactTable,
  type MRT_ColumnDef,
  useMantineReactTable,
} from "mantine-react-table";
import { Stack, Title, Divider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

import { useSession } from "next-auth/react";

type Session = {
  session_id: number;
  name: string;
  begin_time: string;
  end_time: string;
  description: string;
  is_completed: boolean;
};

export default function Sessions() {
  return (
    <Stack gap="sm" align="center">
      <Title order={2} c="rgb(73, 105, 137)" ta="center">
        Your Next Training Sessions
      </Title>
      <ExampleWithProviders />
      <Divider my="sm" variant="dashed" />
    </Stack>
  );
}

const Example = () => {
  const columns = useMemo<MRT_ColumnDef<Session>[]>(
    () => [
      {
        accessorKey: "member_name",
        header: "Member Name",
      },
      {
        accessorKey: "begin_time",
        header: "Starts at",
      },
      {
        accessorKey: "end_time",
        header: "Ends at",
      },
      {
        accessorKey: "description",
        header: "Description",
      },
    ],
    []
  );

  //call READ hook
  const {
    data: fetchedSessions = [],
    isError: isLoadingSessionsError,
    isFetching: isFetchingSessions,
    isLoading: isLoadingSessions,
  } = useGetSessions();

  const table = useMantineReactTable({
    columns,
    data: fetchedSessions,
    createDisplayMode: "row", // ('modal', and 'custom' are also available)
    enableEditing: false,
    enableRowSelection: false,
    enableMultiRowSelection: false, //shows radio buttons instead of checkboxes
    // getRowId: (row) => row.availability_id.toString(),
    mantineToolbarAlertBannerProps: isLoadingSessionsError
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
      isLoading: isLoadingSessions,
      showAlertBanner: isLoadingSessionsError,
      showProgressBars: isFetchingSessions,
    },
  });

  return <MantineReactTable table={table} />;
};

//READ hook (get users from api)
function useGetSessions() {
  const { data: session } = useSession();

  return useQuery<Session[]>({
    queryKey: ["Sessions"],
    queryFn: async () => {
      //send api request here
      const response = await fetch("/api/trainer/getSessions", {
        method: "POST",
        body: JSON.stringify({ trainer_name: session?.user?.username }),
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
