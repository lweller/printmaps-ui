import {FileFormat, MapStyle} from "../api/map-rendering-job-definition";

export interface MapOptions {
    mapStyle: MapStyle;
    fileFormat: FileFormat;
}