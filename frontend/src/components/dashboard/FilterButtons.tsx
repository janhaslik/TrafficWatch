import { Box } from "@mui/material";
import FilterButton from "../buttons/FilterButton";

interface FilterButtonData {
    label: string;
    value: 'day' | 'hour' | 'minute' | 'second';
}

interface FilterButtonsProps {
    filter: 'day' | 'hour' | 'minute' | 'second';
    setFilter: (filter: 'day' | 'hour' | 'minute' | 'second') => void;
}

const filterButtons: FilterButtonData[] = [
    { label: 'By Day', value: 'day' },
    { label: 'By Hour', value: 'hour' },
    { label: 'By Minute', value: 'minute' },
    { label: 'By Second', value: 'second' },
];

export default function FilterButtons({ filter, setFilter }: FilterButtonsProps) {
    return (
        <Box display={"flex"} flexDirection={"row"} gap={1} my={2}>
            {filterButtons.map(({ label, value }) => (
                <FilterButton
                    key={value}
                    label={label}
                    isActive={filter === value}
                    onClick={() => setFilter(value)}
                />
            ))}
        </Box>
    );
}
