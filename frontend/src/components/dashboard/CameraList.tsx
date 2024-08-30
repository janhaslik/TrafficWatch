import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableSortLabel } from "@mui/material";
import { styled } from '@mui/system';
import { TrafficCameraDetailsId } from "../../interfaces/camera";
import { Link } from "react-router-dom";
import { AspectRatio, CameraAlt, Place, Visibility } from "@mui/icons-material";

interface CameraListProps {
    cameras: TrafficCameraDetailsId[];
}

const StyledTableCell = styled(TableCell)(() => ({
    fontWeight: 'bold',
    padding: '10px',
    textAlign: 'left',
}));

const StyledLink = styled(Link)(() => ({
    fontFamily: 'Untitled Sans, sans-serif',
    fontSize: '14px',
    lineHeight: '20px',
    color: '#3574d6',
    fontWeight: 400,
    textDecoration: 'none',
    '&:hover': {
        textDecoration: 'underline',
    }
}));

interface StatusCellProps {
    status: string;
}

const StatusBox = styled('div')<StatusCellProps>(({ status }) => ({
    backgroundColor: status === 'Active' ? '#F6FEEC' : '#FFF3F1',
    color: status === 'Active' ? '#A5E187' : '#FB7980',
    borderRadius: '50px',
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
    padding: '8px 16px',
    textAlign: 'center',
    fontWeight: 'bold',
    display: 'inline-block',
    width: "max-content",
}));

const IconLabel = styled('div')(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
}));

export default function CameraList(props: CameraListProps) {

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <StyledTableCell>
                            <TableSortLabel>
                                <IconLabel>
                                    <CameraAlt />
                                    Label
                                </IconLabel>
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>
                            <TableSortLabel>
                                <IconLabel>
                                    <Place />
                                    Location
                                </IconLabel>
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>
                            <TableSortLabel>
                                <IconLabel>
                                    <Visibility/>
                                    Status
                                </IconLabel>
                            </TableSortLabel>
                        </StyledTableCell>
                        <StyledTableCell>
                            <TableSortLabel>
                                <IconLabel>
                                    <AspectRatio />
                                    Resolution
                                </IconLabel>
                            </TableSortLabel>
                        </StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.cameras.length > 0 ? (
                        props.cameras.map((camera: TrafficCameraDetailsId) => (
                            <TableRow key={camera.id}>
                                <TableCell>
                                    <StyledLink to={`/cameras/${camera.id}`}>
                                        {camera.label}
                                    </StyledLink>
                                </TableCell>
                                <TableCell>{camera.location}</TableCell>
                                <TableCell>
                                    <StatusBox status={camera.status}>
                                        {camera.status}
                                    </StatusBox>
                                </TableCell>
                                <TableCell>{camera.resolution}</TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4}>No cameras available.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
