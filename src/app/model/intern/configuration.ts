import {GeoCoordinates} from "./geo-coordinates";

export interface Configuration {
    printmapsApiBaseUri: string,
    defaultCoordinates: GeoCoordinates,
    autoUploadIntervalInSeconds: number,
    mapStatePollingIntervalInSeconds: number
}