import { useMemo, useState, useEffect } from 'react'
import {
    MantineReactTable,
    type MRT_ColumnDef,
    type MRT_TableOptions,
    useMantineReactTable
} from 'mantine-react-table'
import { Button, Text, Stack, Title, Tabs, Center } from '@mantine/core'
import { CirclePlus } from 'tabler-icons-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useSession } from 'next-auth/react'

type Metric = {
    id: string
    metric_timestamp: string
    weight: string
    body_fat_percentage: string
    blood_pressure: string
}

export default function MetricTable() {
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string | undefined>
    >({})

    const columns = useMemo<MRT_ColumnDef<Metric>[]>(
        () => [
            {
                accessorKey: 'metric_timestamp',
                header: 'Time',
                enableEditing: false,
                size: 80
            },
            {
                accessorKey: 'weight',
                header: 'Weight (lbs)',
                mantineEditTextInputProps: {
                    type: 'number',
                    required: true,
                    error: validationErrors?.weight,
                    //remove any previous validation errors when user focuses on the input
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            weight: undefined
                        })
                    //optionally add validation checking for onBlur or onChange
                }
            },
            {
                accessorKey: 'body_fat_percentage',
                header: 'Bodyfat (%)',
                mantineEditTextInputProps: {
                    type: 'number',
                    required: true,
                    withAsterisk: true,
                    error: validationErrors?.body_fat_percentage,
                    //remove any previous validation errors when user focuses on the input
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            bodyfat: undefined
                        })
                }
            },
            {
                accessorKey: 'blood_pressure',
                header: 'Blood Pressure',
                mantineEditTextInputProps: {
                    type: 'text',
                    required: true,
                    placeholder: 'Ex. 120/80',
                    error: validationErrors?.blood_pressure,
                    //remove any previous validation errors when user focuses on the input
                    onFocus: () =>
                        setValidationErrors({
                            ...validationErrors,
                            bloodPressure: undefined
                        })
                }
            }
        ],
        [validationErrors]
    )

    //call CREATE hook
    const { mutateAsync: createMetric, isPending: isCreatingMetric } =
        useCreateMetric()

    //call READ hook
    const {
        data: fetchedMetrics = [],
        isError: isLoadingMetricsError,
        isFetching: isFetchingMetrics,
        isLoading: isLoadingMetrics,
        refetch: refetchMetrics
    } = useGetMetrics()

    const { isLoading, error, data } = useGetMetrics()

    useEffect(() => {
        if (!isLoading && !error && data) {
            refetchMetrics()
        }
    }, [isLoading, error, data, refetchMetrics])

    const handleCreateMetric: MRT_TableOptions<Metric>['onCreatingRowSave'] =
        async ({ values, exitCreatingMode }) => {
            const newValidationErrors = validateMetric(values)
            if (Object.values(newValidationErrors).some((error) => error)) {
                setValidationErrors(newValidationErrors)
                return
            }
            setValidationErrors({})
            await createMetric(values)
            exitCreatingMode()
            refetchMetrics()
        }

    const table = useMantineReactTable({
        columns,
        data: fetchedMetrics,
        createDisplayMode: 'row', // ('modal', and 'custom' are also available)
        editDisplayMode: 'row', // ('modal', 'cell', 'table', and 'custom' are also available)
        enableRowActions: false,
        getRowId: (row) => row.metric_timestamp,
        mantineToolbarAlertBannerProps: isLoadingMetricsError
            ? {
                  color: 'red',
                  children: 'Error loading data'
              }
            : undefined,
        mantineTableContainerProps: {
            style: {
                minHeight: '500px',
                minWidth: '800px'
            }
        },
        state: {
            isLoading: isLoadingMetrics,
            showAlertBanner: isLoadingMetricsError,
            showProgressBars: isFetchingMetrics
        },
        onCreatingRowCancel: () => setValidationErrors({}),
        onCreatingRowSave: handleCreateMetric,
        onEditingRowCancel: () => setValidationErrors({}),

        renderTopToolbarCustomActions: ({ table }) => (
            <Button
                onClick={() => {
                    table.setCreatingRow(true)
                }}
            >
                <CirclePlus />
                {'  '}Metric
            </Button>
        )
    })

    return <MantineReactTable table={table} />
}

//CREATE hook (post new metric to api)
function useCreateMetric() {
    const { data: session } = useSession()

    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (metric: Metric) => {
            //send api request here
            const response = await fetch('/api/user/metrics/create', {
                method: 'POST',
                // In body, send session?.user?.username, weight, body_fat_percentage, and blood_pressure
                body: JSON.stringify({
                    username: session?.user?.username,
                    weight: metric.weight,
                    body_fat_percentage: metric.body_fat_percentage,
                    blood_pressure: metric.blood_pressure
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const data = await response.json()

            return data
        },

        onMutate: (newMetricInfo: Metric) => {
            queryClient.setQueryData(
                ['metrics'],
                (prevMetrics: any) => [] as Metric[]
            )
        },
        onSettled: () =>
            queryClient.invalidateQueries({ queryKey: ['metrics'] }) //refetch users after mutation, disabled for demo
    })
}

//READ hook (get users from api)
function useGetMetrics() {
    const { data: session } = useSession()

    return useQuery<Metric[]>({
        queryKey: ['metrics'],
        queryFn: async () => {
            //send api request here
            const response = await fetch('/api/user/metrics/get', {
                method: 'POST',
                body: JSON.stringify({ username: session?.user?.username }),
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

const validateWeight = (value: string) => {
    const regex = /^\d{2,3}$/
    return regex.test(value)
}

const validateBodyFat = (value: string) => {
    const regex = /^\d{1,2}$/
    if (!regex.test(value)) {
        return false
    }
    const bodyFat = parseInt(value)
    return bodyFat >= 5 && bodyFat <= 50
}

const validateBloodPressure = (value: string) => {
    const regex = /^\d{2,3}\/\d{2,3}$/
    if (!regex.test(value)) {
        return false
    }
    /*
    Check if systolic is greater than diastolic
    for the database constraint requirement
  */
    const [firstPart, secondPart] = value.split('/')
    const firstPartNumber = parseInt(firstPart)
    const secondPartNumber = parseInt(secondPart)
    return firstPartNumber > secondPartNumber
}

function validateMetric(metric: Metric) {
    return {
        metric_timestamp: '',
        weight: !validateWeight(metric.weight)
            ? 'Weight is Required in format: 10 - 999 lbs'
            : '',
        body_fat_percentage: !validateBodyFat(metric.body_fat_percentage)
            ? 'Bodyfat is required and must be a valid percentage'
            : '',
        blood_pressure: !validateBloodPressure(metric.blood_pressure)
            ? 'Blood Pressure reading is Required in format: 120/80, and must be systolic > diastolic'
            : ''
    }
}
