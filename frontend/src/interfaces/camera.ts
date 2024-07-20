import { TrafficCameraRecord } from "./cameraRecord";

export interface TrafficCamera {
    label: string;
    records: TrafficCameraRecord[];
}
