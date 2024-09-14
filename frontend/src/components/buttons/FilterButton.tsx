import { Button } from "@mui/material";

interface FilterButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

export default function FilterButton({ label, isActive, onClick }: FilterButtonProps) {
    return (
        <Button
            onClick={onClick}
            variant="contained"
            sx={{
                backgroundColor: isActive ? '#333' : 'transparent', // Dark color for active button
                color: isActive ? '#fff' : '#333', // Light color for text on active button
                '&:hover': {
                    backgroundColor: isActive ? '#555' : 'rgba(0, 0, 0, 0.1)', // Darker shade on hover
                },
                borderRadius: 50,
                border: isActive ? '1px solid #444' : '1px solid transparent' // Optional border for better visual separation
            }}
        >
            {label}
        </Button>
    );
}
