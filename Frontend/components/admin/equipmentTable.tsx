import { ActionIcon, Button, Stack, Text, Title, Tooltip } from '@mantine/core'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css' //if using mantine date picker features
import { modals } from '@mantine/modals'
import {
    MantineReactTable,
    type MRT_ColumnDef,
    type MRT_Row,
    type MRT_TableOptions,
    useMantineReactTable
} from 'mantine-react-table'
import 'mantine-react-table/styles.css' //make sure MRT styles were imported in your app root (once)
import { useEffect, useState } from 'react'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { showNotification } from '@mantine/notifications'
import { IconTrash } from '@tabler/icons-react'
import { CirclePlus } from 'tabler-icons-react'

type Equipment = {
    equipment_id: number
    description: string
    room_id: string
    room_name: string
    needs_maintenance: boolean
    last_maintained_at: string
}

interface Room {
    room_id: string
    description: string
}

interface EquipmentRooms {
    roomIds: string[]
}

export default function EquipmentTable() {
    return (
        <Stack gap="sm" align="center">
            <Title order={2} c="rgb(73, 105, 137)" ta="center">
                Equipment Management Administration
            </Title>
            <Example />
        </Stack>
    )
}

const Example = () => {
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string | undefined>
    >({})

    const [roomIds, setRoomIds] = useState<string[]>([])
    const [columns, setColumns] = useState<MRT_ColumnDef<Equipment>[]>([])

    const fetchRoomIds = async () => {
        try {
            const response = await fetch(`/api/room/get`, {
                method: 'POST', // Use POST for sending data
                headers: { 'Content-Type': 'application/json' }
            })
            const data: Room[] = await response.json()
            const ids = data.map((room: Room) => room.room_id.toString())
            setRoomIds(ids)
        } catch (error) {
            console.error('Error fetching class ids:', error)
        }
    }

    useEffect(() => {
        // sort the fetched room ids
        fetchRoomIds()
        setRoomIds(roomIds.sort())
    }, [roomIds])

    useEffect(() => {
        setColumns([
            {
                accessorKey: 'equipment_id',
                header: 'Equipment ID',
                enableEditing: false
            },
            {
                accessorKey: 'description',
                header: 'Description',
                enableEditing: true,
                mantineEditTextInputProps: {
                    type: 'text',
                    required: true,
                    placeholder: 'Description',
                    error: validationErrors?.description
                }
            },
            {
                accessorKey: 'room_id',
                header: 'Room ID',
                editVariant: 'select',
                mantineEditSelectProps: {
                    data: roomIds,
                    defaultValue: [roomIds[0] as string],
                    error: validationErrors?.room_id
                }
            },
            {
                accessorKey: 'room_name',
                header: 'Room Name',
                enableEditing: false
            },
            {
                accessorKey: 'needs_maintenance',
                header: 'Needs maintenance',
                accessorFn: (row) => {
                    return row.needs_maintenance ? 'Yes' : 'No'
                },
                enableEditing: false
            },
            {
                accessorKey: 'last_maintained_at',
                header: 'Last Maintained At',
                enableEditing: false
            }
        ])
    }, [roomIds, validationErrors])

    const queryClient = useQueryClient()

    //call CREATE hook
    const { mutateAsync: createEquipment, isPending: isCreatingEquipment } =
        useCreateEquipment()
    const { mutateAsync: updateMetric, isPending: isUpdatingEquipment } =
        useUpdateMetric()
    //call READ hook
    const {
        data: fetchedEquipment = [],
        isError: isLoadingEquipmentError,
        isFetching: isFetchingEquipment,
        isLoading: isLoadingEquipment
    } = useGetEquipment()

    const handleCreateEquipment: MRT_TableOptions<Equipment>['onCreatingRowSave'] =
        async ({ values, exitCreatingMode }) => {
            const newValidationErrors = validateMetric(values)
            if (Object.values(newValidationErrors).some((error) => error)) {
                setValidationErrors(newValidationErrors)
                return
            }
            setValidationErrors({})
            await createEquipment(values)
            exitCreatingMode()
        }

    const handleSaveMetric: MRT_TableOptions<Equipment>['onEditingRowSave'] =
        async ({ values, table }) => {
            const newValidationErrors = validateMetric(values)
            if (Object.values(newValidationErrors).some((error) => error)) {
                setValidationErrors(newValidationErrors)
                return
            }
            setValidationErrors({})
            await updateMetric(values)
            table.setEditingRow(null) //exit editing mode
        }

    const table = useMantineReactTable({
        columns,
        data: fetchedEquipment,
        createDisplayMode: 'row', // ('modal', and 'custom' are also available)
        enableEditing: true,
        enableRowSelection: true,
        enableMultiRowSelection: false, //shows radio buttons instead of checkboxes
        // getRowId: (row) => row.availability_id.toString(),
        mantineToolbarAlertBannerProps: isLoadingEquipmentError
            ? {
                  color: 'red',
                  children: 'Error loading data'
              }
            : undefined,
        mantineTableContainerProps: {
            style: {
                minHeight: '400px'
            }
        },
        state: {
            isSaving: isCreatingEquipment || isUpdatingEquipment,
            isLoading: isLoadingEquipment,
            showAlertBanner: isLoadingEquipmentError,
            showProgressBars: isFetchingEquipment
        },
        onCreatingRowCancel: () => setValidationErrors({}),
        onCreatingRowSave: handleCreateEquipment,
        onEditingRowCancel: () => setValidationErrors({}),
        onEditingRowSave: handleSaveMetric,
        renderTopToolbarCustomActions: ({ table }) => {
            // Check if any rows are selected
            const isRowSelected = table.getSelectedRowModel().rows.length > 0

            return (
                <>
                    <Button
                        onClick={() => {
                            table.toggleAllRowsSelected(false)
                            table.setCreatingRow(true)
                        }}
                    >
                        <CirclePlus />
                        {'  '}New Equipment
                    </Button>
                    <Button
                        onClick={handleMarkAsNeedsMaintenance}
                        // Disable the button if no rows are selected
                        disabled={!isRowSelected}
                    >
                        Mark as Needs Maintenance
                    </Button>
                    <Button
                        onClick={handleMarkAsMaintained}
                        // Disable the button if no rows are selected
                        disabled={!isRowSelected}
                    >
                        Mark as Maintained
                    </Button>
                    <Tooltip label="Delete">
                        <ActionIcon
                            color="red"
                            onClick={() =>
                                openDeleteConfirmModal(
                                    table.getSelectedRowModel().rows[0]
                                )
                            }
                        >
                            <IconTrash />
                        </ActionIcon>
                    </Tooltip>
                </>
            )
        }
    })

    const openDeleteConfirmModal = (row: MRT_Row<Equipment>) =>
        modals.openConfirmModal({
            title: 'Confirm Equipment Deletion?',
            children: (
                <Text>
                    Are you sure you want to delete this equipment entry? This
                    action cannot be undone.
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red' },
            onConfirm: () => handleDeleteEquipment()
        })
    const handleMarkAsNeedsMaintenance = async () => {
        const selectedRows = table.getSelectedRowModel().rows
        const equipment_id: number[] = selectedRows.map(
            (row) => row.original.equipment_id
        )
        try {
            const response = await fetch('/api/equipment/mark', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ equipment_id })
            })

            if (response.ok) {
                modals.closeAll()

                // Show success notification
                showNotification({
                    title: 'Success',
                    message: 'Maintenance request recorded!',
                    color: 'green'
                })

                table.toggleAllRowsSelected(false)
                await queryClient.invalidateQueries({
                    queryKey: ['equipmentRoom']
                })
            } else {
                console.error('Error submitting data: ', response.statusText)
            }
        } catch (error) {
            console.error('Network error: ', error)
        }
    }

    const handleMarkAsMaintained = async () => {
        const selectedRows = table.getSelectedRowModel().rows
        const equipment_id: number[] = selectedRows.map(
            (row) => row.original.equipment_id
        )
        try {
            const response = await fetch('/api/equipment/maintain', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ equipment_id })
            })

            if (response.ok) {
                modals.closeAll()

                // Show success notification
                showNotification({
                    title: 'Success',
                    message: 'Maintenance completion recorded!',
                    color: 'green'
                })

                table.toggleAllRowsSelected(false)
                await queryClient.invalidateQueries({
                    queryKey: ['equipmentRoom']
                })
            } else {
                console.error('Error submitting data: ', response.statusText)
            }
        } catch (error) {
            console.error('Network error: ', error)
        }
    }
    const handleDeleteEquipment = async () => {
        const selectedRows = table.getSelectedRowModel().rows
        const equipment_id: number[] = selectedRows.map(
            (row) => row.original.equipment_id
        )
        try {
            const response = await fetch('/api/equipment/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ equipment_id })
            })

            if (response.ok) {
                modals.closeAll()

                // Show success notification
                showNotification({
                    title: 'Success',
                    message: 'Equipment removed!',
                    color: 'green'
                })

                await queryClient.invalidateQueries({
                    queryKey: ['equipmentRoom']
                })
                table.toggleAllRowsSelected(false)
            } else {
                console.error('Error submitting data: ', response.statusText)
            }
        } catch (error) {
            console.error('Network error: ', error)
        }
    }

    // After press the button

    return <MantineReactTable table={table} />
}

