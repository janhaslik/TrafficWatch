import "../../styles/cameraspage.css";

interface CameraItemInterface {
    label: string;
    location: string;
}

export default function CameraItem(props: CameraItemInterface) {
    return (
        <div className="camera-item">
            <span className="camera-label">{props.label}</span>
            <span className="camera-location">{props.location}</span>
        </div>
    );
}
