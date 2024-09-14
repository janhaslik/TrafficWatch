import { Button } from "@mui/material";

interface DefaultButtonProps {
    label: string;
    onClick: () => void;
}

export default function DefaultButton({ label, onClick }: DefaultButtonProps){
    return (
        <Button
            onClick={onClick}
            variant="contained"
            sx={{
                backgroundColor: '#333',
                color: '#fff',
                '&:hover': {
                    backgroundColor: '#555'
                },
                borderRadius: 50,
                border: '1px solid #444'
            }}
        >
            {label}
        </Button>
    );
}
