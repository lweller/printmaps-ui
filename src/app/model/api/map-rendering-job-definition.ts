import {UserObject} from "./user-object";
import {Ordered} from "../../utils/common.util";

export interface MapRenderingJobDefinition {
    Data: MapData
}

export interface MapRenderingJobExecution {
    Data: MapDataReference
}

export interface MapData {
    Type: "maps"
    ID: string
    Attributes: MapAttributes
}

export interface MapDataReference {
    Type: "maps"
    ID: string
}

export interface MapData {
    Type: "maps"
    ID: string
    Attributes: MapAttributes
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

class FileFormatProperties implements Ordered {
    constructor(public readonly label: string,
                public readonly order: number) {
    }

    public toString(): string {
        return this.label;
    }
}

export const FILE_FORMATS = new Map<FileFormat, FileFormatProperties>([
    [FileFormat.PNG, new FileFormatProperties(FileFormat.PNG, 1)],
    [FileFormat.PDF, new FileFormatProperties(FileFormat.PDF, 2)],
    [FileFormat.SVG, new FileFormatProperties(FileFormat.SVG, 3)]
]);

export enum MapStyle {
    OSM_CARTO = "osm-carto",
    OSM_CARTO_MONO = "osm-carto-mono",
    OSM_CARTO_ELE20 = "osm-carto-ele20",
    SCHWARZPLAN = "schwarzplan",
    SCHWARZPLAN_PLUS = "schwarzplan+",
    RASTER10 = "raster10",
    TRANSPARENT = "transparent"
}

class MapStyleProperties implements Ordered {
    constructor(public readonly label: string,
                public readonly attribution: string,
                public readonly order: number) {
    }

    public toString(): string {
        return this.label;
    }
}

const DEFAULT_OSM_COPYRIGHT = "© OpenStreetMap contributors (ODbL)";

export const MAP_STYLES = new Map<MapStyle, MapStyleProperties>([
    [MapStyle.OSM_CARTO, new MapStyleProperties(MapStyle.OSM_CARTO, DEFAULT_OSM_COPYRIGHT, 1)],
    [MapStyle.OSM_CARTO_MONO, new MapStyleProperties(MapStyle.OSM_CARTO_MONO, DEFAULT_OSM_COPYRIGHT, 2)],
    [MapStyle.OSM_CARTO_ELE20, new MapStyleProperties(MapStyle.OSM_CARTO_ELE20, DEFAULT_OSM_COPYRIGHT
        + ", © opensnowmap.org (based on ASTER GDEM, SRTM, EU-DEM)", 3)],
    [MapStyle.SCHWARZPLAN, new MapStyleProperties(MapStyle.SCHWARZPLAN, DEFAULT_OSM_COPYRIGHT, 4)],
    [MapStyle.SCHWARZPLAN_PLUS, new MapStyleProperties(MapStyle.SCHWARZPLAN_PLUS, DEFAULT_OSM_COPYRIGHT, 5)],
    [MapStyle.RASTER10, new MapStyleProperties(MapStyle.RASTER10, "no copy right", 6)],
    [MapStyle.TRANSPARENT, new MapStyleProperties(MapStyle.TRANSPARENT, "no copy right", 7)]
]);
