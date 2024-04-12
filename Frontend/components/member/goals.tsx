import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; //if using mantine date picker features
import "mantine-react-table/styles.css"; //make sure MRT styles were imported in your app root (once)
import { useMemo, useState, useEffect } from "react";
import {
  MantineReactTable,
  type MRT_ColumnDef,
  type MRT_TableOptions,
  useMantineReactTable,
} from "mantine-react-table";
import { Stack, Button } from "@mantine/core";
import { modals } from "@mantine/modals";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useSession } from "next-auth/react";
import { showNotification } from "@mantine/notifications";
import { CirclePlus } from "tabler-icons-react";

type Goal = {
  member_username: string;
  goal_type: string;
  achieved: boolean;
};

export default function GoalsTable() {
  return (
    <Stack gap="sm" align="center">
      <GoalTable />
    </Stack>
  );
}

const GoalTable = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const queryClient = useQueryClient();

  const columns = useMemo<MRT_ColumnDef<Goal>[]>(
    () => [
      {
        accessorKey: "goal_type",
        header: "Goal",
        mantineEditTextInputProps: {
          type: "text",
          required: true,
          error: validationErrors?.description,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              description: undefined,
            }),
        },
      },
    ],
    [],
  );

  const { mutateAsync: createGoal, isPending: isCreatingGoal } =
    useCreateGoal();
  //call READ hook
  const {
    data: fetchedGoals = [],
    isError: isLoadingGoalsError,
    isFetching: isFetchingGoals,
    isLoading: isLoadingGoals,
    refetch: refetchGoals,
  } = useGetGoals();

  const { isLoading, error, data } = useGetGoals();

  useEffect(() => {
    if (!isLoading && !error && data) {
      refetchGoals();
    }
  }, [isLoading, error, data, refetchGoals]);

  const handleCreateGoal: MRT_TableOptions<Goal>["onCreatingRowSave"] = async ({
    values,
    exitCreatingMode,
  }) => {
    const newValidationErrors = validateGoal(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createGoal(values);
    exitCreatingMode();
    refetchGoals();
  };

  const table = useMantineReactTable({
    columns,
    data: fetchedGoals,
    createDisplayMode: "row", // ('modal', and 'custom' are also available)
    enableRowActions: false,
    enableRowSelection: true,
    enableMultiRowSelection: false, //shows radio buttons instead of checkboxes
    // getRowId: (row) => row.availability_id.toString(),
    mantineToolbarAlertBannerProps: isLoadingGoalsError
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
      isLoading: isLoadingGoals,
      showAlertBanner: isLoadingGoalsError,
      showProgressBars: isFetchingGoals,
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateGoal,
    renderTopToolbarCustomActions: ({ table }) => {
      // Check if any rows are selected
      const isRowSelected = table.getSelectedRowModel().rows.length > 0;

      return (
        <>
          <Button
            onClick={() => {
              table.toggleAllRowsSelected(false);
              table.setCreatingRow(true);
            }}
          >
            <CirclePlus />
            {"  "}New Goal
          </Button>
          <Button
            onClick={handleCompletionConfirmed}
            // Disable the button if no rows are selected
            disabled={!isRowSelected}
          >
            Mark as achieved
          </Button>
        </>
      );
    },
  });

  const handleCompletionConfirmed = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const goal_types: string[] = selectedRows.map(
      (row) => row.original.goal_type,
    );
    try {
      const response = await fetch("/api/member/goals/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          member_username: session?.user?.username,
          goal_types,
        }),
      });

      if (response.ok) {
        modals.closeAll();

        // Show success notification
        showNotification({
          title: "Success",
          message: "Goals marked as achieved!",
          color: "green",
        });

        table.toggleAllRowsSelected(false);
        await queryClient.invalidateQueries();
      } else {
        console.error("Error submitting data: ", response.statusText);
      }
    } catch (error) {
      console.error("Network error: ", error);
    }
  };

  // After press the button
  const { data: session } = useSession();

  return <MantineReactTable table={table} />;
};

//READ hook (get users from api)
function useGetGoals() {
  const { data: session } = useSession();

  return useQuery<Goal[]>({
    queryKey: ["goals"],
    queryFn: async () => {
      //send api request here
      const response = await fetch("/api/member/goals/getOngoing", {
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

const validateRequired = (value: string) => {
  return value.length >= 5;
};

function validateGoal(goal: Goal) {
  return {
    description: !validateRequired(goal.goal_type)
      ? "Description >= length 5 is required."
      : "",
  };
}

function useCreateGoal() {
  const { data: session } = useSession();

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (Goal: Goal) => {
      // Set time to current time.
      //   Goal.metric_timestamp = new Date().toISOString();
      //send api request here
      const response = await fetch("/api/member/goals/create", {
        method: "POST",
        // In body, send session?.user?.username, weight, body_fat_percentage, and blood_pressure
        body: JSON.stringify({
          member_username: session?.user?.username,
          goal_type: Goal.goal_type,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      return data;
    },
    //client side optimistic update
    onMutate: (newGoalInfo: Goal) => {
      queryClient.setQueryData(["goals"], (prevGoals: any) => [] as Goal[]);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["goals"] }), //refetch users after mutation, disabled for demo
  });
}
