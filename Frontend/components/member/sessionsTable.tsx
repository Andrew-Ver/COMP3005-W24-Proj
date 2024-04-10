import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; //if using mantine date picker features
import "mantine-react-table/styles.css"; //make sure MRT styles were imported in your app root (once)
import { useEffect, useMemo } from "react";
import {
  MantineReactTable,
  type MRT_ColumnDef,
  useMantineReactTable,
} from "mantine-react-table";
import { Stack, Title, Divider, Button, Text } from "@mantine/core";
import { modals } from "@mantine/modals";

import { QueryClient, useQuery } from "@tanstack/react-query";

import { useSession } from "next-auth/react";
import { showNotification } from "@mantine/notifications";

type Session = {
  session_id: number;
  name: string;
  begin_time: string;
  end_time: string;
  description: string;
  is_completed: boolean;
};

export default function SessionsTable() {
  return (
    <Stack gap="sm" align="center">
      <Title order={2} c="rgb(73, 105, 137)" ta="center">
        Upcoming Personal Training Session
      </Title>
      <Table />
    </Stack>
  );
}

const Table = () => {
  const columns = useMemo<MRT_ColumnDef<Session>[]>(
    () => [
      {
        accessorKey: "trainer_name",
        header: "Trainer",
      },
      {
        accessorKey: "begin_time",
        header: "Begin Time",
      },
      {
        accessorKey: "end_time",
        header: "End Time",
      },
      {
        accessorKey: "description",
        header: "Description",
      },
    ],
    []
  );

  const queryClient = new QueryClient();

  //call READ hook
  const {
    data: fetchedSessions = [],
    isError: isLoadingSessionsError,
    isFetching: isFetchingSessions,
    isLoading: isLoadingSessions,
    refetch
  } = useGetSessions();

  const table = useMantineReactTable({
    columns,
    data: fetchedSessions,
    createDisplayMode: "row", // ('modal', and 'custom' are also available)
    enableEditing: false,
    enableRowSelection: true,
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
    renderTopToolbarCustomActions: ({ table }) => {
      // Check if any rows are selected
      const isRowSelected = table.getSelectedRowModel().rows.length > 0;

      return (
        <Button
          onClick={handleMarkAsCompleted}
          // Disable the button if no rows are selected
          disabled={!isRowSelected}
        >
          Mark as completed
        </Button>
      );
    },
  });

  const handleMarkAsCompleted = () => {
    modals.openConfirmModal({
      title: "Please confirm completion",
      children: (
        <Text size="sm">
          Are you sure you want to mark the selected sessions as completed?
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onCancel: () => console.log("Cancel"),
      onConfirm: () => handleCompletionConfirmed(),
    });
  };

  const handleCompletionConfirmed = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const session_ids: number[] = selectedRows.map(
      (row) => row.original.session_id
    );
    try {
      const response = await fetch("/api/member/personal-training/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ session_ids }),
      });

      if (response.ok) {
        modals.closeAll();

        // Show success notification
        showNotification({
          title: "Success",
          message: "Thank you for using our service!",
          color: "green",
        });

        table.toggleAllRowsSelected(false);
        await refetch();
      } else {
        console.error("Error submitting data: ", response.statusText);
      }
    } catch (error) {
      console.error("Network error: ", error);
    } finally {

      await queryClient.invalidateQueries({queryKey: ["Sessions"]});
    }
  };

  return <MantineReactTable table={table} />;
};

//READ hook (get users from api)
function useGetSessions() {
  const { data: session } = useSession();

  return useQuery<Session[]>({
    queryKey: ["Sessions"],
    queryFn: async () => {
      //send api request here
      const response = await fetch(
        "/api/member/personal-training/getUpcoming",
        {
          method: "POST",
          body: JSON.stringify({ member_username: session?.user?.username }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      return data;
    },
    refetchOnWindowFocus: true,
  });
}
