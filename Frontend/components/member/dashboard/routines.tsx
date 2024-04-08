import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; //if using mantine date picker features
import "mantine-react-table/styles.css"; //make sure MRT styles were imported in your app root (once)
import { useEffect, useMemo, useState } from "react";
import {
  MantineReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
} from "mantine-react-table";
import {
  ActionIcon,
  Button,
  Flex,
  Text,
  Tooltip,
  Stack,
  Title,
  Divider,
} from "@mantine/core";
import { ModalsProvider, modals } from "@mantine/modals";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { CirclePlus } from "tabler-icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useSession } from "next-auth/react";

type Room = {
  member_username: string;
  description: string;
};

export default function Routines() {
  return (
    <Stack gap="sm" align="center">
      <Title order={2} c="rgb(73, 105, 137)" ta="center">
        Your Exercise Routines
      </Title>
      <Example />
      <Divider my="sm" variant="dashed" />
    </Stack>
  );
}

const Example = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const columns = useMemo<MRT_ColumnDef<Room>[]>(
    () => [
      {
        accessorKey: "description",
        header: "Routine",
        minSize: 300,
      },
    ],
    [validationErrors]
  );

  //call CREATE hook
  const { mutateAsync: createRoom, isPending: isCreatingRoom } =
    useCreateRoom();
  //call READ hook
  const {
    data: fetchedRooms = [],
    isError: isLoadingRoomsError,
    isFetching: isFetchingRooms,
    isLoading: isLoadingRooms,
  } = useGetRooms();
  //call DELETE hook
  const { mutateAsync: deleteRoom, isPending: isDeletingRoom } =
    useDeleteRoom();

  //CREATE action
  const handleCreateRoom: MRT_TableOptions<Room>["onCreatingRowSave"] = async ({
    values,
    exitCreatingMode,
  }) => {
    const newValidationErrors = validateRoom(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createRoom(values);
    exitCreatingMode();
  };



  const table = useMantineReactTable({
    columns,
    data: fetchedRooms,
    createDisplayMode: "row", // ('modal', and 'custom' are also available)
    editDisplayMode: "row", // ('modal', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    //getRowId: (row) => row.id,
    mantineToolbarAlertBannerProps: isLoadingRoomsError
      ? {
          color: "red",
          children: "Error loading data",
        }
      : undefined,
    mantineTableContainerProps: {
      style: {
        minHeight: "500px",
        minWidth: "500px",
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateRoom,
    renderRowActions: ({ row, table }) => (
      <Flex gap="md" justify="center">
        <Tooltip label="Delete">
          <ActionIcon color="red" onClick={() => deleteRoom(row.original.description)}>
            <IconTrash />
          </ActionIcon>
        </Tooltip>
      </Flex>
    ),
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
        {"  "}New Routine
      </Button>
    ),
    state: {
      isLoading: isLoadingRooms,
      isSaving: isCreatingRoom || isDeletingRoom,
      showAlertBanner: isLoadingRoomsError,
      showProgressBars: isFetchingRooms,
    },
  });

  return <MantineReactTable table={table} />;
};

//CREATE hook (post new user to api)
function useCreateRoom() {
  const { data: session, status } = useSession();

  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (Room: Room) => {
      // Set time to current time.
      //   Room.Room_timestamp = new Date().toISOString();
      //send api request here
      const response = await fetch("/api/member/routine/create", {
        method: "POST",
        // In body, send session?.user?.username, weight, body_fat_percentage, and blood_pressure
        body: JSON.stringify({
          member_username: session?.user?.username,
          description: Room.description,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      return data;
    },
    //client side optimistic update
    onMutate: (newRoomInfo: Room) => {
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["Rooms"] }), //refetch users after mutation, disabled for demo
  });
}

//READ hook (get users from api)
function useGetRooms() {
  const { data: session, status } = useSession();

  // TODO: add code to the following block
  useEffect(() => {
    // Fetch data when the component mounts or when session changes
    if (session) {
      // Fetch data from the API
      // This will automatically trigger the useGetRooms hook
      // and update the fetchedRooms state
    }
  }, [session]);

  return useQuery<Room[]>({
    queryKey: ["Rooms"],
    queryFn: async () => {
      //send api request here
      const response = await fetch("/api/member/routine/get", {
        method: "POST",
        body: JSON.stringify({
            member_username: session?.user?.username,
        }),
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

//DELETE hook (delete user in api)
function useDeleteRoom() {
  const queryClient = useQueryClient();
    const { data: session, status } = useSession();
  return useMutation({
    mutationFn: async (RoomID: string) => {
      //send api request here
      const response = await fetch("/api/member/routine/delete", {
        method: "POST",
        // Send timestamp and username
        body: JSON.stringify({
          member_username: session?.user?.username,
            description: RoomID,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      return data;
    },
    //client side optimistic update
    onMutate: (id: string) => {
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["Rooms"] }), //refetch users after mutation, disabled for demo
  });
}

const validateRequired = (value: string) => !!value.length;

function validateRoom(Room: Room) {
  return {
    description: !validateRequired(Room.description)
      ? "Description is Required"
      : "",
  };
}
