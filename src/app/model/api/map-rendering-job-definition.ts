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
    UserObjects: []
}

export enum FileFormat {
    PNG = "png",
    SVG = "svg",
    PDF = "pdf"
}

export const FILE_FORMATS = new Map<FileFormat, string>([
    [FileFormat.SVG, FileFormat.SVG],
    [FileFormat.PNG, FileFormat.PNG],
    [FileFormat.PDF, FileFormat.PDF]
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

export const MAP_STYLES = new Map<MapStyle, string>([
    [MapStyle.OSM_CARTO, MapStyle.OSM_CARTO],
    [MapStyle.OSM_CARTO_MONO, MapStyle.OSM_CARTO_MONO],
    [MapStyle.OSM_CARTO_ELE20, MapStyle.OSM_CARTO_ELE20],
    [MapStyle.SCHWARZPLAN, MapStyle.SCHWARZPLAN],
    [MapStyle.SCHWARZPLAN_PLUS, MapStyle.SCHWARZPLAN_PLUS],
    [MapStyle.RASTER10, MapStyle.RASTER10],
    [MapStyle.TRANSPARENT, MapStyle.TRANSPARENT]
]);
