import {
    Table,
    ScrollArea,
    UnstyledButton,
    Group,
    Text,
    Center,
    rem,
} from "@mantine/core";
import classes from "./metricsTable.module.css";
import { useState } from "react";
import cx from "clsx";
import {
    IconSelector,
    IconChevronDown,
    IconChevronUp,
} from "@tabler/icons-react";

const metricsData = [
    {
        date: "2022-01-01",
        weight: "180 lbs",
        bodyfat: "15%",
        bloodpressure: "120/80",
    },
    {
        date: "2022-01-02",
        weight: "179 lbs",
        bodyfat: "14%",
        bloodpressure: "118/78",
    },
    {
        date: "2022-01-03",
        weight: "178 lbs",
        bodyfat: "13%",
        bloodpressure: "116/76",
    },
    {
        date: "2022-01-04",
        weight: "177 lbs",
        bodyfat: "12%",
        bloodpressure: "114/74",
    },
    {
        date: "2022-01-05",
        weight: "176 lbs",
        bodyfat: "11%",
        bloodpressure: "112/72",
    },
    {
        date: "2022-01-06",
        weight: "175 lbs",
        bodyfat: "10%",
        bloodpressure: "110/70",
    },
    {
        date: "2022-01-07",
        weight: "175 lbs",
        bodyfat: "10%",
        bloodpressure: "110/70",
    },
    {
        date: "2022-01-08",
        weight: "175 lbs",
        bodyfat: "10%",
        bloodpressure: "110/70",
    },
    {
        date: "2022-01-09",
        weight: "175 lbs",
        bodyfat: "10%",
        bloodpressure: "110/70",
    },
    {
        date: "2022-01-10",
        weight: "175 lbs",
        bodyfat: "10%",
        bloodpressure: "110/70",
    },
    {
        date: "2022-01-11",
        weight: "175 lbs",
        bodyfat: "10%",
        bloodpressure: "110/70",
    },
    {
        date: "2022-01-12",
        weight: "175 lbs",
        bodyfat: "10%",
        bloodpressure: "110/70",
    },
];

interface MetricRowData {
    date: string;
    weight: string;
    bodyfat: string;
    bloodpressure: string;
}

interface ThProps {
    children: React.ReactNode;
    reversed: boolean;
    sorted: boolean;
    onSort(): void;
}

function Th({ children, reversed, sorted, onSort }: ThProps) {
    const Icon = sorted
        ? reversed
            ? IconChevronDown
            : IconChevronUp
        : IconSelector;

    return (
        <Table.Th className={classes.th}>
            <UnstyledButton onClick={onSort} className={classes.control}>
                <Group justify="space-between">
                    <Text fw={500} fz="sm">
                        {children}
                    </Text>
                    <Center className={classes.icon}>
                        <Icon
                            style={{ width: rem(16), height: rem(16) }}
                            stroke={1.5}
                        />
                    </Center>
                </Group>
            </UnstyledButton>
        </Table.Th>
    );
}

function sortData(
    data: MetricRowData[],
    payload: { sortBy: keyof MetricRowData | null; reversed: boolean }
) {
    const { sortBy } = payload;

    if (!sortBy) {
        return data;
    }

    return [...data].sort((a, b) => {
        if (payload.reversed) {
            return b[sortBy].localeCompare(a[sortBy]);
        }

        return a[sortBy].localeCompare(b[sortBy]);
    });
}

export default function MetricsTable() {
    const [scrolled, setScrolled] = useState(false);
    const [sortedData, setSortedData] = useState(metricsData);
    const [sortBy, setSortBy] = useState<keyof MetricRowData | null>(null);
    const [reverseSortDirection, setReverseSortDirection] = useState(false);

    const setSorting = (field: keyof MetricRowData) => {
        const reversed = field === sortBy ? !reverseSortDirection : false;
        setReverseSortDirection(reversed);
        setSortBy(field);
        setSortedData(sortData(metricsData, { sortBy: field, reversed }));
    };

    const rows = sortedData.map((metric) => (
        <Table.Tr key={metric.date}>
            <Table.Td>{metric.date}</Table.Td>
            <Table.Td>{metric.weight}</Table.Td>
            <Table.Td>{metric.bodyfat}</Table.Td>
            <Table.Td>{metric.bloodpressure}</Table.Td>
        </Table.Tr>
    ));

    return (
        <ScrollArea
            type="auto"
            h={300}
            onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
        >
            <Table
                striped
                highlightOnHover
                miw={900}
                maw={800}
                w={800}
                horizontalSpacing="md"
            >
                <Table.Thead
                    className={cx(classes.header, {
                        [classes.scrolled]: scrolled,
                    })}
                >
                    <Table.Tr>
                        <Th
                            sorted={sortBy === "date"}
                            reversed={reverseSortDirection}
                            onSort={() => setSorting("date")}
                        >
                            Date
                        </Th>
                        <Th
                            sorted={sortBy === "weight"}
                            reversed={reverseSortDirection}
                            onSort={() => setSorting("weight")}
                        >
                            Weight
                        </Th>
                        <Th
                            sorted={sortBy === "bodyfat"}
                            reversed={reverseSortDirection}
                            onSort={() => setSorting("bodyfat")}
                        >
                            Bodyfat%
                        </Th>
                        <Th
                            sorted={sortBy === "bloodpressure"}
                            reversed={reverseSortDirection}
                            onSort={() => setSorting("bloodpressure")}
                        >
                            Blood Pressure
                        </Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>
        </ScrollArea>
    );
}
