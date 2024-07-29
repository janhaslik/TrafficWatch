import { TrafficCameraRecord } from "./cameraRecord";

export interface TrafficCamera {
    id: string;
    label: string;
    location: string;
    status: string;
    resolution: string;
    records: TrafficCameraRecord[];
}

export interface TrafficCameraDetails {
    label: string;
    location: string;
    status: string;
    resolution: string;
}

export interface TrafficCameraDetailsId {
    id: string;
    label: string;
    location: string;
    status: string;
    resolution: string;
}