import {
    Table,
    ScrollArea,
    UnstyledButton,
    Group,
    Text,
    Center,
    rem,
} from "@mantine/core";
import classes from "./specialtyTable.module.css";
import { useState } from "react";
import cx from "clsx";
import {
    IconSelector,
    IconChevronDown,
    IconChevronUp,
} from "@tabler/icons-react";

interface SpecialtyRowData {
    specialty: string;
}

const specialtiesData = [
    {
        specialty: "Weight Loss",
    },
    {
        specialty: "Strength Training",
    },
];

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
    data: SpecialtyRowData[],
    payload: { sortBy: keyof SpecialtyRowData | null; reversed: boolean }
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

export default function SpecialtyTable() {
    const [scrolled, setScrolled] = useState(false);
    const [sortedData, setSortedData] = useState(specialtiesData);
    const [sortBy, setSortBy] = useState<keyof SpecialtyRowData | null>(null);
    const [reverseSortDirection, setReverseSortDirection] = useState(false);

    const setSorting = (field: keyof SpecialtyRowData) => {
        const reversed = field === sortBy ? !reverseSortDirection : false;
        setReverseSortDirection(reversed);
        setSortBy(field);
        setSortedData(sortData(specialtiesData, { sortBy: field, reversed }));
    };

    const rows = sortedData.map((specialty) => (
        <Table.Tr key={specialty.specialty}>
            <Table.Td>{specialty.specialty}</Table.Td>
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
            sorted={sortBy === "specialty"}
    reversed={reverseSortDirection}
    onSort={() => setSorting("specialty")}
>
    Specialty
    </Th>
    </Table.Tr>
    </Table.Thead>
    <Table.Tbody>{rows}</Table.Tbody>
    </Table>
    </ScrollArea>
);
}
