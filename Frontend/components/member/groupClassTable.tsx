import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; //if using mantine date picker features
import "mantine-react-table/styles.css"; //make sure MRT styles were imported in your app root (once)
import { useEffect, useMemo } from "react";
import {
  MantineReactTable,
  type MRT_ColumnDef,
  useMantineReactTable,
} from "mantine-react-table";
import { Stack, Divider, Button } from "@mantine/core";
import { modals } from "@mantine/modals";

import { QueryClient, useQuery } from "@tanstack/react-query";
import { showNotification } from "@mantine/notifications";

import { useSession } from "next-auth/react";

type GroupClass = {
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
  return (
    <Stack gap="sm" align="center">
      <Table />
      <Divider my="sm" variant="dashed" />
    </Stack>
  );
}

const Table = () => {
  const queryClient = new QueryClient();

  const columns = useMemo<MRT_ColumnDef<GroupClass>[]>(
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
      },
      {
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
    data: fetchedGroupClasses = [],
    isError: isLoadingGroupClassesError,
    isFetching: isFetchingGroupClasses,
    isLoading: isLoadingGroupClasses,
    refetch: refetchGroupClasses,
  } = useGetGroupClasses();

  const { isLoading, error, data } = useGetGroupClasses();

  useEffect(() => {
    if (!isLoading && !error && data) {
      refetchGroupClasses();
    }
  }, [isLoading, error, data, refetchGroupClasses]);

  const table = useMantineReactTable({
    columns,
    data: fetchedGroupClasses,
    createDisplayMode: "row", // ('modal', and 'custom' are also available)
    enableEditing: false,
    enableRowSelection: (row) => row.original.signed_up == false,
    enableMultiRowSelection: false, //shows radio buttons instead of checkboxes

    // getRowId: (row) => row.availability_id.toString(),
    mantineToolbarAlertBannerProps: isLoadingGroupClassesError
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
      isLoading: isLoadingGroupClasses,
      showAlertBanner: isLoadingGroupClassesError,
      showProgressBars: isFetchingGroupClasses,
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
  const { data: session } = useSession();

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
        // console.log("Data submitted successfully:", dataToSend);
        modals.closeAll();

        // Show success notification
        showNotification({
          title: "Success",
          message: "Booking successful!",
          color: "green",
        });
        await queryClient.invalidateQueries();
        table.toggleAllRowsSelected(false);
      } else {
        // Handle error response
        console.error("Error submitting data:", response.statusText);
        // Show success notification
        showNotification({
          title: "Error",
          message: "You have already booked this group class",
          color: "red",
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
function useGetGroupClasses() {
  const { data: session } = useSession();

  const member_username = session?.user?.username;
  return useQuery<GroupClass[]>({
    queryKey: ["classes"],
    queryFn: async () => {
      //send api request here
      const response = await fetch("/api/group-class/get", {
        method: "POST",
        body: JSON.stringify({ member_username }),
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
