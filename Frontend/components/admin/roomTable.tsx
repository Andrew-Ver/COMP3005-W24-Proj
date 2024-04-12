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
  id: string;
  room_id: string;
  description: string;
};

export default function RoomTable() {
  return (
    <Stack gap="sm" align="center">
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
        accessorKey: "room_id",
        header: "Room ID",
        enableEditing: false,
      },
      {
        accessorKey: "description",
        header: "Description",
        minSize: 300,
        mantineEditTextInputProps: {
          type: "string",
          required: true,
          error: validationErrors?.description,
          //remove any previous validation errors when user focuses on the input
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              description: undefined,
            }),
        },
      },
    ],
    [validationErrors],
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
  //call UPDATE hook
  const { mutateAsync: updateRoom, isPending: isUpdatingRoom } =
    useUpdateRoom();
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

  //UPDATE action
  const handleSaveRoom: MRT_TableOptions<Room>["onEditingRowSave"] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateRoom(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateRoom(values);
    table.setEditingRow(null); //exit editing mode
  };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<Room>) =>
    modals.openConfirmModal({
      title: "Confirm Room Deletion?",
      children: <Text>Are you sure you want to delete this Room?</Text>,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteRoom(row.original.room_id),
    });

  const table = useMantineReactTable({
    columns,
    data: fetchedRooms,
    createDisplayMode: "row", // ('modal', and 'custom' are also available)
    editDisplayMode: "row", // ('modal', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    getRowId: (row) => row.id,
    mantineToolbarAlertBannerProps: isLoadingRoomsError
      ? {
          color: "red",
          children: "Error loading data",
        }
      : undefined,
    mantineTableContainerProps: {
      style: {
        // minHeight: "200px",
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateRoom,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveRoom,
    renderRowActions: ({ row, table }) => (
      <Flex gap="md" justify="center">
        <Tooltip label="Edit">
          <ActionIcon onClick={() => table.setEditingRow(row)}>
            <IconEdit />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete">
          <ActionIcon color="red" onClick={() => openDeleteConfirmModal(row)}>
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
        {"  "}New Room
      </Button>
    ),
    state: {
      isLoading: isLoadingRooms,
      isSaving: isCreatingRoom || isUpdatingRoom || isDeletingRoom,
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
      const response = await fetch("/api/room/create", {
        method: "POST",
        // In body, send session?.user?.username, weight, body_fat_percentage, and blood_pressure
        body: JSON.stringify({
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
      queryClient.setQueryData(
        ["Rooms"],
        (prevRooms: any) =>
          [
            ...prevRooms,
            {
              ...newRoomInfo,
              time: new Date().toISOString(),
              id: (Math.random() + 1).toString(36).substring(7),
            },
          ] as Room[],
      );
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
      const response = await fetch("/api/room/get", {
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

//UPDATE hook (put user in api)
function useUpdateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (Room: Room) => {
      //send api update request here
      const response = await fetch("/api/room/update", {
        method: "POST",
        body: JSON.stringify({
          room_id: Room.room_id,
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
      queryClient.setQueryData(
        ["Rooms"],
        (prevRooms: any) =>
          [
            ...prevRooms,
            {
              ...newRoomInfo,
              id: (Math.random() + 1).toString(36).substring(7),
            },
          ] as Room[],
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["Rooms"] }), //refetch users after mutation, disabled for demo
  });
}

//DELETE hook (delete user in api)
function useDeleteRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (room_id: string) => {
      //send api request here
      const response = await fetch("/api/room/delete", {
        method: "POST",
        body: JSON.stringify({ room_id }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      return data;
    },
    //client side optimistic update
    onMutate: (id: string) => {
      queryClient.setQueryData(["Rooms"], (prevRooms: any) =>
        prevRooms?.filter((Room: Room) => Room.id !== id),
      );
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