function useUpdateMetric() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (metric: Equipment) => {
            //send api update request here
            const response = await fetch('/api/equipment/update', {
                method: 'POST',
                body: JSON.stringify({
                    equipment_id: metric.equipment_id,
                    room_id: metric.room_id,
                    description: metric.description
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const data = await response.json()
            return data
        },
        //client side optimistic update
        onMutate: (newMetricInfo: Equipment) => {
            queryClient.setQueryData(
                ['equipmentRoom'],
                (prevequipmentRoom: any) => [] as Equipment[]
            )
        },
        onSettled: () =>
            queryClient.invalidateQueries({ queryKey: ['equipmentRoom'] }) //refetch users after mutation, disabled for demo
    })
}

function useCreateEquipment() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (metric: Equipment) => {
            // Set time to current time.
            //   metric.metric_timestamp = new Date().toISOString();
            //send api request here
            const response = await fetch('/api/equipment/add', {
                method: 'POST',
                // In body, send session?.user?.username, weight, body_fat_percentage, and blood_pressure
                body: JSON.stringify({
                    description: metric.description,
                    room_id: metric.room_id
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const data = await response.json()

            return data
        },
        //client side optimistic update
        onMutate: (newEquipmentInfo: Equipment) => {
            queryClient.setQueryData(
                ['equipmentRoom'],
                (prevequipmentRoom: any) => [] as Equipment[]
            )
        },
        onSettled: () =>
            queryClient.invalidateQueries({ queryKey: ['equipmentRoom'] }) //refetch users after mutation, disabled for demo
    })
}

//READ hook (get users from api)
function useGetEquipment() {
    return useQuery<Equipment[]>({
        queryKey: ['equipmentRoom'],
        queryFn: async () => {
            //send api request here
            const response = await fetch('/api/equipment/get', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const data = await response.json()

            return data
        },
        refetchOnWindowFocus: true
    })
}

const validateRequired = (value: string) => !!value.length

function validateMetric(equipment: Equipment) {
    return {
        description: !validateRequired(equipment.description)
            ? 'Description is Required'
            : '',
        room_id: !validateRequired(equipment.room_id)
            ? 'Room ID is Required'
            : ''
    }
}
