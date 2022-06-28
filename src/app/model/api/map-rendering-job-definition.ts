import {UserObject} from "./user-object";

export interface MapRenderingJobDefinition {
    Data: MapData;
}

export interface MapRenderingJobExecution {
    Data: MapDataReference;
}

export interface MapData {
    Type: "maps";
    ID: string;
    Attributes: MapAttributes;
}

export interface MapDataReference {
    Type: "maps";
    ID: string;
}

export interface MapData {
    Type: "maps";
    ID: string;
    Attributes: MapAttributes;
}

export interface MapAttributes {
    Fileformat: FileFormat
    Scale: number
    PrintWidth: number
    PrintHeight: number
    Latitude: number
    Longitude: number
    Style: MapStyle,
    Projection: "3857"
    HideLayers: string
    UserObjects: UserObject[]
}

export enum FileFormat {
    PNG = "png",
    PDF = "pdf",
    SVG = "svg",
}

export enum MapStyle {
    OSM_CARTO = "osm-carto",
    OSM_CARTO_MONO = "osm-carto-mono",
    OSM_CARTO_ELE20 = "osm-carto-ele20",
    SCHWARZPLAN = "schwarzplan",
    SCHWARZPLAN_PLUS = "schwarzplan+",
    RASTER10 = "raster10",
    TRANSPARENT = "transparent"
}