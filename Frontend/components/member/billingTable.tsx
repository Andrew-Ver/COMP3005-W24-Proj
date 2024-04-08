import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; //if using mantine date picker features
import "mantine-react-table/styles.css"; //make sure MRT styles were imported in your app root (once)
import { useEffect, useMemo, useState } from "react";
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

type Bill = {
  bill_id: number;
  member_username: string;
  amount: number;
  description: string;
  bill_timestamp: string;
  cleared: boolean;
};

export default function BillingTable() {
  const { data: session } = useSession();

  // TODO: add code to the following block
  useEffect(() => {
    // Fetch data when the component mounts or when session changes
    if (session) {
      // Fetch data from the API
      // This will automatically trigger the useGetBills hook
      // and update the fetchedBills state
    }
  }, [session]);

  return (
    <Stack gap="sm" align="center">
      <Title order={2} c="rgb(73, 105, 137)" ta="center">
        Billings for Member {session?.user?.name}
      </Title>
      <Example />
      <Divider my="sm" variant="dashed" />
    </Stack>
  );
}

const Example = () => {
  const queryClient = new QueryClient();

  const columns = useMemo<MRT_ColumnDef<Bill>[]>(
    () => [
      {
        accessorKey: "bill_id",
        header: "Bill ID",
      },
      {
        accessorKey: "member_username",
        header: "Member Username",
      },
      {
        accessorKey: "amount",
        header: "Amount",
      },
      {
        accessorKey: "description",
        header: "Description",
      },
      {
        accessorKey: "bill_timestamp",
        header: "Bill Timestamp",
      },
      {
        accessorKey: "cleared",
        header: "Cleared?",
        accessorFn: (row) => {
          return row.cleared ? "Paid" : "Not paid";
        },
      },
    ],
    []
  );

  //call READ hook
  const {
    data: fetchedBills = [],
    isError: isLoadingBillsError,
    isFetching: isFetchingBills,
    isLoading: isLoadingBills,
  } = useGetBills();

  const table = useMantineReactTable({
    columns,
    data: fetchedBills,
    createDisplayMode: "row", // ('modal', and 'custom' are also available)
    enableEditing: false,
    enableRowSelection: (row) => row.original.cleared == false,
    enableMultiRowSelection: true, //shows radio buttons instead of checkboxes
    // getRowId: (row) => row.availability_id.toString(),
    mantineToolbarAlertBannerProps: isLoadingBillsError
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
      isLoading: isLoadingBills,
      showAlertBanner: isLoadingBillsError,
      showProgressBars: isFetchingBills,
    },
    renderTopToolbarCustomActions: ({ table }) =>
      table.getSelectedRowModel().rows.length > 0 ? (
        <Button onClick={handlePaySelected}>Pay Selected Bills</Button>
      ) : (
        <Button disabled onClick={handlePaySelected}>
          Pay Selected Bills
        </Button>
      ),
  });

  const handlePaySelected = () => {
    modals.openConfirmModal({
      title: "Please confirm your payment:",
      children: (
        <Text size="sm">
          Are you sure you want to pay for the selected bills?
        </Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onCancel: () => console.log("Cancel Payment modal"),
      onConfirm: () => handlePaymentConfirmed(),
    });
  };

  const handlePaymentConfirmed = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const bill_ids: number[] = selectedRows.map((row) => row.original.bill_id);
    try {
      const response = await fetch("/api/member/billing/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bill_ids }),
      });

      if (response.ok) {
        modals.closeAll();

        // Show success notification
        showNotification({
          title: "Success",
          message: "Payment successful!",
          color: "green",
        });

        await queryClient.invalidateQueries();
        table.toggleAllRowsSelected(false);
      } else {
        console.error("Error submitting data: ", response.statusText);
      }
    } catch (error) {
      console.error("Network error: ", error);
    }
  };

  return <MantineReactTable table={table} />;
};

//READ hook (get users from api)
function useGetBills() {
  const { data: session } = useSession();

  return useQuery<Bill[]>({
    queryKey: ["bills"],
    queryFn: async () => {
      //send api request here
      const response = await fetch("/api/member/billing/get", {
        method: "POST",
        body: JSON.stringify({ member_username: session?.user?.username }),
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
